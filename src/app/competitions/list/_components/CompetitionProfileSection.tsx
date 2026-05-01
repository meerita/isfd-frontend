/** @format */

'use client';

import Card from '@/_components/Card';
import Dot from '@/_components/Dot';
import DataRowSection from '@/_components/layout/DataRowSection';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import SectionHeader from '@/_components/layout/SectionHeader';
import DataRow from '@/_components/tables/DataRow';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import type { Competition } from '@/_types/competition';
import { formatDateTime, PLACEHOLDER } from '../../_components/utils';

type CompetitionProfileSectionProps = Readonly<{
  competition: Competition;
  competitionTypeLabel?: string | null;
  federationLabel?: string | null;
  countryLabel?: string | null;
}>;

export default function CompetitionProfileSection({
  competition,
  competitionTypeLabel,
  federationLabel,
  countryLabel,
}: CompetitionProfileSectionProps): React.JSX.Element {
  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={competition.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title='Identity'>
              <Table>
                <Tbody>
                  <DataRow label='Name' value={competition.name} />
                  <DataRow label='Code' value={competition.code} monospace />
                  <DataRow label='Slug' value={competition.slug} monospace />
                  <DataRow
                    label='Active'
                    value={<Dot inline active={competition.isActive} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
            <DataRowSection title='Classification / Relations'>
              <Table>
                <Tbody>
                  <DataRow
                    label='Competition type'
                    value={competitionTypeLabel ?? competition.competitionTypeId}
                  />
                  <DataRow
                    label='Federation'
                    value={federationLabel ?? competition.federationId ?? PLACEHOLDER}
                  />
                  <DataRow
                    label='Country'
                    value={countryLabel ?? competition.countryId ?? PLACEHOLDER}
                  />
                  <DataRow label='Sort order' value={competition.sortOrder} />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>
          <Section gap={32}>
            <DataRowSection title='Timing'>
              <Table>
                <Tbody>
                  <DataRow
                    label='Started on'
                    value={competition.startedOn ?? PLACEHOLDER}
                  />
                  <DataRow
                    label='Ended on'
                    value={competition.endedOn ?? PLACEHOLDER}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
            <DataRowSection title='Metadata'>
              <Table>
                <Tbody>
                  <DataRow label='ID' value={competition.id} monospace />
                  <DataRow
                    label='Created at'
                    value={formatDateTime(competition.createdAt)}
                  />
                  <DataRow
                    label='Updated at'
                    value={formatDateTime(competition.updatedAt)}
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
