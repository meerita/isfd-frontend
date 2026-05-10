/** @format */

'use client';

import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { buildAccountHref } from '@/_helpers/account';
import type { GetMyProfileResponse } from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';
import { useMyProfile } from '../_hooks/useMyProfile';
import AccountDetailItem from './AccountDetailItem';

function formatDateTime(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export default function AccountProfileSummaryCard({
  profile,
}: Readonly<{
  profile: GetMyProfileResponse | null;
}>): React.JSX.Element {
  const { hasProfile } = useMyProfile(profile);

  return (
    <Card padding={24}>
      <Grid gap={8}>
        <Text size='small' color='gray'>
          {ACCOUNT_COPY.overview.profileTitle}
        </Text>
        <Title size='small' as='h2'>
          {hasProfile
            ? profile?.display_name ?? ACCOUNT_COPY.sections.profile
            : ACCOUNT_COPY.profile.createMode}
        </Title>
        {!hasProfile ? (
          <Text color='gray'>{ACCOUNT_COPY.overview.noProfile}</Text>
        ) : null}
      </Grid>

      {profile ? (
        <Grid gap={16}>
          <Grid columns={2} gap={16}>
            <AccountDetailItem
              label={ACCOUNT_COPY.labels.displayName}
              value={profile.display_name ?? '--'}
            />
            <AccountDetailItem
              label={ACCOUNT_COPY.labels.visibility}
              value={profile.visibility}
            />
            <AccountDetailItem
              label={ACCOUNT_COPY.labels.avatarUrl}
              value={profile.avatar_url ?? '--'}
            />
            <AccountDetailItem
              label={ACCOUNT_COPY.labels.bio}
              value={profile.bio ?? '--'}
            />
            <AccountDetailItem
              label={ACCOUNT_COPY.labels.createdAt}
              value={formatDateTime(profile.created_at)}
            />
            <AccountDetailItem
              label={ACCOUNT_COPY.labels.updatedAt}
              value={formatDateTime(profile.updated_at)}
            />
          </Grid>
        </Grid>
      ) : null}

      <Button href={buildAccountHref({ section: 'profile' })}>
        {hasProfile
          ? ACCOUNT_COPY.overview.editProfileCta
          : ACCOUNT_COPY.overview.createProfileCta}
      </Button>
    </Card>
  );
}
