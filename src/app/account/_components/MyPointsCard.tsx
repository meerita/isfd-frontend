/** @format */

'use client';

import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import type { GetMyPointsResponse, MeApiResult } from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';
import { useMyPoints } from '../_hooks/useMyPoints';

export default function MyPointsCard({
  pointsResult,
}: Readonly<{
  pointsResult: MeApiResult<GetMyPointsResponse>;
}>): React.JSX.Element {
  const { points, error, retry } = useMyPoints(pointsResult);

  return (
    <Card padding={24}>
      <Grid gap={8}>
        <Text size='small' color='gray'>
          {ACCOUNT_COPY.overview.pointsTitle}
        </Text>
        {points ? (
          <>
            <Title size='large' as='h2'>
              {String(points.total_points)}
            </Title>
            <Text color='gray'>{ACCOUNT_COPY.labels.totalPoints}</Text>
          </>
        ) : (
          <>
            <Text color='gray'>
              {error?.message ?? ACCOUNT_COPY.points.loadError}
            </Text>
            <Button
              type='button'
              variant='borderless'
              onClick={retry}
            >
              {ACCOUNT_COPY.points.retry}
            </Button>
          </>
        )}
      </Grid>
    </Card>
  );
}
