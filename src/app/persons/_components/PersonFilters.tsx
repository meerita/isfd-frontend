/** @format */
/**
 * @file src/app/persons/_components/PersonFilters.tsx
 * @description Renders the localized filter form for the persons list.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import {
  getPersonCurrentProfessionOptions,
  getPersonGenderOptions,
  type PersonCurrentProfession,
  type PersonGender,
} from '@/_constants/enums/person';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type { PersonSort, PersonStatusFilter } from '@/_types/person';

type PersonFiltersProps = Readonly<{
  pageSize: number;
  sort: PersonSort;
  status?: PersonStatusFilter;
  gender?: PersonGender;
  currentProfession?: PersonCurrentProfession;
}>;

const FILTERS_TOAST_ID = 'persons-filters-loading';

export default function PersonFilters({
  pageSize,
  sort,
  status,
  gender,
  currentProfession,
}: PersonFiltersProps): React.JSX.Element {
  const { dictionary } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(
    function syncFilterToast(): void {
      if (!hasPendingNavigationRef.current) {
        return;
      }

      hasPendingNavigationRef.current = false;
      toast.dismiss(FILTERS_TOAST_ID);
    },
    [currentProfession, gender, pageSize, sort, status],
  );

  const handleSubmit = useCallback(
    function handleSubmit(): void {
      hasPendingNavigationRef.current = true;
      toast.loading(dictionary.persons.filters.updating, {
        id: FILTERS_TOAST_ID,
      });
    },
    [dictionary.persons.filters.updating],
  );

  const handleChange = useCallback(
    function handleChange(): void {
      handleSubmit();
      formRef.current?.requestSubmit();
    },
    [handleSubmit],
  );

  return (
    <form
      ref={formRef}
      method='GET'
      action={NAVIGATION.PERSONS}
      onSubmit={handleSubmit}
    >
      <Grid gap={8} columns={6} alignItems='end'>
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />

        <Select
          label={dictionary.persons.filters.sort}
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='updated_at_desc'>
            {dictionary.persons.filters.updatedDesc}
          </option>
          <option value='updated_at_asc'>
            {dictionary.persons.filters.updatedAsc}
          </option>
          <option value='created_at_desc'>
            {dictionary.persons.filters.createdDesc}
          </option>
          <option value='created_at_asc'>
            {dictionary.persons.filters.createdAsc}
          </option>
          <option value='full_name_asc'>
            {dictionary.persons.filters.fullNameAsc}
          </option>
          <option value='full_name_desc'>
            {dictionary.persons.filters.fullNameDesc}
          </option>
          <option value='display_name_asc'>
            {dictionary.persons.filters.displayNameAsc}
          </option>
          <option value='display_name_desc'>
            {dictionary.persons.filters.displayNameDesc}
          </option>
          <option value='is_public_desc'>
            {dictionary.persons.filters.publicFirst}
          </option>
          <option value='is_public_asc'>
            {dictionary.persons.filters.privateFirst}
          </option>
        </Select>

        <Select
          label={dictionary.persons.filters.status}
          name='status'
          defaultValue={status ?? 'all'}
          onChange={handleChange}
        >
          <option value='all'>{dictionary.common.all}</option>
          <option value='public'>{dictionary.persons.filters.publicStatus}</option>
          <option value='private'>{dictionary.persons.filters.privateStatus}</option>
        </Select>

        <Select
          label={dictionary.persons.filters.gender}
          name='gender'
          defaultValue={gender ?? ''}
          onChange={handleChange}
        >
          <option value=''>{dictionary.persons.filters.anyGender}</option>
          {getPersonGenderOptions().map(
            function renderGenderOption(option): React.JSX.Element {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            },
          )}
        </Select>

        <Select
          label={dictionary.persons.filters.currentProfession}
          name='current_profession'
          defaultValue={currentProfession ?? ''}
          onChange={handleChange}
        >
          <option value=''>{dictionary.persons.filters.anyProfession}</option>
          {getPersonCurrentProfessionOptions().map(
            function renderProfessionOption(option): React.JSX.Element {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            },
          )}
        </Select>

        <Grid display='flex' gap={8} alignItems='center'>
          <Button type='submit'>{dictionary.common.apply}</Button>
          <Button href={NAVIGATION.PERSONS} variant='borderless'>
            {dictionary.common.reset}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
