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
import {
  getCompetitionScopeKindLabel,
  getParticipantScopeLabel,
} from '@/_constants/enums/competition';
import type { CompetitionTier } from '@/_types/competitionStructure';
import { formatDateTime, PLACEHOLDER } from '../../../_components/utils';

type CompetitionTierProfileSectionProps = Readonly<{
  competitionTier: CompetitionTier;
  pyramidLabel?: string | null;
  parentTierLabel?: string | null;
}>;

export default function CompetitionTierProfileSection({
  competitionTier,
  pyramidLabel,
  parentTierLabel,
}: CompetitionTierProfileSectionProps): React.JSX.Element {
  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={competitionTier.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title='Identity'>
              <Table>
                <Tbody>
                  <DataRow label='Name' value={competitionTier.name} />
                  <DataRow label='Code' value={competitionTier.code} monospace />
                  <DataRow label='Slug' value={competitionTier.slug} monospace />
                  <DataRow
                    label='Short name'
                    value={competitionTier.shortName ?? PLACEHOLDER}
                  />
                  <DataRow
                    label='Active'
                    value={<Dot inline active={competitionTier.isActive} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
            <DataRowSection title='Configuration'>
              <Table>
                <Tbody>
                  <DataRow
                    label='Competition pyramid'
                    value={pyramidLabel ?? competitionTier.competitionPyramidId}
                  />
                  <DataRow
                    label='Parent tier'
                    value={parentTierLabel ?? competitionTier.parentTierId ?? PLACEHOLDER}
                  />
                  <DataRow
                    label='Scope'
                    value={getCompetitionScopeKindLabel(competitionTier.scopeKind)}
                  />
                  <DataRow
                    label='Participant scope'
                    value={getParticipantScopeLabel(competitionTier.participantScope)}
                  />
                  <DataRow
                    label='Level order'
                    value={competitionTier.levelOrder ?? PLACEHOLDER}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>
          <Section gap={32}>
            <DataRowSection title='Metadata'>
              <Table>
                <Tbody>
                  <DataRow label='ID' value={competitionTier.id} monospace />
                  <DataRow
                    label='Created at'
                    value={formatDateTime(competitionTier.createdAt)}
                  />
                  <DataRow
                    label='Updated at'
                    value={formatDateTime(competitionTier.updatedAt)}
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
