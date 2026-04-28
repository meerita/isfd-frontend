/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type {
  FederationLevel,
  FederationSort,
  FederationStatusFilter,
} from '@/_types/federation';

type FederationFiltersProps = Readonly<{
  pageSize: number;
  sort: FederationSort;
  status?: FederationStatusFilter;
  federationLevel?: FederationLevel;
}>;

const FILTERS_TOAST_ID = 'federations-filters-loading';

export default function FederationFilters({
  pageSize,
  sort,
  status,
  federationLevel,
}: FederationFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(() => {
    if (!hasPendingNavigationRef.current) return;

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [federationLevel, pageSize, sort, status]);

  const handleChange = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading('Updating filters...', { id: FILTERS_TOAST_ID });
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.FEDERATIONS}>
      <Grid gap={8} columns={4} alignItems='end'>
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />
        <Select
          label='Sort'
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='updated_at_desc'>Updated ↓</option>
          <option value='updated_at_asc'>Updated ↑</option>
          <option value='created_at_desc'>Created ↓</option>
          <option value='created_at_asc'>Created ↑</option>
          <option value='name_asc'>Name A-Z</option>
          <option value='name_desc'>Name Z-A</option>
          <option value='is_active_desc'>Active first</option>
          <option value='is_active_asc'>Inactive first</option>
        </Select>
        <Select
          label='Status'
          name='status'
          defaultValue={status ?? 'all'}
          onChange={handleChange}
        >
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </Select>
        <Select
          label='Level'
          name='federation_level'
          defaultValue={federationLevel ?? ''}
          onChange={handleChange}
        >
          <option value=''>All levels</option>
          <option value='WORLD'>World</option>
          <option value='CONTINENTAL'>Continental</option>
          <option value='NATIONAL'>National</option>
        </Select>
        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.FEDERATIONS} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
