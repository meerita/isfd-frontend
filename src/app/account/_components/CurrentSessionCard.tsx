/** @format */

'use client';

import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import type { CurrentSessionResponse, MeApiResult } from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';
import { useCurrentSession } from '../_hooks/useCurrentSession';
import AccountDetailItem from './AccountDetailItem';

function formatDateTime(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export default function CurrentSessionCard({
  sessionResult,
}: Readonly<{
  sessionResult: MeApiResult<CurrentSessionResponse>;
}>): React.JSX.Element {
  const { session, error, retry } = useCurrentSession(sessionResult);

  return (
    <Card padding={24}>
      <Grid gap={8}>
        <Text size='small' color='gray'>
          {ACCOUNT_COPY.sections.session}
        </Text>
        <Title size='medium' as='h2'>
          {ACCOUNT_COPY.overview.sessionTitle}
        </Title>
      </Grid>

      {session ? (
        <Grid columns={2} gap={16}>
          <AccountDetailItem
            label={ACCOUNT_COPY.labels.sessionId}
            value={session.session_id}
            sensitive
          />
          <AccountDetailItem
            label={ACCOUNT_COPY.labels.userId}
            value={session.user_id}
            sensitive
          />
          <AccountDetailItem
            label={ACCOUNT_COPY.labels.deviceId}
            value={session.device_id}
            sensitive
          />
          <AccountDetailItem
            label={ACCOUNT_COPY.labels.createdAt}
            value={formatDateTime(session.created_at)}
          />
          <AccountDetailItem
            label={ACCOUNT_COPY.labels.lastSeenAt}
            value={formatDateTime(session.last_seen_at)}
          />
          <AccountDetailItem
            label={ACCOUNT_COPY.labels.refreshTokenExpiresAt}
            value={formatDateTime(session.refresh_token_expires_at)}
          />
        </Grid>
      ) : (
        <Grid gap={8}>
          <Text color='gray'>{error?.message ?? ACCOUNT_COPY.session.loadError}</Text>
          <Button type='button' variant='borderless' onClick={retry}>
            {ACCOUNT_COPY.session.retry}
          </Button>
        </Grid>
      )}
    </Card>
  );
}
