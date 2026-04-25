/** @format */

'use client';

import { updateUserAccess } from '@/_actions/user/updateUserAccess';
import { updateUserLegal } from '@/_actions/user/updateUserLegal';
import DoubleLineIconCheckbox from '@/_components/forms/DoubleLineIconCheckbox';
import FieldSet from '@/_components/forms/Fieldset';
import Form from '@/_components/forms/Form';
import Section from '@/_components/layout/Section';
import Title from '@/_components/typography/Title';
import { User } from '@/_types/user';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type AccessState = Readonly<{
  isAdmin: boolean;
  isActive: boolean;
  isBanned: boolean;
  isDisabled: boolean;
  isSubscribed: boolean;
}>;

type AccessField = keyof AccessState;

type LegalState = Readonly<{
  firstTimer: boolean;
}>;

function buildInitialAccess(user: User): AccessState {
  return {
    isAdmin: Boolean(user.access?.isAdmin),
    isActive: Boolean(user.access?.isActive),
    isBanned: Boolean(user.access?.isBanned),
    isDisabled: Boolean(user.access?.isDisabled),
    isSubscribed: Boolean(user.access?.isSubscribed),
  } satisfies AccessState;
}

function buildUpdatedAccessState(
  current: AccessState,
  field: AccessField,
  value: boolean,
): AccessState {
  const nextState = {
    ...current,
    [field]: value,
  } satisfies AccessState;

  return nextState;
}

function buildInitialLegal(user: User): LegalState {
  return {
    firstTimer: Boolean(user.legal?.firstTimer),
  } satisfies LegalState;
}

export default function PermissionsForm({ user }: Readonly<{ user: User }>) {
  const [permissions, setPermissions] = useState<AccessState>(
    buildInitialAccess(user),
  );
  const [legalStatus, setLegalStatus] = useState<LegalState>(
    buildInitialLegal(user),
  );
  const username = user.identity?.username?.trim() ?? '';
  const [, startTransition] = useTransition();

  function handlePermissionChange(field: AccessField, checked: boolean): void {
    startTransition(function runPermissionsUpdate() {
      void updatePermissionsState(field, checked);
    });
  }

  async function updatePermissionsState(
    field: AccessField,
    checked: boolean,
  ): Promise<void> {
    const uuid = user.uuid.trim();

    if (!uuid) {
      toast.error('Missing user identifier to update permissions.');
      return;
    }

    const nextPermissions = buildUpdatedAccessState(
      permissions,
      field,
      checked,
    );

    try {
      const result = await updateUserAccess({
        uuid,
        username,
        access: nextPermissions,
      });

      if (result.status === 'error') {
        toast.error(result.error?.message ?? 'Failed to update permission.', {
          description: result.error?.reason,
        });
        return;
      }

      setPermissions(nextPermissions);
      toast.success('Permission updated successfully.');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update permission';

      toast.error(message, {
        description: 'Unexpected error while updating permission.',
      });
    }
  }

  function handleBannedChange(checked: boolean): void {
    handlePermissionChange('isBanned', checked);
  }

  function handleDisabledChange(checked: boolean): void {
    handlePermissionChange('isDisabled', checked);
  }

  function handleActiveChange(checked: boolean): void {
    handlePermissionChange('isActive', checked);
  }

  function handleAdminChange(checked: boolean): void {
    handlePermissionChange('isAdmin', checked);
  }

  function handleSubscribedChange(checked: boolean): void {
    handlePermissionChange('isSubscribed', checked);
  }

  function handleFirstTimerChange(checked: boolean): void {
    startTransition(function runFirstTimerUpdate() {
      void updateFirstTimerState(checked);
    });
  }

  async function updateFirstTimerState(checked: boolean): Promise<void> {
    const uuid = user.uuid.trim();

    if (!uuid) {
      toast.error('Missing user identifier to update first-time status.');
      return;
    }

    const nextLegalStatus = {
      firstTimer: checked,
    } satisfies LegalState;

    try {
      const result = await updateUserLegal({
        uuid,
        username,
        legal: nextLegalStatus,
      });

      if (result.status === 'error') {
        toast.error(
          result.error?.message ?? 'Failed to update first-time status.',
          {
            description: result.error?.reason,
          },
        );
        return;
      }

      setLegalStatus(nextLegalStatus);
      toast.success('First-time status updated successfully.');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update first-time status';

      toast.error(message, {
        description: 'Unexpected error while updating first-time status.',
      });
    }
  }

  return (
    <Form>
      <Section className='display--grid gap--32 template-columns--2 align-items--start'>
        <Section>
          <Title size='tiny' weight='bold'>
            User Status
          </Title>
          <FieldSet>
            <DoubleLineIconCheckbox
              label='Banned'
              icon='banned'
              description='The user is banned from accessing the app'
              name='access.isBanned'
              checked={permissions.isBanned}
              onCheckedChange={handleBannedChange}
              line
            />
            <DoubleLineIconCheckbox
              label='Disabled'
              icon='disabled'
              description='The user is disabled'
              name='access.isDisabled'
              checked={permissions.isDisabled}
              onCheckedChange={handleDisabledChange}
              line
            />
            <DoubleLineIconCheckbox
              label='Active'
              icon='verified'
              description='The user can access the app'
              name='access.isActive'
              checked={permissions.isActive}
              onCheckedChange={handleActiveChange}
              line
            />
            <DoubleLineIconCheckbox
              label='First-Time User'
              icon='firstTimer'
              description='The user did not complete the onboarding process'
              name='legal.firstTimer'
              checked={legalStatus.firstTimer}
              onCheckedChange={handleFirstTimerChange}
            />
          </FieldSet>
        </Section>
        <Section>
          <Title size='tiny' weight='bold'>
            User Privileges
          </Title>
          <div>
            <DoubleLineIconCheckbox
              label='Admin'
              icon='admin'
              description='Access to all admin-level features'
              name='access.isAdmin'
              checked={permissions.isAdmin}
              onCheckedChange={handleAdminChange}
              line
            />
            <DoubleLineIconCheckbox
              label='PRO User'
              icon='pro'
              description='The user is a PRO user'
              name='access.isSubscribed'
              checked={permissions.isSubscribed}
              onCheckedChange={handleSubscribedChange}
            />
          </div>
        </Section>
      </Section>
    </Form>
  );
}
