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
import type { CompetitionType } from '@/_types/competitionType';
import {
  getCompetitionTypeCategoryLabel,
  getParticipantScopeLabel,
} from '@/_constants/enums/competition';
import { formatDateTime } from '../../_components/utils';

type CompetitionTypeProfileSectionProps = Readonly<{
  competitionType: CompetitionType;
}>;

export default function CompetitionTypeProfileSection({
  competitionType,
}: CompetitionTypeProfileSectionProps): React.JSX.Element {
  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={competitionType.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title='Identity'>
              <Table>
                <Tbody>
                  <DataRow label='Name' value={competitionType.name} />
                  <DataRow label='Code' value={competitionType.code} monospace />
                  <DataRow label='Slug' value={competitionType.slug} monospace />
                  <DataRow
                    label='Active'
                    value={<Dot inline active={competitionType.isActive} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
            <DataRowSection title='Configuration'>
              <Table>
                <Tbody>
                  <DataRow
                    label='Competition type category'
                    value={getCompetitionTypeCategoryLabel(
                      competitionType.competitionTypeCategory,
                    )}
                  />
                  <DataRow
                    label='Participant scope'
                    value={getParticipantScopeLabel(competitionType.participantScope)}
                  />
                  <DataRow label='Sort order' value={competitionType.sortOrder} />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>
          <Section gap={32}>
            <DataRowSection title='Metadata'>
              <Table>
                <Tbody>
                  <DataRow label='ID' value={competitionType.id} monospace />
                  <DataRow
                    label='Created at'
                    value={formatDateTime(competitionType.createdAt)}
                  />
                  <DataRow
                    label='Updated at'
                    value={formatDateTime(competitionType.updatedAt)}
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
