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
import { useI18n } from '@/_i18n/I18nProvider';
import type { Club } from '@/_types/club';

const PLACEHOLDER = '--';

type ClubProfileSectionProps = Readonly<{
  club: Club;
  countryLabel?: string | null;
  cityLabel?: string | null;
  primaryStadiumLabel?: string | null;
}>;

function formatText(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : PLACEHOLDER;
}

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) {
    return PLACEHOLDER;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(locale);
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? PLACEHOLDER
    : parsed.toLocaleDateString(locale);
}

function formatDateTime(value: string, locale: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? PLACEHOLDER
    : parsed.toLocaleString(locale);
}

export default function ClubProfileSection({
  club,
  countryLabel,
  cityLabel,
  primaryStadiumLabel,
}: ClubProfileSectionProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();

  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={club.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title={dictionary.clubs.detail.identity}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.clubs.form.name}
                    value={club.name}
                  />
                  <DataRow
                    label={dictionary.clubs.form.shortName}
                    value={formatText(club.shortName)}
                  />
                  <DataRow
                    label={dictionary.clubs.form.acronym}
                    value={formatText(club.acronym)}
                  />
                  <DataRow
                    label={dictionary.clubs.form.nativeName}
                    value={formatText(club.nativeName)}
                  />
                  <DataRow
                    label={dictionary.clubs.form.foundedAs}
                    value={formatText(club.foundedAs)}
                  />
                  <DataRow
                    label={dictionary.clubs.form.slug}
                    value={club.slug}
                    monospace
                  />
                  <DataRow
                    label={dictionary.clubs.form.activeLabel}
                    value={<Dot inline active={club.isActive} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.clubs.detail.foundation}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.clubs.form.foundedAt}
                    value={formatDate(club.foundedAt, locale)}
                  />
                  <DataRow
                    label={dictionary.clubs.form.dissolved}
                    value={<Dot inline active={club.isDissolved} />}
                  />
                  {club.isDissolved ? (
                    <DataRow
                      label={dictionary.clubs.form.dissolvedAt}
                      value={formatDate(club.dissolvedAt, locale)}
                    />
                  ) : null}
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>

          <Section gap={32}>
            <DataRowSection title={dictionary.clubs.detail.location}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.clubs.form.countryId}
                    value={formatText(countryLabel ?? club.countryId)}
                  />
                  <DataRow
                    label={dictionary.clubs.form.cityId}
                    value={formatText(cityLabel ?? club.cityId)}
                  />
                  <DataRow
                    label={dictionary.clubs.form.primaryStadiumId}
                    value={formatText(
                      primaryStadiumLabel ?? club.primaryStadiumId,
                    )}
                  />
                  <DataRow
                    label={dictionary.clubs.form.officialWebsiteUrl}
                    value={formatText(club.officialWebsiteUrl)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.clubs.detail.metadata}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.clubs.form.id}
                    value={club.id}
                    monospace
                  />
                  <DataRow
                    label={dictionary.clubs.form.createdAt}
                    value={formatDateTime(club.createdAt, locale)}
                  />
                  <DataRow
                    label={dictionary.clubs.form.updatedAt}
                    value={formatDateTime(club.updatedAt, locale)}
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
