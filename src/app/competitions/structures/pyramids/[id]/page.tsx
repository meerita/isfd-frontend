/** @format */

import { getAllCompetitions } from '@/_actions/competition/getAllCompetitions';
import { getAdminCompetitionPyramidById } from '@/_actions/competitionStructure/getAdminCompetitionPyramidById';
import { getAdminCompetitionTiers } from '@/_actions/competitionStructure/getAdminCompetitionTiers';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAllFederations } from '@/_actions/federation/getAllFederations';
import Button from '@/_components/forms/Button';
import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import EntitySidebarNavigation from '../../../_components/EntitySidebarNavigation';
import EntityUnavailable from '../../../_components/EntityUnavailable';
import CompetitionPyramidForm from '../_components/CompetitionPyramidForm';
import CompetitionPyramidProfileSection from '../_components/CompetitionPyramidProfileSection';

type CompetitionPyramidSection = 'profile' | 'tiers' | 'competitions';

type CompetitionPyramidDetailsPageProps = Readonly<{
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ section?: string | string[]; edit?: string | string[] }>;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): CompetitionPyramidSection {
  switch (value) {
    case 'tiers':
    case 'competitions':
      return value;
    case 'profile':
    default:
      return 'profile';
  }
}

function buildHref(
  competitionPyramidId: string,
  section: CompetitionPyramidSection,
  edit?: boolean,
): string {
  const params = new URLSearchParams();
  params.set('section', section);
  if (edit) params.set('edit', 'true');
  return `${NAVIGATION.COMPETITION_PYRAMID_BY_ID(competitionPyramidId)}?${params.toString()}`;
}

export default async function CompetitionPyramidDetailsPage({
  params,
  searchParams,
}: CompetitionPyramidDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const competitionPyramidId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!competitionPyramidId) {
    return (
      <Grid gap={16}>
        <SectionHeader navigation={[{ label: 'Competitions' }]} icon='trophy' />
        <EntityUnavailable
          title='Competition pyramid unavailable'
          message='Competition pyramid identifier is required.'
          backHref={NAVIGATION.COMPETITION_PYRAMIDS}
          backLabel='Back to competition pyramids'
        />
      </Grid>
    );
  }

  const [response, countries, federations] = await Promise.all([
    getAdminCompetitionPyramidById(competitionPyramidId),
    getAllCountries(),
    getAllFederations(),
  ]);

  if (!response.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
            { label: 'Competition Pyramids', href: NAVIGATION.COMPETITION_PYRAMIDS },
          ]}
          icon='trophy'
        />
        <EntityUnavailable
          title='Competition pyramid unavailable'
          message={resolveCompetitionAdminErrorMessage(response.error)}
          backHref={NAVIGATION.COMPETITION_PYRAMIDS}
          backLabel='Back to competition pyramids'
        />
      </Grid>
    );
  }

  const competitionPyramid = response.data;
  const detailHref = buildHref(competitionPyramid.id, section);
  const editHref = buildHref(competitionPyramid.id, section, true);
  const [tiersResponse, allCompetitions] =
    !edit && section !== 'profile'
      ? await Promise.all([
          getAdminCompetitionTiers({
            page: 1,
            pageSize: 100,
            sort: 'name_asc',
            status: 'all',
            competitionPyramidId: competitionPyramid.id,
          }),
          getAllCompetitions(),
        ])
      : [null, []];
  const relatedCompetitions =
    section === 'competitions'
      ? allCompetitions.filter(
          item => item.competitionPyramidId === competitionPyramid.id,
        )
      : [];
  const countryLabel =
    countries.find(item => item.id === competitionPyramid.countryId)?.name ??
    competitionPyramid.countryId;
  const federationLabel =
    federations.find(item => item.id === competitionPyramid.federationId)?.name ??
    competitionPyramid.federationId;

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competition Pyramids', href: NAVIGATION.COMPETITION_PYRAMIDS },
          { label: competitionPyramid.name },
        ]}
        icon='trophy'
      >
        <ButtonGroup gap={4}>
          <Button
            icon='edit'
            type='button'
            href={edit ? detailHref : editHref}
            variant={edit ? 'borderless' : 'solid'}
          >
            {edit ? 'Cancel' : 'Edit'}
          </Button>
        </ButtonGroup>
      </SectionHeader>

      <Main>
        <Grid className='c-aside-grid' gap={16}>
          <EntitySidebarNavigation
            activeItem={section}
            items={[
              {
                id: 'profile',
                label: 'Profile',
                href: buildHref(competitionPyramid.id, 'profile'),
              },
              {
                id: 'tiers',
                label: 'Tiers',
                href: buildHref(competitionPyramid.id, 'tiers'),
              },
              {
                id: 'competitions',
                label: 'Competitions',
                href: buildHref(competitionPyramid.id, 'competitions'),
              },
            ]}
          />

          {edit ? (
            <CompetitionPyramidForm
              competitionPyramid={competitionPyramid}
              countries={countries.map(item => ({ id: item.id, name: item.name }))}
              federations={federations.map(item => ({ id: item.id, name: item.name }))}
              edit
              cancelHref={detailHref}
              successHref={detailHref}
            />
          ) : section === 'tiers' ? (
            <Card>
              <Grid gap={16}>
                <Text weight='bold'>Competition tiers in this pyramid</Text>
                {tiersResponse?.error ? (
                  <Text size='small' color='gray'>
                    {resolveCompetitionAdminErrorMessage(tiersResponse.error)}
                  </Text>
                ) : tiersResponse?.data.length ? (
                  <Grid gap={16}>
                    {tiersResponse.data.map(item => (
                      <Button
                        key={item.id}
                        href={NAVIGATION.COMPETITION_TIER_BY_ID(item.id)}
                        variant='borderless'
                      >
                        {item.name}
                      </Button>
                    ))}
                  </Grid>
                ) : (
                  <Text size='small' color='gray'>
                    No competition tiers are currently linked to this pyramid.
                  </Text>
                )}
              </Grid>
            </Card>
          ) : section === 'competitions' ? (
            <Card>
              <Grid gap={16}>
                <Text weight='bold'>Competitions using this pyramid</Text>
                {relatedCompetitions.length ? (
                  <Grid gap={16}>
                    {relatedCompetitions.map(item => (
                      <Button
                        key={item.id}
                        href={NAVIGATION.COMPETITION_BY_ID(item.id)}
                        variant='borderless'
                      >
                        {item.name}
                      </Button>
                    ))}
                  </Grid>
                ) : (
                  <Text size='small' color='gray'>
                    No competitions are currently linked to this pyramid.
                  </Text>
                )}
              </Grid>
            </Card>
          ) : (
            <CompetitionPyramidProfileSection
              competitionPyramid={competitionPyramid}
              countryLabel={countryLabel}
              federationLabel={federationLabel}
            />
          )}
        </Grid>
      </Main>
    </Grid>
  );
}
