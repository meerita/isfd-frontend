/** @format */

import { getAdminSeasonById } from '@/_actions/season/getAdminSeasonById';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import EntitySidebarNavigation from '../../_components/EntitySidebarNavigation';
import EntityUnavailable from '../../_components/EntityUnavailable';
import DeleteSeasonButton from '../_components/DeleteSeasonButton';
import SeasonForm from '../_components/SeasonForm';
import SeasonProfileSection from '../_components/SeasonProfileSection';

type SeasonDetailsPageProps = Readonly<{
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ section?: string | string[]; edit?: string | string[] }>;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(seasonId: string, edit?: boolean): string {
  const params = new URLSearchParams();
  params.set('section', 'profile');
  if (edit) params.set('edit', 'true');
  return `${NAVIGATION.SEASON_BY_ID(seasonId)}?${params.toString()}`;
}

export default async function SeasonDetailsPage({
  params,
  searchParams,
}: SeasonDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const seasonId = resolvedParams?.id?.trim() ?? '';
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!seasonId) {
    return (
      <Grid gap={16}>
        <SectionHeader navigation={[{ label: 'Competitions' }]} icon='trophy' />
        <EntityUnavailable
          title='Season unavailable'
          message='Season identifier is required.'
          backHref={NAVIGATION.COMPETITION_SEASONS}
          backLabel='Back to seasons'
        />
      </Grid>
    );
  }

  const response = await getAdminSeasonById(seasonId);
  if (!response.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
            { label: 'Seasons', href: NAVIGATION.COMPETITION_SEASONS },
          ]}
          icon='trophy'
        />
        <EntityUnavailable
          title='Season unavailable'
          message={resolveCompetitionAdminErrorMessage(response.error)}
          backHref={NAVIGATION.COMPETITION_SEASONS}
          backLabel='Back to seasons'
        />
      </Grid>
    );
  }

  const season = response.data;
  const detailHref = buildHref(season.id);
  const editHref = buildHref(season.id, true);

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Seasons', href: NAVIGATION.COMPETITION_SEASONS },
          { label: season.name },
        ]}
        icon='trophy'
      >
        <ButtonGroup gap={4}>
          <DeleteSeasonButton seasonId={season.id} seasonName={season.name} />
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
            activeItem='profile'
            items={[{ id: 'profile', label: 'Profile', href: detailHref }]}
          />
          {edit ? (
            <SeasonForm
              season={season}
              edit
              cancelHref={detailHref}
              successHref={detailHref}
            />
          ) : (
            <SeasonProfileSection season={season} />
          )}
        </Grid>
      </Main>
    </Grid>
  );
}
