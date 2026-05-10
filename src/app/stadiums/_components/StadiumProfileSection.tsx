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

function formatDateOnly(value: string | null | undefined): string {
  if (!value) return PLACEHOLDER;
  return value;
}

function formatSeatCount(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString() : PLACEHOLDER;
}

function formatFormerNames(values: ReadonlyArray<string>): string {
  return values.length > 0 ? values.join(', ') : PLACEHOLDER;
}

function formatNullableBoolean(
  value: boolean | null | undefined,
  dictionary: ReturnType<typeof useI18n>['dictionary'],
): string {
  if (value === true) return dictionary.common.active;
  if (value === false) return dictionary.common.inactive;
  return PLACEHOLDER;
}

function formatPitchSize(length: number | null | undefined, width: number | null | undefined) {
  if (typeof length !== 'number' || typeof width !== 'number') {
    return PLACEHOLDER;
  }

  return `${length} x ${width} m`;
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
                    label={dictionary.stadiums.form.publicLabel}
                    value={<Dot inline active={stadium.is_public} />}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.formerNames}
                    value={formatFormerNames(stadium.former_names)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.officialWebsiteUrl}
                    value={formatText(stadium.official_website_url)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.stadiums.detail.location}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.stadiums.form.countryId}
                    value={formatText(countryLabel ?? stadium.country_id)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.cityId}
                    value={formatText(cityLabel ?? stadium.city_id)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.primaryClubId}
                    value={formatText(primaryClubLabel ?? stadium.primary_club_id)}
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
                      getStadiumSurfaceTypeLabel(stadium.surface_type) ?? PLACEHOLDER
                    }
                  />
                  <DataRow
                    label={dictionary.stadiums.form.seatCount}
                    value={formatSeatCount(stadium.seat_count)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.pitchSize}
                    value={formatPitchSize(
                      stadium.pitch_length_meters,
                      stadium.pitch_width_meters,
                    )}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.openedOn}
                    value={formatDateOnly(stadium.opened_on)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.closedOn}
                    value={formatDateOnly(stadium.closed_on)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.isIndoor}
                    value={formatNullableBoolean(stadium.is_indoor, dictionary)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.isRoofed}
                    value={formatNullableBoolean(stadium.is_roofed, dictionary)}
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
                    value={formatDateTime(stadium.created_at, locale)}
                  />
                  <DataRow
                    label={dictionary.stadiums.form.updatedAt}
                    value={formatDateTime(stadium.updated_at, locale)}
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
