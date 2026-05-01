/** @format */
/**
 * @file src/app/persons/_components/PersonUnavailable.tsx
 * @description Renders a localized unavailable state for the persons area.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';

import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';

type PersonUnavailableProps = Readonly<{
  title?: string;
  message: string;
}>;

export default function PersonUnavailable({
  title,
  message,
}: PersonUnavailableProps): React.JSX.Element {
  const { dictionary } = useI18n();

  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>
          {title ?? dictionary.persons.detail.notAvailableTitle}
        </Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.PERSONS}>
          {dictionary.persons.detail.backToPersons}
        </Button>
      </Grid>
    </Main>
  );
}
