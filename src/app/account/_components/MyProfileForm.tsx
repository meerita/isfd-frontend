/** @format */

'use client';

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import type { GetMyProfileResponse } from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';
import { useUpdateMyProfile } from '../_hooks/useUpdateMyProfile';
import AccountProfileSummaryCard from './AccountProfileSummaryCard';

export default function MyProfileForm({
  initialProfile,
}: Readonly<{
  initialProfile: GetMyProfileResponse | null;
}>): React.JSX.Element {
  const { profile, values, errors, isPending, setFieldValue, submit } =
    useUpdateMyProfile(initialProfile);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    submit();
  }

  return (
    <Grid gap={16}>
      <Card padding={24}>
        <Grid gap={8}>
          <Text size='small' color='gray'>
            {ACCOUNT_COPY.profile.title}
          </Text>
          <Title size='medium' as='h2'>
            {ACCOUNT_COPY.sections.profile}
          </Title>
          <Text color='gray'>{ACCOUNT_COPY.profile.subtitle}</Text>
          {!profile ? (
            <Text color='gray'>{ACCOUNT_COPY.profile.createMode}</Text>
          ) : null}
          {errors.form ? <Text color='red'>{errors.form}</Text> : null}
        </Grid>

        <Form onSubmit={handleSubmit}>
          <Grid gap={16}>
            <TextInput
              label={ACCOUNT_COPY.labels.displayName}
              value={values.display_name}
              onChange={event => setFieldValue('display_name', event.currentTarget.value)}
              disabled={isPending}
            />
            <TextArea
              label={ACCOUNT_COPY.labels.bio}
              value={values.bio}
              onChange={event => setFieldValue('bio', event.currentTarget.value)}
              disabled={isPending}
            />
            <TextInput
              label={ACCOUNT_COPY.labels.avatarUrl}
              value={values.avatar_url}
              onChange={event => setFieldValue('avatar_url', event.currentTarget.value)}
              disabled={isPending}
            />
            <Select
              label={ACCOUNT_COPY.labels.visibility}
              value={values.visibility}
              onChange={event =>
                setFieldValue(
                  'visibility',
                  event.currentTarget.value as 'public' | 'private',
                )
              }
              error={Boolean(errors.visibility)}
              helperText={errors.visibility}
              disabled={isPending}
            >
              <option value='public'>
                {ACCOUNT_COPY.profile.visibilityOptions.public}
              </option>
              <option value='private'>
                {ACCOUNT_COPY.profile.visibilityOptions.private}
              </option>
            </Select>

            <Grid display='flex' gap={8}>
              <Button type='submit' disabled={isPending}>
                {isPending
                  ? ACCOUNT_COPY.profile.saving
                  : ACCOUNT_COPY.profile.save}
              </Button>
            </Grid>
          </Grid>
        </Form>
      </Card>

      <AccountProfileSummaryCard profile={profile} />
    </Grid>
  );
}
