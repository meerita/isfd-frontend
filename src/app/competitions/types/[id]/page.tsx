/** @format */

import { getAdminCompetitionTypeById } from '@/_actions/competitionType/getAdminCompetitionTypeById';
import { getAdminCompetitions } from '@/_actions/competition/getAdminCompetitions';
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
import CompetitionTypeForm from '../_components/CompetitionTypeForm';
import CompetitionTypeProfileSection from '../_components/CompetitionTypeProfileSection';
import DeleteCompetitionTypeButton from '../_components/DeleteCompetitionTypeButton';

type CompetitionTypeDetailsPageProps = Readonly<{
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ section?: string | string[]; edit?: string | string[] }>;
}>;

type CompetitionTypeSection = 'profile' | 'competitions';

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): CompetitionTypeSection {
  return value === 'competitions' ? 'competitions' : 'profile';
}

function buildHref(
  competitionTypeId: string,
  section: CompetitionTypeSection,
  edit?: boolean,
): string {
  const params = new URLSearchParams();
  params.set('section', section);
  if (edit) params.set('edit', 'true');
  return `${NAVIGATION.COMPETITION_TYPE_BY_ID(competitionTypeId)}?${params.toString()}`;
}

export default async function CompetitionTypeDetailsPage({
  params,
  searchParams,
}: CompetitionTypeDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const competitionTypeId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!competitionTypeId) {
    return (
      <Grid gap={16}>
        <SectionHeader navigation={[{ label: 'Competitions' }]} icon='trophy' />
        <EntityUnavailable
          title='Competition type unavailable'
          message='Competition type identifier is required.'
          backHref={NAVIGATION.COMPETITION_TYPES}
          backLabel='Back to competition types'
        />
      </Grid>
    );
  }

  const response = await getAdminCompetitionTypeById(competitionTypeId);
  if (!response.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
            { label: 'Competition Types', href: NAVIGATION.COMPETITION_TYPES },
          ]}
          icon='trophy'
        />
        <EntityUnavailable
          title='Competition type unavailable'
          message={resolveCompetitionAdminErrorMessage(response.error)}
          backHref={NAVIGATION.COMPETITION_TYPES}
          backLabel='Back to competition types'
        />
      </Grid>
    );
  }

  const competitionType = response.data;
  const detailHref = buildHref(competitionType.id, section);
  const editHref = buildHref(competitionType.id, section, true);
  const linkedCompetitions =
    !edit && section === 'competitions'
      ? await getAdminCompetitions({
          page: 1,
          pageSize: 20,
          sort: 'updated_at_desc',
          competitionTypeId: competitionType.id,
        })
      : null;

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competition Types', href: NAVIGATION.COMPETITION_TYPES },
          { label: competitionType.name },
        ]}
        icon='trophy'
      >
        <ButtonGroup gap={4}>
          <DeleteCompetitionTypeButton
            competitionTypeId={competitionType.id}
            competitionTypeName={competitionType.name}
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
              { id: 'profile', label: 'Profile', href: buildHref(competitionType.id, 'profile') },
              {
                id: 'competitions',
                label: 'Competitions',
                href: buildHref(competitionType.id, 'competitions'),
              },
            ]}
          />

          {edit ? (
            <CompetitionTypeForm
              competitionType={competitionType}
              edit
              cancelHref={detailHref}
              successHref={detailHref}
            />
          ) : section === 'competitions' ? (
            <Card>
              <Grid gap={16}>
                <Text weight='bold'>Competitions using this type</Text>
                {linkedCompetitions?.error ? (
                  <Text size='small' color='gray'>
                    {resolveCompetitionAdminErrorMessage(linkedCompetitions.error)}
                  </Text>
                ) : linkedCompetitions?.data.length ? (
                  <Grid gap={16}>
                    {linkedCompetitions.data.map(item => (
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
                    No competitions are currently linked to this competition type.
                  </Text>
                )}
              </Grid>
            </Card>
          ) : (
            <CompetitionTypeProfileSection competitionType={competitionType} />
          )}
        </Grid>
      </Main>
    </Grid>
  );
}
