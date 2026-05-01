/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createBrand } from '@/_actions/brand/createBrand';
import { updateBrand } from '@/_actions/brand/updateBrand';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import { resolveLocalizedBrandErrorMessage } from '@/_constants/brandErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';
import type { Brand, BrandActionState } from '@/_types/brand';

const INITIAL_STATE: BrandActionState = { status: 'idle' };

type BrandFormProps = Readonly<{
  brand?: Brand | null;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '--';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';

  return parsed.toLocaleString();
}

export default function BrandForm({
  brand,
  edit = false,
  cancelHref,
  successHref,
}: BrandFormProps) {
  const router = useRouter();
  const { dictionary } = useI18n();

  const [editState, editAction, editPending] = useActionState<
    BrandActionState,
    FormData
  >(updateBrand, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    BrandActionState,
    FormData
  >(createBrand, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(
        resolveLocalizedBrandErrorMessage(
          actionState.error,
          dictionary.brands.errors,
          dictionary.common.unexpectedError,
        ),
      );
      return;
    }

    if (edit) {
      toast.success('Brand updated successfully.');
      router.push(successHref ?? NAVIGATION.BRAND_BY_ID(brand?.id ?? ''));
      router.refresh();
      return;
    }

    toast.success('Brand created successfully.');
    if (actionState.brandId) {
      router.push(NAVIGATION.BRAND_BY_ID(actionState.brandId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.BRANDS);
    router.refresh();
  }, [
    actionState.brandId,
    actionState.error,
    actionState.status,
    brand?.id,
    dictionary.brands.errors,
    dictionary.common.unexpectedError,
    edit,
    router,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.BRANDS);
  }, [cancelHref, router]);

  return (
    <Form action={formAction}>
      {edit && brand ? (
        <>
          <input type='hidden' name='brandId' value={brand.id} />
          <input type='hidden' name='original_name' value={brand.name} />
          <input
            type='hidden'
            name='original_websiteUrl'
            value={brand.websiteUrl ?? ''}
          />
          <input
            type='hidden'
            name='original_iconImageUrl'
            value={brand.iconImageUrl ?? ''}
          />
          <input
            type='hidden'
            name='original_detailImageUrl'
            value={brand.detailImageUrl ?? ''}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={String(brand.isActive)}
          />
        </>
      ) : null}

      <Section>
        <Grid gap={8} columns={2}>
          <TextInput
            label='Brand name'
            name='name'
            placeholder='e.g. Adidas'
            defaultValue={brand?.name ?? ''}
            required
            disabled={isPending}
          />
          <TextInput
            label='Website URL'
            name='websiteUrl'
            type='url'
            placeholder='https://...'
            defaultValue={brand?.websiteUrl ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Icon image URL'
            name='iconImageUrl'
            type='url'
            placeholder='https://...'
            defaultValue={brand?.iconImageUrl ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Detail image URL'
            name='detailImageUrl'
            type='url'
            placeholder='https://...'
            defaultValue={brand?.detailImageUrl ?? ''}
            disabled={isPending}
          />
          <CheckBoxInput
            label='Active'
            name='isActive'
            value='true'
            defaultChecked={brand?.isActive ?? true}
            disabled={isPending}
          />
        </Grid>

        {edit && brand ? (
          <Grid gap={8} columns={2} className='margin-top--16'>
            <TextInput label='ID' defaultValue={brand.id} readOnly disabled />
            <TextInput label='Slug' defaultValue={brand.slug} readOnly disabled />
            <TextInput
              label='Created at'
              defaultValue={formatDateTime(brand.createdAt)}
              readOnly
              disabled
            />
            <TextInput
              label='Updated at'
              defaultValue={formatDateTime(brand.updatedAt)}
              readOnly
              disabled
            />
          </Grid>
        ) : null}

        <ButtonGroup gap={4} className='margin-top--24'>
          <Button type='submit' disabled={isPending} aria-busy={isPending}>
            {isPending
              ? edit
                ? 'Updating brand...'
                : 'Creating brand...'
              : edit
                ? 'Update brand'
                : 'Create brand'}
          </Button>
          <Button
            type='button'
            onClick={handleCancel}
            disabled={isPending}
            variant='borderless'
          >
            Cancel
          </Button>
        </ButtonGroup>
      </Section>
    </Form>
  );
}
