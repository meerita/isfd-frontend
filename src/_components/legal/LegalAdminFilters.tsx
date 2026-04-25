/** @format */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { LEGAL_DOCUMENT_TYPES } from '@/_constants/legal';
import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type { LegalDocumentType } from '@/_types/legal';

export default function LegalAdminFilters({
  initialType = '',
  initialVersion = '',
}: Readonly<{
  initialType?: LegalDocumentType | '';
  initialVersion?: string;
}>) {
  const router = useRouter();
  const [type, setType] = useState<LegalDocumentType | ''>(initialType);
  const [version, setVersion] = useState(initialVersion);

  function applyFilters() {
    const params = new URLSearchParams();

    if (type) {
      params.set('type', type);
    }

    if (version.trim()) {
      params.set('version', version.trim());
    }

    router.push(
      params.toString()
        ? `${NAVIGATION.LEGAL}?${params.toString()}`
        : NAVIGATION.LEGAL,
    );
  }

  return (
    <Grid columns={3} gap={16} alignItems='end'>
      <Select
        label='Type'
        value={type}
        onChange={function handleTypeChange(event) {
          setType((event.currentTarget.value || '') as LegalDocumentType | '');
        }}
      >
        <option value=''>All legal types</option>
        {LEGAL_DOCUMENT_TYPES.map(function renderType(typeOption) {
          return (
            <option key={typeOption.value} value={typeOption.value}>
              {typeOption.label}
            </option>
          );
        })}
      </Select>
      <TextInput
        label='Version'
        value={version}
        onChange={function handleVersionChange(event) {
          setVersion(event.currentTarget.value);
        }}
        placeholder='1.0'
        type='number'
        step='0.1'
        min='0'
      />
      <Grid display='flex' gap={8} alignItems='center'>
        <Button type='button' onClick={applyFilters}>
          Apply filters
        </Button>
        <Button
          type='button'
          variant='borderless'
          onClick={function resetFilters() {
            setType('');
            setVersion('');
            router.push(NAVIGATION.LEGAL);
          }}
        >
          Reset
        </Button>
      </Grid>
    </Grid>
  );
}
