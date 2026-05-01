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
import type { Stadium } from '@/_types/stadium';

type StadiumMediaSectionProps = Readonly<{
  stadium: Stadium;
}>;

function renderImagePreview(url: string | null | undefined, fallback: string) {
  if (!url) {
    return (
      <Grid
        className='background-color--lightest-gray border-radius--4'
        style={{ minHeight: 240, placeItems: 'center' }}
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
        minHeight: 240,
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

export default function StadiumMediaSection({
  stadium,
}: StadiumMediaSectionProps): React.JSX.Element {
  const { dictionary } = useI18n();

  return (
    <Card>
      <Grid gap={24}>
        <SectionHeader title={dictionary.stadiums.detail.media} />
        <DataRowSection title={dictionary.stadiums.form.imageUrl}>
          <Grid gap={16}>
            {renderImagePreview(
              stadium.imageUrl,
              dictionary.stadiums.detail.noImageAvailable,
            )}
            <Table>
              <Tbody>
                <DataRow
                  label={dictionary.stadiums.form.imageUrl}
                  value={stadium.imageUrl ?? '--'}
                />
              </Tbody>
            </Table>
          </Grid>
        </DataRowSection>
      </Grid>
    </Card>
  );
}
