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
import { getStadiumSurfaceTypeLabel } from '@/_constants/enums/stadium';
import { useI18n } from '@/_i18n/I18nProvider';
import type { Stadium } from '@/_types/stadium';

const PLACEHOLDER = '--';

type StadiumProfileSectionProps = Readonly<{
  stadium: Stadium;
  countryLabel?: string | null;
  cityLabel?: string | null;
  primaryClubLabel?: string | null;
}>;

function formatText(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : PLACEHOLDER;
}

function formatDateTime(value: string, locale: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? PLACEHOLDER
    : parsed.toLocaleString(locale);
}

function formatSeatCount(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString() : PLACEHOLDER;
}

function formatFormerNames(values: ReadonlyArray<string>): string {
  return values.length > 0 ? values.join(', ') : PLACEHOLDER;
}

export default function StadiumProfileSection({
  stadium,
  countryLabel,
  cityLabel,
  primaryClubLabel,
}: StadiumProfileSectionProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();

  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={stadium.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title={dictionary.stadiums.detail.identity}>
              <Table>
                <Tbody>
                  <DataRow label={dictionary.stadiums.form.name} value={stadium.name} />
                  <DataRow
                    label={dictionary.stadiums.form.slug}
                    value={stadium.slug}
                    monospace
                  />
                  <DataRow
                    label={dictionary.stadiums.form.activeLabel}
                    value={<Dot inline active={stadium.isActive} />}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.formerNames}
                    value={formatFormerNames(stadium.formerNames)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.stadiums.detail.location}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.stadiums.form.countryId}
                    value={formatText(countryLabel ?? stadium.countryId)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.cityId}
                    value={formatText(cityLabel ?? stadium.cityId)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.primaryClubId}
                    value={formatText(primaryClubLabel ?? stadium.primaryClubId)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>

          <Section gap={32}>
            <DataRowSection title={dictionary.stadiums.detail.specifications}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.stadiums.form.surfaceType}
                    value={
                      getStadiumSurfaceTypeLabel(stadium.surfaceType) ?? PLACEHOLDER
                    }
                  />
                  <DataRow
                    label={dictionary.stadiums.form.seatCount}
                    value={formatSeatCount(stadium.seatCount)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.imageUrl}
                    value={formatText(stadium.imageUrl)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.stadiums.detail.metadata}>
              <Table>
                <Tbody>
                  <DataRow label={dictionary.stadiums.form.id} value={stadium.id} monospace />
                  <DataRow
                    label={dictionary.stadiums.form.createdAt}
                    value={formatDateTime(stadium.createdAt, locale)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.updatedAt}
                    value={formatDateTime(stadium.updatedAt, locale)}
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
