/** @format */

import { getAdminCompetitionTierById } from '@/_actions/competitionStructure/getAdminCompetitionTierById';
import { getAllCompetitionPyramids } from '@/_actions/competitionStructure/getAllCompetitionPyramids';
import { getAllCompetitionTiers } from '@/_actions/competitionStructure/getAllCompetitionTiers';
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
import CompetitionTierForm from '../_components/CompetitionTierForm';
import CompetitionTierProfileSection from '../_components/CompetitionTierProfileSection';

type CompetitionTierSection = 'profile' | 'child-tiers' | 'competitions';

type CompetitionTierDetailsPageProps = Readonly<{
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ section?: string | string[]; edit?: string | string[] }>;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): CompetitionTierSection {
  switch (value) {
    case 'child-tiers':
    case 'competitions':
      return value;
    case 'profile':
    default:
      return 'profile';
  }
}

function buildHref(
  competitionTierId: string,
  section: CompetitionTierSection,
  edit?: boolean,
): string {
  const params = new URLSearchParams();
  params.set('section', section);
  if (edit) params.set('edit', 'true');
  return `${NAVIGATION.COMPETITION_TIER_BY_ID(competitionTierId)}?${params.toString()}`;
}

export default async function CompetitionTierDetailsPage({
  params,
  searchParams,
}: CompetitionTierDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const competitionTierId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!competitionTierId) {
    return (
      <Grid gap={16}>
        <SectionHeader navigation={[{ label: 'Competitions' }]} icon='trophy' />
        <EntityUnavailable
          title='Competition tier unavailable'
          message='Competition tier identifier is required.'
          backHref={NAVIGATION.COMPETITION_TIERS}
          backLabel='Back to competition tiers'
        />
      </Grid>
    );
  }

  const [response, competitionPyramids, competitionTiers] = await Promise.all([
    getAdminCompetitionTierById(competitionTierId),
    getAllCompetitionPyramids(),
    getAllCompetitionTiers(),
  ]);

  if (!response.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
            { label: 'Competition Tiers', href: NAVIGATION.COMPETITION_TIERS },
          ]}
          icon='trophy'
        />
        <EntityUnavailable
          title='Competition tier unavailable'
          message={resolveCompetitionAdminErrorMessage(response.error)}
          backHref={NAVIGATION.COMPETITION_TIERS}
          backLabel='Back to competition tiers'
        />
      </Grid>
    );
  }

  const competitionTier = response.data;
  const detailHref = buildHref(competitionTier.id, section);
  const editHref = buildHref(competitionTier.id, section, true);
  const childTiers = competitionTiers.filter(item => item.parentTierId === competitionTier.id);
  const relatedCompetitions: ReadonlyArray<{ id: string; name: string }> = [];
  const pyramidLabel =
    competitionPyramids.find(item => item.id === competitionTier.competitionPyramidId)?.name ??
    competitionTier.competitionPyramidId;
  const parentTierLabel =
    competitionTiers.find(item => item.id === competitionTier.parentTierId)?.name ??
    competitionTier.parentTierId;

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competition Tiers', href: NAVIGATION.COMPETITION_TIERS },
          { label: competitionTier.name },
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
                href: buildHref(competitionTier.id, 'profile'),
              },
              {
                id: 'child-tiers',
                label: 'Child tiers',
                href: buildHref(competitionTier.id, 'child-tiers'),
              },
              {
                id: 'competitions',
                label: 'Competitions',
                href: buildHref(competitionTier.id, 'competitions'),
              },
            ]}
          />

          {edit ? (
            <CompetitionTierForm
              competitionTier={competitionTier}
              competitionPyramids={competitionPyramids.map(item => ({
                id: item.id,
                name: item.name,
              }))}
              competitionTiers={competitionTiers.map(item => ({
                id: item.id,
                competitionPyramidId: item.competitionPyramidId,
                name: item.name,
              }))}
              edit
              cancelHref={detailHref}
              successHref={detailHref}
            />
          ) : section === 'child-tiers' ? (
            <Card>
              <Grid gap={16}>
                <Text weight='bold'>Child tiers</Text>
                {childTiers.length ? (
                  <Grid gap={16}>
                    {childTiers.map(item => (
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
                    No child tiers are currently linked to this competition tier.
                  </Text>
                )}
              </Grid>
            </Card>
          ) : section === 'competitions' ? (
            <Card>
              <Grid gap={16}>
                <Text weight='bold'>Competitions using this tier</Text>
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
                    No competitions are currently linked to this competition tier.
                  </Text>
                )}
              </Grid>
            </Card>
          ) : (
            <CompetitionTierProfileSection
              competitionTier={competitionTier}
              pyramidLabel={pyramidLabel}
              parentTierLabel={parentTierLabel}
            />
          )}
        </Grid>
      </Main>
    </Grid>
  );
}
