/** @format */

import { getAdminCompetitionEditionById } from '@/_actions/competitionEdition/getAdminCompetitionEditionById';
import { getAllCompetitions } from '@/_actions/competition/getAllCompetitions';
import { getAllSeasons } from '@/_actions/season/getAllSeasons';
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
import EntitySidebarNavigation from '../../_components/EntitySidebarNavigation';
import EntityUnavailable from '../../_components/EntityUnavailable';
import CompetitionEditionCodeForm from '../_components/CompetitionEditionCodeForm';
import CompetitionEditionForm from '../_components/CompetitionEditionForm';
import CompetitionEditionProfileSection from '../_components/CompetitionEditionProfileSection';

type CompetitionEditionSection = 'profile' | 'relations';

type CompetitionEditionDetailsPageProps = Readonly<{
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ section?: string | string[]; edit?: string | string[] }>;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): CompetitionEditionSection {
  return value === 'relations' ? 'relations' : 'profile';
}

function buildHref(
  competitionEditionId: string,
  section: CompetitionEditionSection,
  edit?: boolean,
): string {
  const params = new URLSearchParams();
  params.set('section', section);
  if (edit) params.set('edit', 'true');
  return `${NAVIGATION.COMPETITION_EDITION_BY_ID(competitionEditionId)}?${params.toString()}`;
}

export default async function CompetitionEditionDetailsPage({
  params,
  searchParams,
}: CompetitionEditionDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const competitionEditionId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!competitionEditionId) {
    return (
      <Grid gap={16}>
        <SectionHeader navigation={[{ label: 'Competitions' }]} icon='trophy' />
        <EntityUnavailable
          title='Competition edition unavailable'
          message='Competition edition identifier is required.'
          backHref={NAVIGATION.COMPETITION_EDITIONS}
          backLabel='Back to competition editions'
        />
      </Grid>
    );
  }

  const [response, competitions, seasons] = await Promise.all([
    getAdminCompetitionEditionById(competitionEditionId),
    getAllCompetitions(),
    getAllSeasons(),
  ]);

  if (!response.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
            { label: 'Competition Editions', href: NAVIGATION.COMPETITION_EDITIONS },
          ]}
          icon='trophy'
        />
        <EntityUnavailable
          title='Competition edition unavailable'
          message={resolveCompetitionAdminErrorMessage(response.error)}
          backHref={NAVIGATION.COMPETITION_EDITIONS}
          backLabel='Back to competition editions'
        />
      </Grid>
    );
  }

  const competitionEdition = response.data;
  const detailHref = buildHref(competitionEdition.id, section);
  const editHref = buildHref(competitionEdition.id, section, true);
  const competitionLabel =
    competitions.find(item => item.id === competitionEdition.competitionId)?.name ??
    competitionEdition.competitionId;
  const seasonLabel =
    seasons.find(item => item.id === competitionEdition.seasonId)?.name ??
    competitionEdition.seasonId;

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competition Editions', href: NAVIGATION.COMPETITION_EDITIONS },
          { label: competitionEdition.name },
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
              { id: 'profile', label: 'Profile', href: buildHref(competitionEdition.id, 'profile') },
              { id: 'relations', label: 'Relations', href: buildHref(competitionEdition.id, 'relations') },
            ]}
          />

          {edit ? (
            <Grid gap={16}>
              <CompetitionEditionForm
                competitionEdition={competitionEdition}
                seasons={seasons.map(item => ({ id: item.id, name: item.name }))}
                competitions={competitions.map(item => ({ id: item.id, name: item.name }))}
                edit
                cancelHref={detailHref}
                successHref={detailHref}
              />
              <CompetitionEditionCodeForm
                competitionEditionId={competitionEdition.id}
                currentCode={competitionEdition.code}
              />
            </Grid>
          ) : section === 'relations' ? (
            <Card>
              <Grid gap={16}>
                <Text weight='bold'>Relations</Text>
                <Text size='small' color='gray'>
                  Competition · {competitionLabel ?? 'No competition linked'}
                </Text>
                <Text size='small' color='gray'>
                  Season · {seasonLabel ?? 'No season linked'}
                </Text>
              </Grid>
            </Card>
          ) : (
            <CompetitionEditionProfileSection
              competitionEdition={competitionEdition}
              competitionLabel={competitionLabel}
              seasonLabel={seasonLabel}
            />
          )}
        </Grid>
      </Main>
    </Grid>
  );
}
