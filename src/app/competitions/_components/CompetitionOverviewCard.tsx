/** @format */

import Link from 'next/link';

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';

type CompetitionOverviewCardProps = Readonly<{
  href: string;
  title: string;
  description: string;
  count: string;
}>;

export default function CompetitionOverviewCard({
  href,
  title,
  description,
  count,
}: CompetitionOverviewCardProps): React.JSX.Element {
  return (
    <Link href={href} className='text-decoration-line--none'>
      <Card padding={24}>
        <Grid gap={16}>
          <Text size='small' color='gray'>
            {count}
          </Text>
          <Title size='small'>{title}</Title>
          <Text size='small' color='gray'>
            {description}
          </Text>
        </Grid>
      </Card>
    </Link>
  );
}
