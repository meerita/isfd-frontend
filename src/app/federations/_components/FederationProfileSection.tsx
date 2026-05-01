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
import type { Federation, FederationLevel } from '@/_types/federation';

const PLACEHOLDER = '--';

type FederationProfileSectionProps = Readonly<{
  federation: Federation;
  countryLabel?: string | null;
  cityLabel?: string | null;
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

function getFederationLevelLabel(value: FederationLevel): string {
  switch (value) {
    case 'WORLD':
      return 'World';
    case 'CONTINENTAL':
      return 'Continental';
    case 'NATIONAL':
    default:
      return 'National';
  }
}

export default function FederationProfileSection({
  federation,
  countryLabel,
  cityLabel,
}: FederationProfileSectionProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();

  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={federation.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title={dictionary.federations.detail.identity}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.federations.form.name}
                    value={federation.name}
                  />
                  <DataRow
                    label={dictionary.federations.form.federationLevel}
                    value={getFederationLevelLabel(federation.federationLevel)}
                  />
                  <DataRow
                    label={dictionary.federations.form.nativeName}
                    value={formatText(federation.nativeName)}
                  />
                  <DataRow
                    label={dictionary.federations.form.shortName}
                    value={formatText(federation.shortName)}
                  />
                  <DataRow
                    label={dictionary.federations.form.acronym}
                    value={formatText(federation.acronym)}
                  />
                  <DataRow
                    label={dictionary.federations.form.slug}
                    value={federation.slug}
                    monospace
                  />
                  <DataRow
                    label={dictionary.federations.form.activeLabel}
                    value={<Dot inline active={federation.isActive} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.federations.detail.foundation}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.federations.form.foundationDate}
                    value={formatDate(federation.foundationDate, locale)}
                  />
                  <DataRow
                    label={dictionary.federations.form.description}
                    value={formatText(federation.description)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>

          <Section gap={32}>
            <DataRowSection title={dictionary.federations.detail.location}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.federations.form.countryId}
                    value={formatText(countryLabel ?? federation.countryId)}
                  />
                  <DataRow
                    label={dictionary.federations.form.cityId}
                    value={formatText(cityLabel ?? federation.cityId)}
                  />
                  <DataRow
                    label={dictionary.federations.form.officialWebsiteUrl}
                    value={formatText(federation.officialWebsiteUrl)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.federations.detail.metadata}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.federations.form.id}
                    value={federation.id}
                    monospace
                  />
                  <DataRow
                    label={dictionary.federations.form.createdAt}
                    value={formatDateTime(federation.createdAt, locale)}
                  />
                  <DataRow
                    label={dictionary.federations.form.updatedAt}
                    value={formatDateTime(federation.updatedAt, locale)}
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
