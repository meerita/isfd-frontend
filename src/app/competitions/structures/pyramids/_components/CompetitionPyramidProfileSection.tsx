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
} from '@/_constants/enums/competition';
import type { CompetitionPyramid } from '@/_types/competitionStructure';
import { formatDateTime, PLACEHOLDER } from '../../../_components/utils';

type CompetitionPyramidProfileSectionProps = Readonly<{
  competitionPyramid: CompetitionPyramid;
  countryLabel?: string | null;
  federationLabel?: string | null;
}>;

export default function CompetitionPyramidProfileSection({
  competitionPyramid,
  countryLabel,
  federationLabel,
}: CompetitionPyramidProfileSectionProps): React.JSX.Element {
  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={competitionPyramid.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title='Identity'>
              <Table>
                <Tbody>
                  <DataRow label='Name' value={competitionPyramid.name} />
                  <DataRow label='Code' value={competitionPyramid.code} monospace />
                  <DataRow label='Slug' value={competitionPyramid.slug} monospace />
                  <DataRow
                    label='Active'
                    value={<Dot inline active={competitionPyramid.isActive} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
            <DataRowSection title='Relations'>
              <Table>
                <Tbody>
                  <DataRow
                    label='Country'
                    value={countryLabel ?? competitionPyramid.countryId}
                  />
                  <DataRow
                    label='Federation'
                    value={federationLabel ?? competitionPyramid.federationId ?? PLACEHOLDER}
                  />
                  <DataRow
                    label='Scope'
                    value={getCompetitionScopeKindLabel(competitionPyramid.scopeKind)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>
          <Section gap={32}>
            <DataRowSection title='Metadata'>
              <Table>
                <Tbody>
                  <DataRow label='ID' value={competitionPyramid.id} monospace />
                  <DataRow
                    label='Created at'
                    value={formatDateTime(competitionPyramid.createdAt)}
                  />
                  <DataRow
                    label='Updated at'
                    value={formatDateTime(competitionPyramid.updatedAt)}
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
