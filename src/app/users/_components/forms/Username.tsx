/** @format */

'use client';
import { useEffect, useMemo, useState, useTransition } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import { updateUsername } from '@/_actions/user/updateUsername';
import type { User } from '@/_types/user';
import Card from '@/_components/Card';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';

type FeedbackState = Readonly<{
  status: 'success' | 'error';
  message: string;
}>;

export default function ChangeUsernameForm({ user }: Readonly<{ user: User }>) {
  const router = useRouter();
  const currentUsername = useMemo(() => {
    return (user.identity?.username ?? '').trim();
  }, [user.identity?.username]);
  const [usernameValue, setUsernameValue] = useState(currentUsername);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setUsernameValue(currentUsername);
  }, [currentUsername]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    setUsernameValue(event.target.value);
    if (feedback) {
      setFeedback(null);
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmedUsername = usernameValue.trim();

    if (!trimmedUsername) {
      setFeedback({ status: 'error', message: 'Username is required.' });
      return;
    }

    startTransition(function submitUsernameTransition() {
      void submitUsername(trimmedUsername, currentUsername);
    });
  }

  async function submitUsername(
    nextUsername: string,
    originUsername: string,
  ): Promise<void> {
    const normalizedUuid = user.uuid.trim();

    if (!normalizedUuid) {
      const uuidError = 'Missing user identifier to update username.';
      setFeedback({ status: 'error', message: uuidError });
      toast.error(uuidError);
      return;
    }

    try {
      const result = await updateUsername({
        uuid: normalizedUuid,
        currentUsername: originUsername,
        nextUsername,
      });

      if (result.status === 'error') {
        const errorMessage =
          result.error?.message ?? 'Unable to update username.';
        setFeedback({ status: 'error', message: errorMessage });
        toast.error(errorMessage, {
          description: result.error?.reason,
        });
        return;
      }

      setFeedback({ status: 'success', message: 'Username has been updated' });
      toast.success('Username has been updated');
      setUsernameValue(nextUsername);
      const encodedNext = encodeURIComponent(nextUsername);
      router.replace(`/users/${encodedNext}?value=${encodedNext}`);
      router.refresh();
    } catch (error: unknown) {
      const fallbackMessage =
        error instanceof Error ? error.message : 'Unable to update username.';
      setFeedback({ status: 'error', message: fallbackMessage });
      toast.error(fallbackMessage, {
        description: 'Unexpected error while updating username.',
      });
    }
  }

  return (
    <Card>
      <SectionHeader title='Change Username' icon='name' />
      <Form onSubmit={handleSubmit} method='post'>
        <Text size='small' color='gray' className='margin-bottom--0'>
          Usernames must be 2-32 characters long and can only contain letters,
          numbers, underscores, or hyphens. Spaces and special characters are
          not allowed.
        </Text>
        <Grid columns={2} gap={32}>
          <TextInput
            label='Username'
            name='identity.username'
            value={usernameValue}
            onChange={handleInputChange}
            placeholder='Choose a username without spaces'
            disabled={isPending}
            minLength={2}
            maxLength={32}
            pattern='^[A-Za-z0-9_-]+$'
            title='Username can include letters, numbers, underscores or hyphens only.'
            autoComplete='off'
          />
        </Grid>
        <ButtonGroup>
          <Button
            type='submit'
            color='primary'
            icon='send'
            disabled={isPending}
          >
            {isPending ? 'Updating...' : 'Change Username'}
          </Button>
        </ButtonGroup>
      </Form>
    </Card>
  );
}
