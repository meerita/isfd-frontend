/** @format */

'use client';

import { useRouter } from 'next/navigation';
import { type ComponentProps, useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  deleteLegalTranslation,
  publishLegalDocument,
  updateLegalTranslation,
} from '@/_actions/legal/legalCms';
import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import { LEGAL_LANGUAGES } from '@/_constants/legal';
import NAVIGATION from '@/_constants/navigation';
import { normalizeApiError } from '@/_lib/apiError';
import type {
  LegalDocument,
  LegalDocumentLanguage,
  LegalDocumentTranslation,
} from '@/_types/legal';

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<'form'>['onSubmit']>
>[0];

type TranslationFormErrors = Readonly<{
  language?: string;
  content?: string;
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

export default function LegalTranslationForm({
  document,
  translation,
}: Readonly<{
  document: LegalDocument;
  translation: LegalDocumentTranslation;
}>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<LegalDocumentLanguage>(
    translation.language,
  );
  const [content, setContent] = useState(translation.content);
  const [errors, setErrors] = useState<TranslationFormErrors>({});
  const isArchived = document.status === 'ARCHIVED';
  const isDraft = translation.status === 'DRAFT';

  function validateTranslation(): TranslationFormErrors {
    const nextErrors: Record<string, string> = {};
    const collidesWithExistingLanguage = document.translations.some(
      function hasDuplicateLanguage(currentTranslation) {
        return (
          currentTranslation.id !== translation.id &&
          currentTranslation.language === language
        );
      },
    );

    if (collidesWithExistingLanguage) {
      nextErrors.language =
        'Another translation already uses the selected language.';
    }

    if (!content.trim()) {
      nextErrors.content = 'Translation content is required.';
    }

    return nextErrors;
  }

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    const submitter =
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value ?? 'save';

    const nextErrors = validateTranslation();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error(
        nextErrors.language || nextErrors.content || 'Invalid translation.',
      );
      return;
    }

    if (intent === 'publish') {
      if (
        !(
          globalThis.window?.confirm(
            'Publishing will make this legal document live. Continue?',
          ) ?? false
        )
      ) {
        return;
      }

      startTransition(async function publishCurrentDocument() {
        try {
          await updateLegalTranslation(document.id, translation.id, {
            language,
            content: content.trim(),
          });
          await publishLegalDocument(document.id);
          toast.success('Legal document published.');
          router.refresh();
        } catch (error) {
          const normalized = normalizeApiError(error);
          toast.error(
            normalized.data.message ||
              'We could not publish this legal document.',
          );
        }
      });

      return;
    }

    startTransition(async function saveTranslation() {
      try {
        await updateLegalTranslation(document.id, translation.id, {
          language,
          content: content.trim(),
        });
        toast.success('Translation updated.');
        router.refresh();
      } catch (error) {
        const normalized = normalizeApiError(error);
        toast.error(
          normalized.data.message || 'We could not update this translation.',
        );
      }
    });
  }

  function handleDelete() {
    if (!isDraft) {
      return;
    }

    if (
      !(
        globalThis.window?.confirm(
          'This will delete the draft translation. Continue?',
        ) ?? false
      )
    ) {
      return;
    }

    startTransition(async function deleteCurrentTranslation() {
      try {
        await deleteLegalTranslation(document.id, translation.id);
        toast.success('Translation deleted.');
        router.push(NAVIGATION.LEGAL_BY_ID(document.id));
        router.refresh();
      } catch (error) {
        const normalized = normalizeApiError(error);
        toast.error(
          normalized.data.message || 'We could not delete this translation.',
        );
      }
    });
  }

  return (
    <Form id='legal-translation-form' onSubmit={handleSubmit}>
      <Section>
        <Grid gap={16}>
          <Grid columns={2} gap={16}>
            <Select
              label='Language'
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
              disabled={isPending || isArchived}
            >
              {LEGAL_LANGUAGES.map(function renderLanguage(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>

            <Grid columns={2} gap={16}>
              <TextInput
                label='Created at'
                value={formatDateTime(translation.created_at)}
                disabled
              />
              <TextInput
                label='Updated at'
                value={formatDateTime(translation.updated_at)}
                disabled
              />
            </Grid>
          </Grid>

          <TextArea
            label='Markdown content'
            rows={20}
            value={content}
            onChange={function handleContentChange(event) {
              setContent(event.currentTarget.value);
              setErrors(function clearContentError(previousErrors) {
                return {
                  ...previousErrors,
                  content: undefined,
                };
              });
            }}
            error={Boolean(errors.content)}
            helperText={errors.content}
            disabled={isPending || isArchived}
          />

          <ButtonGroup gap={8}>
            <Button
              type='submit'
              name='intent'
              value='save'
              disabled={isPending || isArchived}
            >
              {isPending ? 'Saving...' : 'Save translation'}
            </Button>
            {isDraft ? (
              <Button
                type='button'
                variant='borderless'
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete draft
              </Button>
            ) : null}
            <Button
              href={NAVIGATION.LEGAL_BY_ID(document.id)}
              variant='borderless'
              disabled={isPending}
            >
              Back to document
            </Button>
          </ButtonGroup>
        </Grid>
      </Section>
    </Form>
  );
}
