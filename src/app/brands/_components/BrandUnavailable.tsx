/** @format */

'use client';

import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';

type BrandUnavailableProps = Readonly<{
  title?: string;
  message: string;
}>;

export default function BrandUnavailable({
  title,
  message,
}: BrandUnavailableProps): React.JSX.Element {
  const { dictionary } = useI18n();

  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>
          {title ?? dictionary.brands.detail.notAvailableTitle}
        </Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.BRANDS}>{dictionary.brands.detail.backToBrands}</Button>
      </Grid>
    </Main>
  );
}
