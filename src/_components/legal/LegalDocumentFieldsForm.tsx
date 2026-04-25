/** @format */

'use client';

import { useRouter } from 'next/navigation';
import { type ComponentProps, useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  createLegalDocument,
  deleteLegalDocument,
  updateLegalDocument,
} from '@/_actions/legal/legalCms';
import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import {
  LEGAL_DOCUMENT_STATUS_OPTIONS,
  LEGAL_DOCUMENT_TYPES,
} from '@/_constants/legal';
import NAVIGATION from '@/_constants/navigation';
import { normalizeApiError } from '@/_lib/apiError';
import type {
  CreateLegalDocumentPayload,
  LegalDocument,
  LegalDocumentStatus,
  LegalDocumentType,
  UpdateLegalDocumentPayload,
} from '@/_types/legal';

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<'form'>['onSubmit']>
>[0];

type LegalDocumentFieldsFormErrors = Readonly<{
  title?: string;
  version?: string;
  status?: string;
}>;

function formatDateTime(value?: string): string {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString();
}

function validateForm(
  title: string,
  version: string,
  status: LegalDocumentStatus,
  currentStatus?: LegalDocumentStatus,
): LegalDocumentFieldsFormErrors {
  const errors: Record<string, string> = {};

  if (!title.trim()) {
    errors.title = 'Title is required.';
  }

  const parsedVersion = Number(version);
  if (!Number.isFinite(parsedVersion) || parsedVersion <= 0) {
    errors.version = 'Version must be greater than zero.';
  }

  if (currentStatus === 'PUBLISHED' && status === 'DRAFT') {
    errors.status =
      'Published legal documents cannot be moved back to draft.';
  }

  return errors;
}

function getFirstError(errors: LegalDocumentFieldsFormErrors): string | null {
  if (errors.title) {
    return errors.title;
  }

  if (errors.version) {
    return errors.version;
  }

  return errors.status ?? null;
}

export default function LegalDocumentFieldsForm({
  document,
  readOnly = false,
}: Readonly<{
  document?: LegalDocument | null;
  readOnly?: boolean;
}>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(document?.title ?? '');
  const [type, setType] = useState<LegalDocumentType>(document?.type ?? 'TERMS');
  const [version, setVersion] = useState(document?.version.toString() ?? '1.0');
  const [status, setStatus] = useState<LegalDocumentStatus>(
    document?.status ?? 'DRAFT',
  );
  const [errors, setErrors] = useState<LegalDocumentFieldsFormErrors>({});
  const isEdit = Boolean(document);
  const isArchived = document?.status === 'ARCHIVED' || readOnly;

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();

    const nextErrors = validateForm(title, version, status, document?.status);
    const firstError = getFirstError(nextErrors);

    if (firstError) {
      setErrors(nextErrors);
      toast.error(firstError);
      return;
    }

    if (status === 'ARCHIVED') {
      toast.error('Archived legal documents are read-only.');
      return;
    }

    setErrors({});

    startTransition(async function submitLegalDocument() {
      try {
        const writableStatus: CreateLegalDocumentPayload['status'] = status;
        const payload = {
          title: title.trim(),
          type,
          version: Number(version),
          status: writableStatus,
        } satisfies CreateLegalDocumentPayload | UpdateLegalDocumentPayload;

        const savedDocument = isEdit
          ? await updateLegalDocument(document.id, payload as UpdateLegalDocumentPayload)
          : await createLegalDocument(payload as CreateLegalDocumentPayload);

        toast.success(
          isEdit ? 'Legal document updated.' : 'Legal document created.',
        );
        setTitle(savedDocument.title);
        setType(savedDocument.type);
        setVersion(savedDocument.version.toString());
        setStatus(savedDocument.status);
        router.push(NAVIGATION.LEGAL_BY_ID(savedDocument.id));
        router.refresh();
      } catch (error) {
        const normalized = normalizeApiError(error);
        toast.error(
          normalized.data.message || 'We could not save the legal document.',
        );
      }
    });
  }

  function handleDeleteOrArchive() {
    if (!document) {
      return;
    }

    const message =
      document.status === 'DRAFT'
        ? 'This will permanently delete the legal document. Continue?'
        : 'This will archive the legal document. Continue?';

    if (!(globalThis.window?.confirm(message) ?? false)) {
      return;
    }

    startTransition(async function deleteCurrentDocument() {
      try {
        await deleteLegalDocument(document.id);
        toast.success(
          document.status === 'DRAFT'
            ? 'Legal document deleted.'
            : 'Legal document archived.',
        );
        router.push(NAVIGATION.LEGAL);
        router.refresh();
      } catch (error) {
        const normalized = normalizeApiError(error);
        toast.error(
          normalized.data.message ||
            'We could not delete this legal document.',
        );
      }
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Section>
        <Grid gap={16}>
          <Grid gap={12}>
            <TextInput
              label='Title'
              value={title}
              onChange={function handleTitleChange(event) {
                setTitle(event.currentTarget.value);
                setErrors(function clearTitleError(previousErrors) {
                  return {
                    ...previousErrors,
                    title: undefined,
                  };
                });
              }}
              error={Boolean(errors.title)}
              helperText={errors.title}
              disabled={isPending || isArchived}
              required
            />

            <Grid columns={3} gap={16}>
              <Select
                label='Type'
                value={type}
                onChange={function handleTypeChange(event) {
                  setType(event.currentTarget.value as LegalDocumentType);
                }}
                disabled={isPending || isArchived}
              >
                {LEGAL_DOCUMENT_TYPES.map(function renderType(option) {
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                })}
              </Select>

              <TextInput
                label='Version'
                value={version}
                onChange={function handleVersionChange(event) {
                  setVersion(event.currentTarget.value);
                  setErrors(function clearVersionError(previousErrors) {
                    return {
                      ...previousErrors,
                      version: undefined,
                    };
                  });
                }}
                type='number'
                step='0.1'
                min='0.1'
                error={Boolean(errors.version)}
                helperText={errors.version}
                disabled={isPending || isArchived}
                required
              />

              {document ? (
                <TextInput label='Status' value={status} disabled />
              ) : (
                <Select
                  label='Status'
                  value={status}
                  onChange={function handleStatusChange(event) {
                    setStatus(event.currentTarget.value as LegalDocumentStatus);
                    setErrors(function clearStatusError(previousErrors) {
                      return {
                        ...previousErrors,
                        status: undefined,
                      };
                    });
                  }}
                  error={Boolean(errors.status)}
                  helperText={errors.status}
                  disabled={isPending || isArchived}
                >
                  {LEGAL_DOCUMENT_STATUS_OPTIONS.map(function renderStatus(option) {
                    return (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    );
                  })}
                  {isArchived ? <option value='ARCHIVED'>Archived</option> : null}
                </Select>
              )}
            </Grid>

            {document ? (
              <Grid columns={2} gap={16}>
                <TextInput
                  label='Created at'
                  value={formatDateTime(document.created_at)}
                  disabled
                />
                <TextInput
                  label='Updated at'
                  value={formatDateTime(document.updated_at)}
                  disabled
                />
              </Grid>
            ) : null}
          </Grid>

          <ButtonGroup gap={8}>
            {!readOnly ? (
              <Button type='submit' disabled={isPending || isArchived}>
                {isPending
                  ? isEdit
                    ? 'Saving...'
                    : 'Creating...'
                  : isEdit
                    ? 'Save document'
                    : 'Create document'}
              </Button>
            ) : null}
            {document && !readOnly ? (
              <Button
                type='button'
                variant='borderless'
                onClick={handleDeleteOrArchive}
                disabled={isPending || isArchived}
              >
                {document.status === 'DRAFT' ? 'Delete' : 'Archive'}
              </Button>
            ) : null}
            <Button
              href={NAVIGATION.LEGAL}
              variant='borderless'
              disabled={isPending}
            >
              Back
            </Button>
          </ButtonGroup>
        </Grid>
      </Section>
    </Form>
  );
}
