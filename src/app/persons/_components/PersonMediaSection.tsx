/** @format */

'use client';

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import DataRowSection from '@/_components/layout/DataRowSection';
import SectionHeader from '@/_components/layout/SectionHeader';
import DataRow from '@/_components/tables/DataRow';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Text from '@/_components/typography/Text';
import { useI18n } from '@/_i18n/I18nProvider';
import type { PersonAdminDetail, PersonPublicDetail } from '@/_types/person';

type PersonMediaSectionProps = Readonly<{
  person: PersonAdminDetail;
  publicPerson?: PersonPublicDetail | null;
}>;

function renderImagePreview(url: string | null | undefined, alt: string) {
  if (!url) {
    return (
      <Grid
        className='background-color--lightest-gray border-radius--4'
        style={{ minHeight: 160, placeItems: 'center' }}
      >
        <Text color='gray' size='small'>
          {alt}
        </Text>
      </Grid>
    );
  }

  return (
    <div
      aria-label={alt}
      role='img'
      style={{
        width: '100%',
        minHeight: 160,
        maxHeight: 240,
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

export default function PersonMediaSection({
  person,
  publicPerson,
}: PersonMediaSectionProps): React.JSX.Element {
  const { dictionary } = useI18n();
  const avatarUrl = person.avatar_image_url ?? publicPerson?.avatar_image_url;
  const heroUrl = person.hero_image_url ?? publicPerson?.hero_image_url;

  return (
    <Card>
      <Grid gap={24}>
        <SectionHeader title={dictionary.persons.detail.media} />
        <Grid gap={24} columns={2}>
          <DataRowSection title={dictionary.persons.form.avatarImageUrl}>
            <Grid gap={16}>
              {renderImagePreview(
                avatarUrl,
                dictionary.persons.detail.noAvatarAvailable,
              )}
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.persons.form.avatarImageUrl}
                    value={avatarUrl ?? '--'}
                  />
                </Tbody>
              </Table>
            </Grid>
          </DataRowSection>

          <DataRowSection title={dictionary.persons.form.heroImageUrl}>
            <Grid gap={16}>
              {renderImagePreview(
                heroUrl,
                dictionary.persons.detail.noHeroAvailable,
              )}
              <Table>
                <Tbody>
                  <DataRow
                    label={dictionary.persons.form.heroImageUrl}
                    value={heroUrl ?? '--'}
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
