/** @format */

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';

type PersonSectionPlaceholderProps = Readonly<{
  title: string;
  description: string;
}>;

export default function PersonSectionPlaceholder({
  title,
  description,
}: PersonSectionPlaceholderProps): React.JSX.Element {
  return (
    <Card>
      <Grid gap={16}>
        <SectionHeader title={title} />
        <Text color='gray' size='small'>
          {description}
        </Text>
      </Grid>
    </Card>
  );
}
