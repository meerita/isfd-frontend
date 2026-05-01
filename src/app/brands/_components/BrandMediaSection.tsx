/** @format */

'use client';

import Card from '@/_components/Card';
import DataRowSection from '@/_components/layout/DataRowSection';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import DataRow from '@/_components/tables/DataRow';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Text from '@/_components/typography/Text';
import { useI18n } from '@/_i18n/I18nProvider';
import type { Brand } from '@/_types/brand';

type BrandMediaSectionProps = Readonly<{
  brand: Brand;
}>;

function renderImagePreview(url: string | null | undefined, fallback: string) {
  if (!url) {
    return (
      <Grid
        className='background-color--lightest-gray border-radius--4'
        style={{ minHeight: 220, placeItems: 'center' }}
      >
        <Text color='gray' size='small'>
          {fallback}
        </Text>
      </Grid>
    );
  }

  return (
    <div
      aria-label={fallback}
      role='img'
      style={{
        width: '100%',
        minHeight: 220,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${url})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    />
  );
}

export default function BrandMediaSection({
  brand,
}: BrandMediaSectionProps): React.JSX.Element {
  const { dictionary } = useI18n();

  return (
    <Card>
      <Grid gap={24}>
        <SectionHeader title={dictionary.brands.detail.media} />
        <Grid gap={24} columns={2}>
          <DataRowSection title={dictionary.brands.form.iconImageUrl}>
            <Grid gap={16}>
              {renderImagePreview(
                brand.iconImageUrl,
                dictionary.brands.detail.noIconAvailable,
              )}
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.brands.form.iconImageUrl}
                    value={brand.iconImageUrl ?? '--'}
                  />
                </Tbody>
              </Table>
            </Grid>
          </DataRowSection>

          <DataRowSection title={dictionary.brands.form.detailImageUrl}>
            <Grid gap={16}>
              {renderImagePreview(
                brand.detailImageUrl,
                dictionary.brands.detail.noDetailImageAvailable,
              )}
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.brands.form.detailImageUrl}
                    value={brand.detailImageUrl ?? '--'}
                  />
                </Tbody>
              </Table>
            </Grid>
          </DataRowSection>
        </Grid>
      </Grid>
    </Card>
  );
}
