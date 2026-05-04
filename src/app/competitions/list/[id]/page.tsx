/** @format */

import { getAdminCompetitionById } from '@/_actions/competition/getAdminCompetitionById';
import {
  getCompetitionBaseCatalogs,
  getCompetitionTierCatalog,
} from '@/_actions/competition/getCompetitionCatalogs';
import { getAdminCompetitionEditions } from '@/_actions/competitionEdition/getAdminCompetitionEditions';
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
import {
  mapCompetitionPyramidOptions,
  mapCompetitionSelectOptions,
  mapCompetitionTierOptions,
  mapCompetitionTypeOptions,
  resolveCompetitionLabels,
} from '../_lib/competitionAdmin';
import EntitySidebarNavigation from '../../_components/EntitySidebarNavigation';
import EntityUnavailable from '../../_components/EntityUnavailable';
import CompetitionForm from '../_components/CompetitionForm';
import DeleteCompetitionButton from '../_components/DeleteCompetitionButton';
import CompetitionProfileSection from '../_components/CompetitionProfileSection';

type CompetitionSection = 'profile' | 'editions';

type CompetitionDetailsPageProps = Readonly<{
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ section?: string | string[]; edit?: string | string[] }>;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): CompetitionSection {
  return value === 'editions' ? 'editions' : 'profile';
}

function buildHref(
  competitionId: string,
  section: CompetitionSection,
  edit?: boolean,
): string {
  const params = new URLSearchParams();
  params.set('section', section);
  if (edit) params.set('edit', 'true');
  return `${NAVIGATION.COMPETITION_BY_ID(competitionId)}?${params.toString()}`;
}

export default async function CompetitionDetailsPage({
  params,
  searchParams,
}: CompetitionDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const competitionId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!competitionId) {
    return (
      <Grid gap={16}>
        <SectionHeader navigation={[{ label: 'Competitions' }]} icon='trophy' />
        <EntityUnavailable
          title='Competition unavailable'
          message='Competition identifier is required.'
          backHref={NAVIGATION.COMPETITIONS_LIST}
          backLabel='Back to competitions'
        />
      </Grid>
    );
  }

  const [
    response,
    { competitionTypes, federations, countries, competitionPyramids, error },
  ] = await Promise.all([
    getAdminCompetitionById(competitionId),
    getCompetitionBaseCatalogs(),
  ]);

  if (!response.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
            { label: 'Competitions', href: NAVIGATION.COMPETITIONS_LIST },
          ]}
          icon='trophy'
        />
        <EntityUnavailable
          title='Competition unavailable'
          message={resolveCompetitionAdminErrorMessage(response.error)}
          backHref={NAVIGATION.COMPETITIONS_LIST}
          backLabel='Back to competitions'
        />
      </Grid>
    );
  }

  const competition = response.data;
  const mappedCompetitionTypes = mapCompetitionTypeOptions(competitionTypes);
  const mappedFederations = mapCompetitionSelectOptions(federations);
  const mappedCountries = mapCompetitionSelectOptions(countries);
  const mappedCompetitionPyramids = mapCompetitionPyramidOptions(competitionPyramids);
  const selectedCompetitionType =
    competitionTypes.find(item => item.id === competition.competitionTypeId) ?? null;
  const { competitionTiers, error: initialTierError } =
    competition.competitionPyramidId
      ? await getCompetitionTierCatalog(
          competition.competitionPyramidId,
          selectedCompetitionType?.participantScope ?? null,
        )
      : { competitionTiers: [], error: undefined };
  const mappedCompetitionTiers = mapCompetitionTierOptions(competitionTiers);
  const detailHref = buildHref(competition.id, section);
  const editHref = buildHref(competition.id, section, true);
  const editionsResponse =
    !edit && section === 'editions'
      ? await getAdminCompetitionEditions({
          page: 1,
          pageSize: 100,
          sort: 'updated_at_desc',
          competitionId: competition.id,
          status: 'all',
          activeStatus: 'all',
        })
      : null;
  const labels = resolveCompetitionLabels(competition, {
    competitionTypes: mappedCompetitionTypes,
    federations: mappedFederations,
    countries: mappedCountries,
    competitionPyramids: mappedCompetitionPyramids,
    competitionTiers: mappedCompetitionTiers,
  });

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS_LIST },
          { label: competition.name },
        ]}
        icon='trophy'
      >
        <ButtonGroup gap={4}>
          <DeleteCompetitionButton
            competitionId={competition.id}
            competitionName={competition.name}
          />
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
              { id: 'profile', label: 'Profile', href: buildHref(competition.id, 'profile') },
              { id: 'editions', label: 'Editions', href: buildHref(competition.id, 'editions') },
            ]}
          />

          {edit ? (
            <CompetitionForm
              competition={competition}
              competitionTypes={mappedCompetitionTypes}
              federations={mappedFederations}
              countries={mappedCountries}
              competitionPyramids={mappedCompetitionPyramids}
              competitionTiers={mappedCompetitionTiers}
              catalogError={error}
              initialTierError={initialTierError}
              edit
              cancelHref={detailHref}
              successHref={detailHref}
            />
          ) : section === 'editions' ? (
            <Card>
              <Grid gap={16}>
                <Text weight='bold'>Competition editions</Text>
                {editionsResponse?.error ? (
                  <Text size='small' color='gray'>
                    {resolveCompetitionAdminErrorMessage(editionsResponse.error)}
                  </Text>
                ) : editionsResponse?.data.length ? (
                  <Grid gap={16}>
                    {editionsResponse.data.map(item => (
                      <Button
                        key={item.id}
                        href={NAVIGATION.COMPETITION_EDITION_BY_ID(item.id)}
                        variant='borderless'
                      >
                        {item.name}
                      </Button>
                    ))}
                  </Grid>
                ) : (
                  <Text size='small' color='gray'>
                    No competition editions are currently linked to this competition.
                  </Text>
                )}
              </Grid>
            </Card>
          ) : (
            <CompetitionProfileSection
              competition={competition}
              competitionTypeLabel={labels.competitionTypeLabel}
              federationLabel={labels.federationLabel}
              countryLabel={labels.countryLabel}
              pyramidLabel={labels.pyramidLabel}
              primaryTierLabel={labels.primaryTierLabel}
              allowedTierLabels={labels.allowedTierLabels}
            />
          )}
        </Grid>
      </Main>
    </Grid>
  );
}
