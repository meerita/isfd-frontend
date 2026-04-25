/** @format */

'use client';

import { useRouter } from 'next/navigation';
import { type ComponentProps, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { createLegalTranslation } from '@/_actions/legal/legalCms';
import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import Box from '@/_components/layout/Box';
import { LEGAL_LANGUAGES } from '@/_constants/legal';
import { normalizeApiError } from '@/_lib/apiError';
import type { LegalDocument, LegalDocumentLanguage } from '@/_types/legal';

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<'form'>['onSubmit']>
>[0];

type TranslationCreateErrors = Readonly<{
  language?: string;
}>;

export default function LegalTranslationCreateForm({
  document,
}: Readonly<{
  document: LegalDocument;
}>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const availableLanguages = LEGAL_LANGUAGES.filter(
    function filterAvailableLanguage(language) {
      return !document.translations.some(function hasTranslation(translation) {
        return translation.language === language.value;
      });
    },
  );
  const [language, setLanguage] = useState<LegalDocumentLanguage | ''>(
    availableLanguages[0]?.value ?? '',
  );
  const [errors, setErrors] = useState<TranslationCreateErrors>({});
  const isReadOnly = document.status !== 'DRAFT';

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!language) {
      nextErrors.language = 'Select a language.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error(nextErrors.language || 'Invalid translation.');
      return;
    }

    startTransition(async function submitTranslation() {
      try {
        await createLegalTranslation(document.id, {
          language,
        });

        toast.success('Language created.');
        setErrors({});
        router.refresh();
      } catch (error) {
        const normalized = normalizeApiError(error);
        toast.error(
          normalized.data.message || 'We could not add this translation.',
        );
      }
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      {availableLanguages.length > 0 && !isReadOnly ? (
        <Box display='flex' gap={8} alignItems='end'>
          <Select
            label='Add new language'
            value={language}
            onChange={function handleLanguageChange(event) {
              setLanguage(event.currentTarget.value as LegalDocumentLanguage);
              setErrors(function clearLanguageError(previousErrors) {
                return {
                  ...previousErrors,
                  language: undefined,
                };
              });
            }}
            error={Boolean(errors.language)}
            helperText={errors.language}
            disabled={isPending}
          >
            <option value=''>Select language</option>
            {availableLanguages.map(function renderLanguage(option) {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </Select>

          <Button type='submit' disabled={isPending || !language}>
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </Box>
      ) : null}
    </Form>
  );
}
