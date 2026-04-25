/** @format */
'use client';

import { updateUserNotifications } from '@/_actions/user/updateUserNotifications';
import DoubleLineIconCheckbox from '@/_components/forms/DoubleLineIconCheckbox';
import FieldSet from '@/_components/forms/Fieldset';
import Form from '@/_components/forms/Form';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Title from '@/_components/typography/Title';
import { User } from '@/_types/user';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type NotificationsState = Readonly<{
  group: Readonly<{
    events: boolean;
    invites: boolean;
    members: boolean;
    petitions: boolean;
    records: boolean;
  }>;
  general: Readonly<{
    announcements: boolean;
    updates: boolean;
  }>;
}>;

type GroupField = keyof NotificationsState['group'];
type GeneralField = keyof NotificationsState['general'];

const buildInitialNotifications = (user: User): NotificationsState => ({
  group: {
    events: Boolean(user.settings?.notifications?.group?.events),
    invites: Boolean(user.settings?.notifications?.group?.invites),
    members: Boolean(user.settings?.notifications?.group?.members),
    petitions: Boolean(user.settings?.notifications?.group?.petitions),
    records: Boolean(user.settings?.notifications?.group?.records),
  },
  general: {
    announcements: Boolean(
      user.settings?.notifications?.general?.announcements,
    ),
    updates: Boolean(user.settings?.notifications?.general?.updates),
  },
});

export default function NotificationsForm({ user }: Readonly<{ user: User }>) {
  const [notifications, setNotifications] = useState<NotificationsState>(
    buildInitialNotifications(user),
  );
  const username = user.identity?.username?.trim() ?? '';
  const [, startTransition] = useTransition();

  const handleGroupChange = (field: GroupField, checked: boolean): void => {
    submitNotificationsUpdate({
      ...notifications,
      group: {
        ...notifications.group,
        [field]: checked,
      },
    });
  };

  const handleGeneralChange = (field: GeneralField, checked: boolean): void => {
    submitNotificationsUpdate({
      ...notifications,
      general: {
        ...notifications.general,
        [field]: checked,
      },
    });
  };

  function submitNotificationsUpdate(nextState: NotificationsState): void {
    startTransition(() => {
      updateNotificationsState(nextState);
    });
  }

  async function updateNotificationsState(
    nextState: NotificationsState,
  ): Promise<void> {
    const uuid = user.uuid.trim();

    if (!uuid) {
      toast.error('Missing user identifier to update notifications.');
      return;
    }

    try {
      const result = await updateUserNotifications({
        uuid,
        username,
        notifications: nextState,
      });

      if (result.status === 'error') {
        toast.error(
          result.error?.message ?? 'Failed to update notifications.',
          {
            description: result.error?.reason,
          },
        );
        return;
      }

      setNotifications(nextState);
      toast.success('Notification setting updated successfully');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update notifications';

      toast.error(message, {
        description: 'Unexpected error while updating notifications.',
      });
    }
  }

  return (
    <Form>
      <Grid gap={32} columns={2} alignItems='start'>
        <Section gap={0}>
          <FieldSet>
            <Title size='tiny' weight='bold'>
              Group
            </Title>
            <DoubleLineIconCheckbox
              label='Upcomming Events'
              icon='eventUpcoming'
              description='Get a notification when a group event occurs'
              name='settings.notifications.group.events'
              checked={notifications.group.events}
              onCheckedChange={checked => {
                handleGroupChange('events', checked);
              }}
              line
            />
            <DoubleLineIconCheckbox
              line
              label='Invitations'
              icon='invitations'
              description='Get a notification when you are invited to a group'
              name='settings.notifications.group.invites'
              checked={notifications.group.invites}
              onCheckedChange={checked => {
                handleGroupChange('invites', checked);
              }}
            />
            <DoubleLineIconCheckbox
              line
              label='Members'
              icon='userAdd'
              description='Get a notification when a group member joins or leaves'
              name='settings.notifications.group.members'
              checked={notifications.group.members}
              onCheckedChange={checked => {
                handleGroupChange('members', checked);
              }}
            />
            <DoubleLineIconCheckbox
              line
              label='Petitions'
              icon='login'
              description='Get a notification when someone submits a petition'
              name='settings.notifications.group.petitions'
              checked={notifications.group.petitions}
              onCheckedChange={checked => {
                handleGroupChange('petitions', checked);
              }}
            />
            <DoubleLineIconCheckbox
              label='Records'
              icon='trophy'
              description='Get a notification when the group achieves a record'
              name='settings.notifications.group.records'
              checked={notifications.group.records}
              onCheckedChange={checked => {
                handleGroupChange('records', checked);
              }}
            />
          </FieldSet>
        </Section>
        <Section gap={0}>
          <FieldSet>
            <Title size='tiny' weight='bold'>
              General
            </Title>
            <DoubleLineIconCheckbox
              label='Announcements'
              icon='announcements'
              description='Get a notification when the sport app posts an announcement'
              name='settings.notifications.general.announcements'
              checked={notifications.general.announcements}
              onCheckedChange={checked => {
                handleGeneralChange('announcements', checked);
              }}
              line
            />
            <DoubleLineIconCheckbox
              label='App Updates'
              icon='systemUpdate'
              description='Get a notification when the sport app updates its app'
              name='settings.notifications.general.updates'
              checked={notifications.general.updates}
              onCheckedChange={checked => {
                handleGeneralChange('updates', checked);
              }}
            />
          </FieldSet>
        </Section>
      </Grid>
    </Form>
  );
}
