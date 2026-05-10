/** @format */

'use client';

import { useActionState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteStadiumImage } from '@/_actions/stadium/deleteStadiumImage';
import { uploadStadiumImages } from '@/_actions/stadium/uploadStadiumImages';
import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import DataRowSection from '@/_components/layout/DataRowSection';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import DataRow from '@/_components/tables/DataRow';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Text from '@/_components/typography/Text';
import { resolveLocalizedStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';
import type {
  Stadium,
  StadiumImageActionState,
  StadiumImageResponse,
} from '@/_types/stadium';

type StadiumMediaSectionProps = Readonly<{
  stadium: Stadium;
}>;

type ImageCardProps = Readonly<{
  image: StadiumImageResponse;
  stadiumId: string;
  stadiumName: string;
}>;

const INITIAL_UPLOAD_STATE: StadiumImageActionState = { status: 'idle' };

function ImagePreview({
  url,
  fallback,
  minHeight = 240,
}: Readonly<{
  url: string | null | undefined;
  fallback: string;
  minHeight?: number;
}>): React.JSX.Element {
  if (!url) {
    return (
      <Grid
        className='background-color--lightest-gray border-radius--4'
        style={{ minHeight, placeItems: 'center' }}
      >
        <Text color='gray' size='small'>
          {fallback}
        </Text>
      </Grid>
    );
  }

  return (
    <div
      aria-label={fallback}
      role='img'
      style={{
        width: '100%',
        minHeight,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${url})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    />
  );
}

function StadiumImageCard({
  image,
  stadiumId,
  stadiumName,
}: ImageCardProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        dictionary.stadiums.detail.deleteImageConfirm.replace(
          '{name}',
          stadiumName,
        ),
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteStadiumImage(stadiumId, image.id);

      if (result.success) {
        toast.success(dictionary.stadiums.detail.deleteImageSuccess);
        router.refresh();
        return;
      }

      toast.error(
        resolveLocalizedStadiumErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message:
                  result.error ?? dictionary.stadiums.detail.defaultMediaError,
                error:
                  result.error ?? dictionary.stadiums.detail.defaultMediaError,
              }
            : undefined,
          dictionary.stadiums.errors,
          dictionary.common.unexpectedError,
        ),
      );

      if (result.reason === 'STADIUM_IMAGE_ATTACHMENT_NOT_FOUND') {
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <Grid gap={16}>
        <ImagePreview
          url={image.url}
          fallback={dictionary.stadiums.detail.noImageAvailable}
          minHeight={180}
        />
        <Table>
          <Tbody>
            <DataRow
              label={dictionary.stadiums.detail.imageAttachmentId}
              value={image.id}
            />
            <DataRow
              label={dictionary.stadiums.detail.imageAssetId}
              value={image.asset_id}
            />
            <DataRow
              label={dictionary.stadiums.detail.imagePrimary}
              value={image.is_primary ? 'Yes' : 'No'}
            />
            <DataRow
              label={dictionary.stadiums.detail.imageSortOrder}
              value={String(image.sort_order)}
            />
          </Tbody>
        </Table>
        <Grid justifyItems='start'>
          <Button
            type='button'
            variant='borderless'
            onClick={handleDelete}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending
              ? dictionary.stadiums.detail.deletingImage
              : dictionary.stadiums.detail.deleteImageAction}
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}

export default function StadiumMediaSection({
  stadium,
}: StadiumMediaSectionProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, uploadAction, uploadPending] = useActionState<
    StadiumImageActionState,
    FormData
  >(uploadStadiumImages, INITIAL_UPLOAD_STATE);

  useEffect(() => {
    if (uploadState.status === 'idle') return;

    if (uploadState.status === 'error') {
      toast.error(
        resolveLocalizedStadiumErrorMessage(
          uploadState.error,
          dictionary.stadiums.errors,
          dictionary.common.unexpectedError,
        ),
      );
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast.success(dictionary.stadiums.detail.uploadImagesSuccess);
    router.refresh();
  }, [
    dictionary.common.unexpectedError,
    dictionary.stadiums.detail.uploadImagesSuccess,
    dictionary.stadiums.errors,
    router,
    uploadState.error,
    uploadState.status,
  ]);

  const primaryImageUrl = stadium.primary_image?.url ?? null;
  const gallery = stadium.images ?? [];

  return (
    <Grid gap={24}>
      <Card>
        <Grid gap={24}>
          <SectionHeader title={dictionary.stadiums.detail.media} />
          <DataRowSection title={dictionary.stadiums.detail.primaryImage}>
            <Grid gap={16}>
              <ImagePreview
                url={primaryImageUrl}
                fallback={dictionary.stadiums.detail.noImageAvailable}
              />
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.stadiums.detail.primaryImage}
                    value={primaryImageUrl ?? '--'}
                  />
                </Tbody>
              </Table>
            </Grid>
          </DataRowSection>
          <DataRowSection title={dictionary.stadiums.detail.uploadImagesTitle}>
            <Grid gap={16}>
              <Text color='gray' size='small'>
                {dictionary.stadiums.detail.uploadImagesHint}
              </Text>
              <form action={uploadAction}>
                <Grid gap={16}>
                  <input type='hidden' name='stadium_id' value={stadium.id} />
                  <Grid gap={8}>
                    <Text size='small' weight='semibold'>
                      {dictionary.stadiums.detail.uploadImagesLabel}
                    </Text>
                    <input
                      ref={fileInputRef}
                      type='file'
                      name='files'
                      accept='image/*'
                      multiple
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
                        ? dictionary.stadiums.detail.uploadingImages
                        : dictionary.stadiums.detail.uploadImagesAction}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </DataRowSection>
        </Grid>
      </Card>

      <Grid gap={16}>
        <SectionHeader title={dictionary.stadiums.detail.gallery} />
        {gallery.length === 0 ? (
          <Card>
            <Text color='gray'>{dictionary.stadiums.detail.emptyGallery}</Text>
          </Card>
        ) : (
          <Grid gap={16} columns={2}>
            {gallery.map(image => (
              <StadiumImageCard
                key={image.id}
                image={image}
                stadiumId={stadium.id}
                stadiumName={stadium.name}
              />
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}
