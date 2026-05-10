/** @format */

import Grid from '@/_components/layout/Grid';
import SensitiveValue from '@/_components/SensitiveValue';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';

export default function AccountDetailItem({
  label,
  value,
  sensitive = false,
}: Readonly<{
  label: string;
  value: string;
  sensitive?: boolean;
}>): React.JSX.Element {
  return (
    <Grid gap={4}>
      <Text size='small' color='gray'>
        {label}
      </Text>
      {sensitive ? (
        <SensitiveValue value={value} size='medium' weight='semibold' />
      ) : (
        <Title size='normal' weight='semibold' as='h3'>
          {value}
        </Title>
      )}
    </Grid>
  );
}
