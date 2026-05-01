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
import type { Season } from '@/_types/season';
import { formatDateTime, PLACEHOLDER } from '../../_components/utils';

type SeasonProfileSectionProps = Readonly<{
  season: Season;
}>;

export default function SeasonProfileSection({
  season,
}: SeasonProfileSectionProps): React.JSX.Element {
  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={season.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title='Identity'>
              <Table>
                <Tbody>
                  <DataRow label='Name' value={season.name} />
                  <DataRow label='Code' value={season.code} monospace />
                  <DataRow label='Slug' value={season.slug} monospace />
                  <DataRow label='Active' value={<Dot inline active={season.isActive} />} />
                </Tbody>
              </Table>
            </DataRowSection>
            <DataRowSection title='Configuration'>
              <Table>
                <Tbody>
                  <DataRow label='Start year' value={season.startYear} />
                  <DataRow
                    label='End year'
                    value={season.endYear === null ? PLACEHOLDER : season.endYear}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>
          <Section gap={32}>
            <DataRowSection title='Metadata'>
              <Table>
                <Tbody>
                  <DataRow label='ID' value={season.id} monospace />
                  <DataRow label='Created at' value={formatDateTime(season.createdAt)} />
                  <DataRow label='Updated at' value={formatDateTime(season.updatedAt)} />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>
        </Grid>
      </Grid>
    </Card>
  );
}
