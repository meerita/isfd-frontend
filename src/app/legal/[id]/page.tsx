/** @format */

import { redirect } from 'next/navigation';

import LegalDocumentHeaderActions from '@/_components/legal/LegalDocumentHeaderActions';
import LegalDocumentFieldsForm from '@/_components/legal/LegalDocumentFieldsForm';
import LegalTranslationCreateForm from '@/_components/legal/LegalTranslationCreateForm';
import LegalTranslationList from '@/_components/legal/LegalTranslationList';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { getLegalDocumentById } from '@/_actions/legal/legalCms';

type LegalDocumentPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function LegalDocumentPage({
  params,
}: LegalDocumentPageProps) {
  const { id } = await params;
  const document = await getLegalDocumentById(id);

  if (!document) {
    redirect(NAVIGATION.LEGAL);
  }

  return (
    <Grid gap={24}>
      <SectionHeader
        title={`${SECTIONS.LEGAL} / ${document.title}`}
        icon='description'
      >
        <LegalDocumentHeaderActions document={document} />
      </SectionHeader>
      <Grid columns={2} gap={32} alignItems='start'>
        <LegalDocumentFieldsForm
          document={document}
          readOnly={document.status === 'PUBLISHED'}
        />
        <Grid gap={32}>
          <LegalTranslationCreateForm document={document} />
          <LegalTranslationList document={document} />
        </Grid>
      </Grid>
    </Grid>
  );
}
