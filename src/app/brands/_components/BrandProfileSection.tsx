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
import type { Brand } from '@/_types/brand';

const PLACEHOLDER = '--';

type BrandProfileSectionProps = Readonly<{
  brand: Brand;
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

export default function BrandProfileSection({
  brand,
}: BrandProfileSectionProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();

  return (
    <Card>
      <Grid gap={32}>
        <SectionHeader title={brand.name} />
        <Grid gap={32} columns={2}>
          <Section gap={32}>
            <DataRowSection title={dictionary.brands.detail.identity}>
              <Table>
                <Tbody>
                  <DataRow label={dictionary.brands.form.name} value={brand.name} />
                  <DataRow
                    label={dictionary.brands.form.slug}
                    value={brand.slug}
                    monospace
                  />
                  <DataRow
                    label={dictionary.brands.form.activeLabel}
                    value={<Dot inline active={brand.isActive} />}
                  />
                </Tbody>
              </Table>
            </DataRowSection>

            <DataRowSection title={dictionary.brands.detail.links}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.brands.form.websiteUrl}
                    value={formatText(brand.websiteUrl)}
                  />
                </Tbody>
              </Table>
            </DataRowSection>
          </Section>

          <Section gap={32}>
            <DataRowSection title={dictionary.brands.detail.metadata}>
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.brands.form.id}
                    value={brand.id}
                    monospace
                  />
                  <DataRow
                    label={dictionary.brands.form.createdAt}
                    value={formatDateTime(brand.createdAt, locale)}
                  />
                  <DataRow
                    label={dictionary.brands.form.updatedAt}
                    value={formatDateTime(brand.updatedAt, locale)}
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
