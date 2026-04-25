/** @format */

import LegalDocumentFieldsForm from '@/_components/legal/LegalDocumentFieldsForm';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';

export default function CreateLegalDocumentPage() {
  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.LEGAL} icon='description' />
      <Grid gap={8}>
        <Title size='medium'>Create a new legal document</Title>
        <Text size='small' color='gray'>
          Create the document shell first, then add translations from the
          document detail page.
        </Text>
      </Grid>
      <LegalDocumentFieldsForm />
    </Grid>
  );
}
