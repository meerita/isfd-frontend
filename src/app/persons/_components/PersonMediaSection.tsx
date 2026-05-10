/** @format */

'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { uploadPersonPortrait } from '@/_actions/person/uploadPersonPortrait';
import Button from '@/_components/forms/Button';
import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import DataRowSection from '@/_components/layout/DataRowSection';
import SectionHeader from '@/_components/layout/SectionHeader';
import DataRow from '@/_components/tables/DataRow';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
import Text from '@/_components/typography/Text';
import type { PersonActionState } from '@/_types/person';
import { useI18n } from '@/_i18n/I18nProvider';
import type { PersonAdminDetail } from '@/_types/person';

type PersonMediaSectionProps = Readonly<{
  person: PersonAdminDetail;
}>;

const INITIAL_UPLOAD_STATE: PersonActionState = { status: 'idle' };

export default function PersonMediaSection({
  person,
}: PersonMediaSectionProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary } = useI18n();
  const portraitAssetId = person.portrait_asset_id ?? null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, uploadAction, uploadPending] = useActionState<
    PersonActionState,
    FormData
  >(uploadPersonPortrait, INITIAL_UPLOAD_STATE);

  useEffect(() => {
    if (uploadState.status === 'idle') {
      return;
    }

    if (uploadState.status === 'error') {
      toast.error(
        resolvePersonErrorMessage(
          uploadState.error,
          dictionary.persons.errors,
          dictionary.common.unexpectedError,
        ),
      );
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast.success(dictionary.persons.detail.portraitUploadSuccess);
    router.refresh();
  }, [
    dictionary.common.unexpectedError,
    dictionary.persons.detail.portraitUploadSuccess,
    dictionary.persons.errors,
    router,
    uploadState.error,
    uploadState.status,
  ]);

  return (
    <Card>
      <Grid gap={24}>
        <SectionHeader title={dictionary.persons.detail.media} />
        <DataRowSection title={dictionary.persons.form.portraitAssetId}>
          <Grid gap={16}>
            <Text color='gray' size='small'>
              {dictionary.persons.detail.portraitAssetResolverHint}
            </Text>
            <Table>
              <Tbody>
                <DataRow
                  label={dictionary.persons.form.portraitAssetId}
                  value={portraitAssetId ?? '--'}
                />
              </Tbody>
            </Table>
          </Grid>
        </DataRowSection>
        <DataRowSection title={dictionary.persons.detail.portraitUploadTitle}>
          <Grid gap={16}>
            <Text color='gray' size='small'>
              {dictionary.persons.detail.portraitUploadHint}
            </Text>
            <form action={uploadAction}>
              <Grid gap={16}>
                <input type='hidden' name='person_id' value={person.id} />
                <Grid gap={8}>
                  <Text size='small' weight='semibold'>
                    {dictionary.persons.detail.portraitFileLabel}
                  </Text>
                  <input
                    ref={fileInputRef}
                    type='file'
                    name='file'
                    accept='image/*'
                    required
                    disabled={uploadPending}
                  />
                </Grid>
                <Grid justifyItems='start'>
                  <Button
                    type='submit'
                    disabled={uploadPending}
                    aria-busy={uploadPending}
                  >
                    {uploadPending
                      ? dictionary.persons.detail.portraitUploading
                      : dictionary.persons.detail.portraitUploadAction}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </DataRowSection>
      </Grid>
    </Card>
  );
}
