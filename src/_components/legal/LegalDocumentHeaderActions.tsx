/** @format */

'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { publishLegalDocument } from '@/_actions/legal/legalCms';
import Button from '@/_components/forms/Button';
import Box from '@/_components/layout/Box';
import { normalizeApiError } from '@/_lib/apiError';
import type { LegalDocument } from '@/_types/legal';

import LegalStatusBadge from './LegalStatusBadge';

function canPublishDocument(document: LegalDocument): boolean {
  if (document.status !== 'DRAFT') {
    return false;
  }

  const hasEnglishTranslation = document.translations.some(
    function hasRequiredTranslation(translation) {
      return translation.language === 'EN' && translation.content.trim();
    },
  );

  return document.translations.length > 0 && hasEnglishTranslation;
}

export default function LegalDocumentHeaderActions({
  document,
}: Readonly<{
  document: LegalDocument;
}>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canPublish = canPublishDocument(document);

  function handlePublish() {
    if (!canPublish) {
      toast.error(
        'You need at least one English translation before publishing.',
      );
      return;
    }

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
        await publishLegalDocument(document.id);
        toast.success('Legal document published.');
        router.refresh();
      } catch (error) {
        const normalized = normalizeApiError(error);
        toast.error(
          normalized.data.message || 'We could not publish this legal document.',
        );
      }
    });
  }

  return (
    <Box display='flex' gap={8} alignItems='center'>
      <LegalStatusBadge status={document.status} />
      {document.status === 'DRAFT' ? (
        <Button type='button' onClick={handlePublish} disabled={isPending}>
          {isPending ? 'Publishing...' : 'Publish'}
        </Button>
      ) : null}
    </Box>
  );
}
