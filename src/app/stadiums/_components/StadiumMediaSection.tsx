/** @format */

'use client';

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
} from 'react';
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
  UploadStadiumImageTicket,
} from '@/_types/stadium';

type StadiumMediaSectionProps = Readonly<{
  stadium: Stadium;
}>;

type ImageCardProps = Readonly<{
  image: StadiumImageResponse;
  stadiumId: string;
  stadiumName: string;
}>;

type PendingImageCardProps = Readonly<{
  image: UploadStadiumImageTicket;
}>;

const INITIAL_UPLOAD_STATE: StadiumImageActionState = { status: 'idle' };
const PENDING_UPLOADS_STORAGE_PREFIX = 'stadium-pending-uploads:';
const STADIUM_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
const PENDING_UPLOADS_UPDATED_EVENT = 'stadium-pending-uploads-updated';
const EMPTY_PENDING_UPLOADS: ReadonlyArray<UploadStadiumImageTicket> = [];
const PENDING_UPLOADS_POLL_INTERVAL_MS = 3_000;
const pendingUploadsSnapshotCache = new Map<
  string,
  Readonly<{
    rawValue: string | null;
    parsedValue: ReadonlyArray<UploadStadiumImageTicket>;
  }>
>();

function getPendingUploadsStorageKey(stadiumId: string): string {
  return `${PENDING_UPLOADS_STORAGE_PREFIX}${stadiumId}`;
}

function readPendingUploadsFromStorage(
  stadiumId: string,
): ReadonlyArray<UploadStadiumImageTicket> {
  if (typeof window === 'undefined') return EMPTY_PENDING_UPLOADS;

  const storageKey = getPendingUploadsStorageKey(stadiumId);
  const storedValue = globalThis.window.sessionStorage.getItem(storageKey);
  const cachedSnapshot = pendingUploadsSnapshotCache.get(storageKey);

  if (cachedSnapshot?.rawValue === storedValue) {
    return cachedSnapshot.parsedValue;
  }

  if (!storedValue) {
    pendingUploadsSnapshotCache.set(storageKey, {
      rawValue: null,
      parsedValue: EMPTY_PENDING_UPLOADS,
    });
    return EMPTY_PENDING_UPLOADS;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as UploadStadiumImageTicket[];
    pendingUploadsSnapshotCache.set(storageKey, { rawValue: storedValue, parsedValue });
    return parsedValue;
  } catch {
    globalThis.window.sessionStorage.removeItem(storageKey);
    pendingUploadsSnapshotCache.set(storageKey, {
      rawValue: null,
      parsedValue: EMPTY_PENDING_UPLOADS,
    });
    return EMPTY_PENDING_UPLOADS;
  }
}

function writePendingUploadsToStorage(
  stadiumId: string,
  pendingUploads: ReadonlyArray<UploadStadiumImageTicket>,
): void {
  if (typeof window === 'undefined') return;

  const storageKey = getPendingUploadsStorageKey(stadiumId);

  if (pendingUploads.length === 0) {
    globalThis.window.sessionStorage.removeItem(storageKey);
    globalThis.window.dispatchEvent(new Event(PENDING_UPLOADS_UPDATED_EVENT));
    return;
  }

  globalThis.window.sessionStorage.setItem(
    storageKey,
    JSON.stringify(pendingUploads),
  );
  globalThis.window.dispatchEvent(new Event(PENDING_UPLOADS_UPDATED_EVENT));
}

function subscribeToPendingUploads(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key.startsWith(PENDING_UPLOADS_STORAGE_PREFIX)
    ) {
      onStoreChange();
    }
  };

  globalThis.window.addEventListener('storage', handleStorage);
  globalThis.window.addEventListener(PENDING_UPLOADS_UPDATED_EVENT, onStoreChange);

  return () => {
    globalThis.window.removeEventListener('storage', handleStorage);
    globalThis.window.removeEventListener(
      PENDING_UPLOADS_UPDATED_EVENT,
      onStoreChange,
    );
  };
}

function mergePendingUploads(
  current: ReadonlyArray<UploadStadiumImageTicket>,
  incoming: ReadonlyArray<UploadStadiumImageTicket>,
): ReadonlyArray<UploadStadiumImageTicket> {
  const byId = new Map(current.map(item => [item.attachment_id, item]));

  for (const item of incoming) {
    byId.set(item.attachment_id, item);
  }

  return Array.from(byId.values()).sort((left, right) =>
    left.created_at.localeCompare(right.created_at),
  );
}

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
        if (typeof window !== 'undefined') {
          const storageKey = getPendingUploadsStorageKey(stadiumId);
          const storedValue = globalThis.window.sessionStorage.getItem(storageKey);

          if (storedValue) {
            try {
              const parsed = JSON.parse(storedValue) as UploadStadiumImageTicket[];
              const unresolved = parsed.filter(
                pendingImage => pendingImage.attachment_id !== image.id,
              );

              writePendingUploadsToStorage(stadiumId, unresolved);
            } catch {
              globalThis.window.sessionStorage.removeItem(storageKey);
            }
          }
        }

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

function PendingStadiumImageCard({
  image,
}: PendingImageCardProps): React.JSX.Element {
  const { dictionary } = useI18n();

  return (
    <Card>
      <Grid gap={16}>
        <ImagePreview
          url={null}
          fallback={dictionary.stadiums.detail.processingStatusValue}
          minHeight={180}
        />
        <Table>
          <Tbody>
            <DataRow
              label={dictionary.stadiums.detail.imageAttachmentId}
              value={image.attachment_id}
            />
            <DataRow
              label={dictionary.stadiums.detail.imageAssetId}
              value={image.asset_id}
            />
            <DataRow
              label={dictionary.stadiums.detail.imageJobId}
              value={image.asset_job_id}
            />
            <DataRow
              label={dictionary.stadiums.detail.imagePrimary}
              value={image.is_primary ? 'Yes' : 'No'}
            />
            <DataRow
              label={dictionary.stadiums.detail.imageSortOrder}
              value={String(image.sort_order)}
            />
            <DataRow
              label={dictionary.stadiums.detail.processingStatus}
              value={dictionary.stadiums.detail.processingStatusValue}
            />
          </Tbody>
        </Table>
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
  const [uploadPending, startUploadTransition] = useTransition();
  const pendingUploads = useSyncExternalStore(
    subscribeToPendingUploads,
    () => readPendingUploadsFromStorage(stadium.id),
    () => EMPTY_PENDING_UPLOADS,
  );
  const gallery = stadium.images ?? [];
  const visibleImageIds = new Set(gallery.map(image => image.id));
  const unresolvedPendingUploads = pendingUploads.filter(
    image => !visibleImageIds.has(image.attachment_id),
  );

  useEffect(() => {
    if (pendingUploads.length === unresolvedPendingUploads.length) return;

    writePendingUploadsToStorage(stadium.id, unresolvedPendingUploads);
  }, [pendingUploads, stadium.id, unresolvedPendingUploads]);

  useEffect(() => {
    if (uploadPending || unresolvedPendingUploads.length === 0) return;
    if (
      typeof document !== 'undefined' &&
      document.visibilityState !== 'visible'
    ) {
      return;
    }

    const timeoutId = globalThis.window.setTimeout(() => {
      router.refresh();
    }, PENDING_UPLOADS_POLL_INTERVAL_MS);

    return () => {
      globalThis.window.clearTimeout(timeoutId);
    };
  }, [router, unresolvedPendingUploads.length, uploadPending]);

  function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadPending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    startUploadTransition(async () => {
      const uploadState: StadiumImageActionState = await uploadStadiumImages(
        INITIAL_UPLOAD_STATE,
        formData,
      );

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

      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      const nextPendingUploads = mergePendingUploads(
        unresolvedPendingUploads,
        uploadState.pendingImages ?? [],
      );

      writePendingUploadsToStorage(stadium.id, nextPendingUploads);

      toast.success(dictionary.stadiums.detail.uploadImagesSuccess);
      router.refresh();
    });
  }

  const primaryImageUrl = stadium.primary_image?.url ?? null;

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
              <form onSubmit={handleUploadSubmit}>
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
                       accept={STADIUM_IMAGE_ACCEPT}
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

      {unresolvedPendingUploads.length > 0 ? (
        <Grid gap={16}>
          <SectionHeader title={dictionary.stadiums.detail.processingUploads}>
            <Button
              type='button'
              variant='borderless'
              onClick={() => router.refresh()}
              disabled={uploadPending}
            >
              {dictionary.stadiums.detail.refreshGalleryAction}
            </Button>
          </SectionHeader>
          <Text color='gray' size='small'>
            {dictionary.stadiums.detail.processingUploadsHint}
          </Text>
          <Grid gap={16} columns={2}>
            {unresolvedPendingUploads.map(image => (
              <PendingStadiumImageCard
                key={image.attachment_id}
                image={image}
              />
            ))}
          </Grid>
        </Grid>
      ) : null}
    </Grid>
  );
}
