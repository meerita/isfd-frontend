/** @format */

import Button from '@/_components/forms/Button';
import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getPublicClubBySlug } from '@/_actions/club/getPublicClubBySlug';
import { resolveClubErrorMessage } from '@/_constants/clubErrorMessages';

type PublicClubSearchParams = Readonly<{
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
        <Box display='flex' gap={8}>
          <Button href='/' variant='borderless'>
            Back to login
          </Button>
        </Box>
      </Grid>
    </Main>
  );
}

function renderImage(url: string | null, label: string, height: number) {
  if (!url) {
    return (
      <Box
        aria-label={`No ${label}`}
        style={{
          width: '100%',
          height,
          borderRadius: 16,
          backgroundColor: '#f2f2f2',
        }}
      >
        {null}
      </Box>
    );
  }

  return (
    <Box
      aria-label={label}
      style={{
        width: '100%',
        height,
        borderRadius: 16,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${url})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {null}
    </Box>
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

export default async function PublicClubDetailPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<PublicClubSearchParams>;
}>) {
  const params = await searchParams;
  const slug = parseSlug(params?.value);

  if (!slug) {
    return renderUnavailable(
      'Club unavailable',
      'Missing club slug in the URL.',
    );
  }

  const clubResponse = await getPublicClubBySlug(slug);

  if (!clubResponse.data) {
    return renderUnavailable(
      'Club unavailable',
      resolveClubErrorMessage(clubResponse.error),
    );
  }

  const club = clubResponse.data;

  return (
    <Main className='padding--32'>
      <Grid gap={24} className='max-width--75 margin-inline--auto'>
        {renderImage(club.heroImageUrl, `${club.name} hero image`, 320)}

        <Grid gap={24} columns={2} alignItems='start'>
          <Grid gap={16}>
            <Box style={{ maxWidth: 160 }}>
              {renderImage(club.logoUrl, `${club.name} logo`, 160)}
            </Box>
            <Grid gap={8}>
              <Title size='large' as='h1'>
                {club.name}
              </Title>
              <Text color='gray'>
                {club.shortName ?? club.acronym ?? club.slug}
              </Text>
            </Grid>
            {club.officialWebsiteUrl ? (
              <Box display='flex' gap={8}>
                <Button href={club.officialWebsiteUrl}>Official website</Button>
              </Box>
            ) : null}
          </Grid>

          <Grid gap={16}>
            {renderDetail('Short name', club.shortName)}
            {renderDetail('Acronym', club.acronym)}
            {renderDetail('Native name', club.nativeName)}
            {renderDetail('Founded as', club.foundedAs)}
            {renderDetail('Founded at', club.foundedAt)}
            {renderDetail('Dissolved at', club.dissolvedAt)}
            {renderDetail('Dissolved', club.isDissolved ? 'Yes' : 'No')}
            {renderDetail('Country', club.country?.name)}
            {renderDetail('City', club.city?.name)}
            {renderDetail('Primary stadium', club.primaryStadium?.name)}
          </Grid>
        </Grid>
      </Grid>
    </Main>
  );
}
