/** @format */

import { redirect } from 'next/navigation';

import LegalTranslationForm from '@/_components/legal/LegalTranslationForm';
import LegalStatusBadge from '@/_components/legal/LegalStatusBadge';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Box from '@/_components/layout/Box';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { getLegalDocumentById } from '@/_actions/legal/legalCms';
import { LEGAL_LANGUAGES } from '@/_constants/legal';

type LegalTranslationPageProps = Readonly<{
  params: Promise<{
    id: string;
    translationId: string;
  }>;
}>;

export default async function LegalTranslationPage({
  params,
}: LegalTranslationPageProps) {
  const { id, translationId } = await params;
  const document = await getLegalDocumentById(id);

  if (!document) {
    redirect(NAVIGATION.LEGAL);
  }

  const translation = document.translations.find(function findTranslation(item) {
    return item.id === translationId;
  });

  if (!translation) {
    redirect(NAVIGATION.LEGAL_BY_ID(document.id));
  }

  const languageLabel =
    LEGAL_LANGUAGES.find(function findLanguage(option) {
      return option.value === translation.language;
    })?.label ?? translation.language;

  return (
    <Grid gap={24}>
      <SectionHeader
        title={`${SECTIONS.LEGAL} / ${document.title} / Version ${document.version.toFixed(
          1,
        )} ${languageLabel}`}
        icon='description'
      >
        <Box display='flex' gap={8} alignItems='center'>
          <LegalStatusBadge status={translation.status} />
          {translation.status === 'DRAFT' ? (
            <Button
              type='submit'
              form='legal-translation-form'
              name='intent'
              value='publish'
            >
              Publish
            </Button>
          ) : null}
        </Box>
      </SectionHeader>
      <LegalTranslationForm document={document} translation={translation} />
    </Grid>
  );
}
