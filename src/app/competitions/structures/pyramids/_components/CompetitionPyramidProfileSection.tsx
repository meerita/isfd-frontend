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
  getCompetitionPyramidBranchKindLabel,
  getCompetitionPyramidScopeKindLabel,
} from '@/_constants/enums/competition';
import { useI18n } from '@/_i18n/I18nProvider';
import type { CompetitionPyramid } from '@/_types/competitionStructure';
import { formatDateTime, PLACEHOLDER } from '../../../_components/utils';

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

type CompetitionPyramidProfileSectionProps = Readonly<{
  competitionPyramid: CompetitionPyramid;
  countryLabel?: string | null;
  federationLabel?: string | null;
}>;

function formatDateOnlyValue(value: string, locale: string): string {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export default function CompetitionPyramidProfileSection({
  competitionPyramid,
  countryLabel,
  federationLabel,
}: CompetitionPyramidProfileSectionProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();
  const profileDictionary = dictionary.competitions.pyramids;

  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={competitionPyramid.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title={profileDictionary.sections.identity}>
              <Table>
                <Tbody>
                  <DataRow
                    label={profileDictionary.fields.name}
                    value={competitionPyramid.name}
                  />
                  <DataRow
                    label={profileDictionary.fields.code}
                    value={competitionPyramid.code}
                    monospace
                  />
                  <DataRow
                    label={profileDictionary.fields.slug}
                    value={competitionPyramid.slug}
                    monospace
                  />
                  <DataRow
                    label={profileDictionary.fields.active}
                    value={<Dot inline active={competitionPyramid.isActive} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={profileDictionary.sections.relations}>
              <Table>
                <Tbody>
                  <DataRow
                    label={profileDictionary.fields.country}
                    value={countryLabel ?? competitionPyramid.countryId}
                  />
                  <DataRow
                    label={profileDictionary.fields.federation}
                    value={
                      federationLabel ??
                      competitionPyramid.federationId ??
                      PLACEHOLDER
                    }
                  />
                  <DataRow
                    label={profileDictionary.fields.scope}
                    value={getCompetitionPyramidScopeKindLabel(
                      competitionPyramid.scopeKind,
                      locale,
                    )}
                  />
                  <DataRow
                    label={profileDictionary.fields.branch}
                    value={
                      competitionPyramid.branchKind
                        ? getCompetitionPyramidBranchKindLabel(
                            competitionPyramid.branchKind,
                            locale,
                          )
                        : PLACEHOLDER
                    }
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>

          <Section gap={32}>
            <DataRowSection title={profileDictionary.sections.validity}>
              <Table>
                <Tbody>
                  <DataRow
                    label={profileDictionary.fields.validFrom}
                    value={formatDateOnlyValue(
                      competitionPyramid.validFrom,
                      locale,
                    )}
                  />
                  <DataRow
                    label={profileDictionary.fields.validTo}
                    value={
                      competitionPyramid.validTo
                        ? formatDateOnlyValue(
                            competitionPyramid.validTo,
                            locale,
                          )
                        : PLACEHOLDER
                    }
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={profileDictionary.sections.metadata}>
              <Table>
                <Tbody>
                  <DataRow
                    label={profileDictionary.fields.id}
                    value={competitionPyramid.id}
                    monospace
                  />
                  <DataRow
                    label={profileDictionary.fields.versionId}
                    value={competitionPyramid.versionId ?? PLACEHOLDER}
                    monospace
                  />
                  <DataRow
                    label={profileDictionary.fields.createdAt}
                    value={formatDateTime(competitionPyramid.createdAt)}
                  />
                  <DataRow
                    label={profileDictionary.fields.updatedAt}
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
