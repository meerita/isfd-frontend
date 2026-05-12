/** @format */

'use client';

import Card from '@/_components/Card';
import DataRowSection from '@/_components/layout/DataRowSection';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import SectionHeader from '@/_components/layout/SectionHeader';
import DataRow from '@/_components/tables/DataRow';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import { getCompetitionEditionStatusLabel } from '@/_constants/enums/competition';
import type { CompetitionEdition } from '@/_types/competitionEdition';
import { formatDateTime, PLACEHOLDER } from '../../_components/utils';

type CompetitionEditionProfileSectionProps = Readonly<{
  competitionEdition: CompetitionEdition;
  competitionLabel?: string | null;
  competitionPyramidLabel?: string | null;
  primaryCompetitionTierLabel?: string | null;
}>;

export default function CompetitionEditionProfileSection({
  competitionEdition,
  competitionLabel,
  competitionPyramidLabel,
  primaryCompetitionTierLabel,
}: CompetitionEditionProfileSectionProps): React.JSX.Element {
  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={competitionEdition.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title='Identity'>
              <Table>
                <Tbody>
                  <DataRow label='Name' value={competitionEdition.name} />
                  <DataRow
                    label='Edition label'
                    value={competitionEdition.editionLabel ?? PLACEHOLDER}
                  />
                  <DataRow
                    label='Short name'
                    value={competitionEdition.shortName ?? PLACEHOLDER}
                  />
                  <DataRow
                    label='Code'
                    value={competitionEdition.code ?? PLACEHOLDER}
                    monospace
                  />
                  <DataRow label='Slug' value={competitionEdition.slug} monospace />
                  <DataRow
                    label='Editorial status'
                    value={getCompetitionEditionStatusLabel(
                      competitionEdition.editorialStatus,
                    )}
                  />
                  <DataRow
                    label='Visibility'
                    value={competitionEdition.isPublic ? 'Public' : 'Private'}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title='Relations'>
              <Table>
                <Tbody>
                  <DataRow
                    label='Competition'
                    value={competitionLabel ?? competitionEdition.competitionId}
                  />
                  <DataRow
                    label='Competition pyramid'
                    value={
                      competitionPyramidLabel ??
                      competitionEdition.competitionPyramidId ??
                      PLACEHOLDER
                    }
                  />
                  <DataRow
                    label='Primary competition tier'
                    value={
                      primaryCompetitionTierLabel ??
                      competitionEdition.primaryCompetitionTierId ??
                      PLACEHOLDER
                    }
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>

          <Section gap={32}>
            <DataRowSection title='Timing'>
              <Table>
                <Tbody>
                  <DataRow label='Year' value={competitionEdition.year ?? PLACEHOLDER} />
                  <DataRow
                    label='Started on'
                    value={competitionEdition.startedOn ?? PLACEHOLDER}
                  />
                  <DataRow
                    label='Ended on'
                    value={competitionEdition.endedOn ?? PLACEHOLDER}
                  />
                  <DataRow label='Sort order' value={competitionEdition.sortOrder} />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title='Metadata'>
              <Table>
                <Tbody>
                  <DataRow label='ID' value={competitionEdition.id} monospace />
                  <DataRow
                    label='Created at'
                    value={formatDateTime(competitionEdition.createdAt)}
                  />
                  <DataRow
                    label='Updated at'
                    value={formatDateTime(competitionEdition.updatedAt)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>
        </Grid>
      </Grid>
    </Card>
  );
}
