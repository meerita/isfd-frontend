/** @format */

import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getStadiumSurfaceTypeLabel } from '@/_constants/enums/stadium';
import NAVIGATION from '@/_constants/navigation';
import { resolveStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';
import { getPublicStadiumBySlug } from '@/_actions/stadium/getPublicStadiumBySlug';

type PublicStadiumSearchParams = Readonly<{
  value?: string | string[];
}>;

function parseSlug(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? '';
}

function renderUnavailable(title: string, message: string) {
  return (
    <Main className='padding--32'>
      <Grid gap={16} className='max-width--75 margin-inline--auto'>
        <Title size='large'>{title}</Title>
        <Text color='gray'>{message}</Text>
        <Button href={NAVIGATION.STADIUMS_PUBLIC} variant='borderless'>
          Back to stadiums
        </Button>
      </Grid>
    </Main>
  );
}

function renderImage(url: string | null, label: string, minHeight: number) {
  if (!url) {
    return (
      <div
        aria-label={`No ${label}`}
        style={{
          width: '100%',
          minHeight,
          borderRadius: 16,
          backgroundColor: '#f2f2f2',
        }}
      />
    );
  }

  return (
    <div
      aria-label={label}
      role='img'
      style={{
        width: '100%',
        minHeight,
        borderRadius: 16,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${url})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    />
  );
}

function renderDetail(label: string, value: string | null | undefined) {
  return (
    <Grid gap={4}>
      <Text size='small' color='gray' weight='semibold'>
        {label}
      </Text>
      <Text>{value && value.length > 0 ? value : '--'}</Text>
    </Grid>
  );
}

export default async function PublicStadiumDetailPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<PublicStadiumSearchParams>;
}>) {
  const params = await searchParams;
  const slug = parseSlug(params?.value);

  if (!slug) {
    return renderUnavailable('Stadium unavailable', 'Missing stadium slug in the URL.');
  }

  const stadiumResponse = await getPublicStadiumBySlug(slug);

  if (!stadiumResponse.data) {
    return renderUnavailable(
      'Stadium unavailable',
      resolveStadiumErrorMessage(stadiumResponse.error),
    );
  }

  const stadium = stadiumResponse.data;

  return (
    <Main className='padding--32'>
      <Grid gap={24} className='max-width--75 margin-inline--auto'>
        {renderImage(
          stadium.primary_image?.url ?? null,
          `${stadium.name} primary image`,
          320,
        )}

        <Grid gap={24} columns={2} alignItems='start'>
          <Grid gap={16}>
            <Grid gap={8}>
              <Title size='large' as='h1'>
                {stadium.name}
              </Title>
              <Text color='gray'>
                {stadium.primary_club?.name ?? stadium.city?.name ?? stadium.slug}
              </Text>
            </Grid>
            {stadium.official_website_url ? (
              <Grid justifyItems='start'>
                <Button href={stadium.official_website_url}>Official website</Button>
              </Grid>
            ) : null}
            {stadium.images && stadium.images.length > 0 ? (
              <Grid gap={16} columns={2}>
                {stadium.images.map(image => (
                  <div key={image.id}>
                    {renderImage(image.url, `${stadium.name} gallery image`, 180)}
                  </div>
                ))}
              </Grid>
            ) : null}
          </Grid>

          <Grid gap={16}>
            {renderDetail('Country', stadium.country?.name)}
            {renderDetail('City', stadium.city?.name)}
            {renderDetail('Primary club', stadium.primary_club?.name)}
            {renderDetail(
              'Former names',
              stadium.former_names.length > 0
                ? stadium.former_names.join(', ')
                : null,
            )}
            {renderDetail(
              'Seats',
              stadium.seat_count ? stadium.seat_count.toLocaleString() : null,
            )}
            {renderDetail(
              'Surface',
              getStadiumSurfaceTypeLabel(stadium.surface_type) ?? null,
            )}
            {renderDetail('Opened on', stadium.opened_on)}
            {renderDetail('Closed on', stadium.closed_on)}
            {renderDetail(
              'Indoor',
              stadium.is_indoor === null
                ? null
                : stadium.is_indoor
                  ? 'Yes'
                  : 'No',
            )}
            {renderDetail(
              'Roofed',
              stadium.is_roofed === null
                ? null
                : stadium.is_roofed
                  ? 'Yes'
                  : 'No',
            )}
          </Grid>
        </Grid>
      </Grid>
    </Main>
  );
}
