/** @format */

'use client';

import Card from '@/_components/Card';
import Dot from '@/_components/Dot';
import LastUpdated from '@/_components/forms/LastUpdated';
import DataRowSection from '@/_components/layout/DataRowSection';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import SectionHeader from '@/_components/layout/SectionHeader';
import DataRow from '@/_components/tables/DataRow';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import {
  getPersonCurrentProfessionLabel,
  getPersonDominantFootLabel,
  getPersonEthnicityLabel,
  getPersonGenderLabel,
  getPersonHairColorLabel,
  getPersonSkinColorLabel,
} from '@/_constants/enums/person';
import { useI18n } from '@/_i18n/I18nProvider';
import type { PersonAdminDetail } from '@/_types/person';

const PLACEHOLDER = '--';

type PersonProfileSectionProps = Readonly<{
  person: PersonAdminDetail;
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
  return Number.isNaN(parsed.getTime()) ? PLACEHOLDER : parsed.toLocaleDateString(locale);
}

function formatDateTime(value: string, locale: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? PLACEHOLDER : parsed.toLocaleString(locale);
}

function formatNumber(value: number | null | undefined, suffix?: string): string {
  if (typeof value !== 'number') {
    return PLACEHOLDER;
  }

  return suffix ? `${value} ${suffix}` : String(value);
}

export default function PersonProfileSection({
  person,
}: PersonProfileSectionProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();
  const updatedAt = new Date(person.updated_at);

  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={person.full_name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title={dictionary.persons.detail.communityIdentity}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.persons.form.fullName}
                    value={person.full_name}
                  />
                  <DataRow
                    label={dictionary.persons.form.displayName}
                    value={formatText(person.display_name)}
                  />
                  <DataRow
                    label={dictionary.persons.form.knownAs}
                    value={formatText(person.known_as)}
                  />
                  <DataRow
                    label={dictionary.persons.form.slug}
                    value={person.slug}
                    monospace
                  />
                  <DataRow
                    label={dictionary.persons.form.activeLabel}
                    value={<Dot inline active={person.is_public} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.persons.detail.legalIdentity}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.persons.form.firstName}
                    value={formatText(person.first_name)}
                  />
                  <DataRow
                    label={dictionary.persons.form.middleName}
                    value={formatText(person.middle_name)}
                  />
                  <DataRow
                    label={dictionary.persons.form.lastName}
                    value={formatText(person.last_name)}
                  />
                  <DataRow
                    label={dictionary.persons.form.secondSurname}
                    value={formatText(person.second_surname)}
                  />
                  <DataRow
                    label={dictionary.persons.form.nativeFullName}
                    value={formatText(person.native_full_name)}
                  />
                  <DataRow
                    label={dictionary.persons.form.birthDate}
                    value={formatDate(person.birth_date, locale)}
                  />
                  <DataRow
                    label={dictionary.persons.form.deceased}
                    value={<Dot inline active={person.is_deceased} />}
                  />
                  {person.is_deceased ? (
                    <DataRow
                      label={dictionary.persons.form.deathDate}
                      value={formatDate(person.death_date, locale)}
                    />
                  ) : null}
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.persons.detail.location}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.persons.detail.birthLocation}
                    value={formatText(person.birth_location_id)}
                  />
                  <DataRow
                    label={dictionary.persons.detail.currentLocation}
                    value={formatText(person.current_city_id)}
                  />
                  <DataRow
                    label={dictionary.persons.detail.primaryNationality}
                    value={formatText(person.primary_nationality_country_id)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>

          <Section gap={32}>
            <DataRowSection title={dictionary.persons.detail.physicalDetails}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.persons.form.gender}
                    value={getPersonGenderLabel(person.gender) ?? PLACEHOLDER}
                  />
                  <DataRow
                    label={dictionary.persons.form.dominantFoot}
                    value={
                      getPersonDominantFootLabel(person.dominant_foot) ??
                      PLACEHOLDER
                    }
                  />
                  <DataRow
                    label={dictionary.persons.form.heightCm}
                    value={formatNumber(person.height_cm, 'cm')}
                  />
                  <DataRow
                    label={dictionary.persons.form.weightKg}
                    value={formatNumber(person.weight_kg, 'kg')}
                  />
                  <DataRow
                    label={dictionary.persons.form.hairColor}
                    value={
                      getPersonHairColorLabel(person.hair_color) ?? PLACEHOLDER
                    }
                  />
                  <DataRow
                    label={dictionary.persons.form.ethnicity}
                    value={
                      getPersonEthnicityLabel(person.ethnicity) ?? PLACEHOLDER
                    }
                  />
                  <DataRow
                    label={dictionary.persons.form.skinColor}
                    value={
                      getPersonSkinColorLabel(person.skin_color) ?? PLACEHOLDER
                    }
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.persons.detail.professionalInformation}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.persons.form.currentProfession}
                    value={
                      getPersonCurrentProfessionLabel(person.current_profession) ??
                      PLACEHOLDER
                    }
                  />
                  <DataRow
                    label={dictionary.persons.form.professionalDebutDate}
                    value={formatDate(
                      person.professional_division_debut_date,
                      locale,
                    )}
                  />
                  <DataRow
                    label={dictionary.persons.form.retirementDate}
                    value={formatDate(person.retirement_date, locale)}
                  />
                  <DataRow
                    label={dictionary.persons.form.createdAt}
                    value={formatDateTime(person.created_at, locale)}
                  />
                  <DataRow
                    label={dictionary.persons.form.updatedAt}
                    value={formatDateTime(person.updated_at, locale)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>
        </Grid>

        {!Number.isNaN(updatedAt.getTime()) ? <LastUpdated date={updatedAt} /> : null}
      </Grid>
    </Card>
  );
}
