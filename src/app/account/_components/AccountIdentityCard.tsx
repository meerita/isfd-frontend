/** @format */

'use client';

import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { buildAccountHref } from '@/_helpers/account';
import type { GetMyProfileResponse, MeResponse } from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';
import { useMe } from '../_hooks/useMe';
import AccountDetailItem from './AccountDetailItem';

function formatDateTime(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export default function AccountIdentityCard({
  me,
  profile,
}: Readonly<{
  me: MeResponse;
  profile: GetMyProfileResponse | null;
}>): React.JSX.Element {
  const { displayName, avatarUrl } = useMe(me, profile);

  return (
    <Card padding={24}>
      <Grid gap={8}>
        <Text size='small' color='gray'>
          {ACCOUNT_COPY.overview.identityTitle}
        </Text>
        <Title size='medium' as='h2'>
          {displayName}
        </Title>
        <Text color='gray'>{me.email}</Text>
        <Text size='small' color='lighterGray'>
          {avatarUrl ?? ACCOUNT_COPY.overview.noProfile}
        </Text>
      </Grid>

      <Grid columns={2} gap={16}>
        <AccountDetailItem
          label={ACCOUNT_COPY.labels.userId}
          value={me.user_id}
          sensitive
        />
        <AccountDetailItem
          label={ACCOUNT_COPY.labels.username}
          value={me.username}
        />
        <AccountDetailItem label={ACCOUNT_COPY.labels.email} value={me.email} />
        <AccountDetailItem
          label={ACCOUNT_COPY.labels.platformRole}
          value={me.platform_role}
        />
        <AccountDetailItem label={ACCOUNT_COPY.labels.status} value={me.status} />
        <AccountDetailItem
          label={ACCOUNT_COPY.labels.sessionId}
          value={me.session_id}
          sensitive
        />
        <AccountDetailItem
          label={ACCOUNT_COPY.labels.issuedAt}
          value={formatDateTime(me.issued_at)}
        />
        <AccountDetailItem
          label={ACCOUNT_COPY.labels.expiresAt}
          value={formatDateTime(me.expires_at)}
        />
      </Grid>

      <Grid display='flex' gap={8}>
        <Button href={buildAccountHref({ section: 'profile' })}>
          {profile
            ? ACCOUNT_COPY.overview.editProfileCta
            : ACCOUNT_COPY.overview.createProfileCta}
        </Button>
        <Button
          href={buildAccountHref({ section: 'contributions' })}
          variant='borderless'
        >
          {ACCOUNT_COPY.overview.contributionsCta}
        </Button>
      </Grid>
    </Card>
  );
}
