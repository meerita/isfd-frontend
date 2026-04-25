/** @format */

'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { updateGroupPreferences } from '@/_actions/group/updateGroupPreferences';
import DoubleLineIconCheckbox from '@/_components/forms/DoubleLineIconCheckbox';
import DoubleLineIconSelect from '@/_components/forms/DoubleLineIconSelect';
import FieldSet from '@/_components/forms/Fieldset';
import Form from '@/_components/forms/Form';
import Grid from '@/_components/layout/Grid';
import Title from '@/_components/typography/Title';
import {
  GROUP_EVENT_ACTIVITY_OPTIONS,
  GROUP_EVENT_CREATION_OPTIONS,
  GROUP_EVENT_GENDER_OPTIONS,
  GROUP_EVENT_PARTICIPATION_OPTIONS,
  GROUP_EVENT_REPLACEMENTS_OPTIONS,
  GROUP_EVENT_SKILL_OPTIONS,
  GROUP_JOIN_MODE_OPTIONS,
  GROUP_PRIVACY_OPTIONS,
  GROUP_VISIBILITY_OPTIONS,
} from '@/_constants/groupPreferences';
import { normalizeGroupVisibility } from '@/_helpers/normalizeGroupVisibility';
import type {
  Group,
  GroupEventActivity,
  GroupEventCreation,
  GroupEventParticipation,
  GroupEventReplacements,
  GroupJoinMode,
  GroupPrivacy,
  GroupVisibility,
} from '@/_types/group';
import type { Gender } from '@/_types/genders';
import type { UserSkillLevel } from '@/_types/user';

type GroupPreferencesState = Readonly<{
  membership: Readonly<{
    privacy: GroupPrivacy;
    joinMode: GroupJoinMode;
  }>;
  visibility: Readonly<{
    visibility: GroupVisibility;
  }>;
  events: Readonly<{
    creation: GroupEventCreation;
    gender: Gender;
    skill: UserSkillLevel;
    participation: GroupEventParticipation;
    visibility: boolean;
    replacements: GroupEventReplacements;
    invitations: boolean;
    activity: GroupEventActivity;
  }>;
  active: boolean;
}>;

function buildInitialPreferences(group: Group): GroupPreferencesState {
  return {
    membership: {
      privacy:
        group.preferences?.membership?.privacy ?? group.privacy ?? 'PUBLIC',
      joinMode:
        group.preferences?.membership?.joinMode ?? group.joinMode ?? 'FREE',
    },
    visibility: {
      visibility: normalizeGroupVisibility(
        group.preferences?.visibility?.visibility ?? group.visibility,
      ) ?? 'VISIBLE',
    },
    events: {
      creation: group.preferences?.events?.creation ?? 'MEMBER',
      gender: group.preferences?.events?.gender ?? 'OTHER',
      skill: group.preferences?.events?.skill ?? 'ANY',
      participation: group.preferences?.events?.participation ?? 'ANYONE',
      visibility: group.preferences?.events?.visibility ?? true,
      replacements: group.preferences?.events?.replacements ?? 'ALLOWED',
      invitations: group.preferences?.events?.invitations ?? true,
      activity: group.preferences?.events?.activity ?? 'TYPE_ONE',
    },
    active: group.status !== 'INACTIVE',
  };
}

export default function PreferencesForm({ group }: Readonly<{ group: Group }>) {
  const [preferences, setPreferences] = useState<GroupPreferencesState>(
    buildInitialPreferences(group),
  );
  const [, startTransition] = useTransition();

  const groupId = (group.id ?? '').trim();

  async function persistPreferences(
    nextPreferences: GroupPreferencesState,
  ): Promise<void> {
    if (!groupId) {
      toast.error('Missing group identifier to update preferences.');
      return;
    }

    try {
      const result = await updateGroupPreferences({
        groupId,
        preferences: {
          membership: nextPreferences.membership,
          visibility: nextPreferences.visibility,
          events: nextPreferences.events,
        },
        status: nextPreferences.active ? 'ACTIVE' : 'INACTIVE',
      });

      if (result.status === 'error') {
        toast.error(
          result.error?.message ?? 'Failed to update group preferences.',
          {
            description: result.error?.reason,
          },
        );
        return;
      }

      setPreferences(nextPreferences);
      toast.success('Group preferences updated successfully');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update group preferences.';

      toast.error(message, {
        description: 'Unexpected error while updating group preferences.',
      });
    }
  }

  function queuePreferencesUpdate(
    nextPreferences: GroupPreferencesState,
  ): void {
    startTransition(function runPreferencesUpdate() {
      void persistPreferences(nextPreferences);
    });
  }

  function handleMembershipChange(
    field: 'privacy' | 'joinMode',
    value: string,
  ): void {
    const nextPreferences: GroupPreferencesState = {
      ...preferences,
      membership: {
        ...preferences.membership,
        [field]: value,
      },
    } as GroupPreferencesState;

    queuePreferencesUpdate(nextPreferences);
  }

  function handleVisibilityChange(value: string): void {
    const nextPreferences: GroupPreferencesState = {
      ...preferences,
      visibility: {
        visibility: normalizeGroupVisibility(value) ?? 'VISIBLE',
      },
    };

    queuePreferencesUpdate(nextPreferences);
  }

  function handleEventSelectChange(
    field:
      | 'creation'
      | 'gender'
      | 'skill'
      | 'participation'
      | 'replacements'
      | 'activity',
    value: string,
  ): void {
    const nextPreferences: GroupPreferencesState = {
      ...preferences,
      events: {
        ...preferences.events,
        [field]: value,
      },
    } as GroupPreferencesState;

    queuePreferencesUpdate(nextPreferences);
  }

  function handleEventToggleChange(
    field: 'visibility' | 'invitations',
    checked: boolean,
  ): void {
    const nextPreferences: GroupPreferencesState = {
      ...preferences,
      events: {
        ...preferences.events,
        [field]: checked,
      },
    };

    queuePreferencesUpdate(nextPreferences);
  }

  function handleActiveChange(checked: boolean): void {
    queuePreferencesUpdate({
      ...preferences,
      active: checked,
    });
  }

  return (
    <Form>
      <Grid gap={32} columns={2} alignItems='start'>
        <FieldSet>
          <Title size='tiny' weight='bold'>
            Membership
          </Title>
          <DoubleLineIconSelect
            label='Privacy'
            icon='visibility'
            description='Define who can discover and access the group'
            name='preferences.membership.privacy'
            data={GROUP_PRIVACY_OPTIONS}
            value={preferences.membership.privacy}
            onChange={value => {
              handleMembershipChange('privacy', value);
            }}
          />
          <DoubleLineIconSelect
            label='Join Mode'
            icon='login'
            description='Controls how new members can join the group'
            name='preferences.membership.joinMode'
            data={GROUP_JOIN_MODE_OPTIONS}
            value={preferences.membership.joinMode}
            onChange={value => {
              handleMembershipChange('joinMode', value);
            }}
          />
          <DoubleLineIconSelect
            label='Group Visibility'
            icon='public'
            description='Determines whether the group is visible across the app'
            name='preferences.visibility.visibility'
            data={GROUP_VISIBILITY_OPTIONS}
            value={preferences.visibility.visibility}
            onChange={handleVisibilityChange}
          />
          <DoubleLineIconCheckbox
            label='Active Group'
            icon='verified'
            description='Enables or disables the group for normal operation'
            name='status.active'
            checked={preferences.active}
            onCheckedChange={handleActiveChange}
          />
        </FieldSet>
        <FieldSet>
          <Title size='tiny' weight='bold'>
            Events
          </Title>
          <DoubleLineIconSelect
            label='Default Creator'
            icon='userAdd'
            description='Minimum role allowed to create events'
            name='preferences.events.creation'
            data={GROUP_EVENT_CREATION_OPTIONS}
            value={preferences.events.creation}
            onChange={value => {
              handleEventSelectChange('creation', value);
            }}
          />
          <DoubleLineIconSelect
            label='Gender'
            icon='other'
            description='Default gender preference applied to group events'
            name='preferences.events.gender'
            data={GROUP_EVENT_GENDER_OPTIONS}
            value={preferences.events.gender}
            onChange={value => {
              handleEventSelectChange('gender', value);
            }}
          />
          <DoubleLineIconSelect
            label='Skill'
            icon='skills'
            description='Recommended skill level for participants'
            name='preferences.events.skill'
            data={GROUP_EVENT_SKILL_OPTIONS}
            value={preferences.events.skill}
            onChange={value => {
              handleEventSelectChange('skill', value);
            }}
          />
          <DoubleLineIconSelect
            label='Participation'
            icon='participants'
            description='Minimum role allowed to participate in events'
            name='preferences.events.participation'
            data={GROUP_EVENT_PARTICIPATION_OPTIONS}
            value={preferences.events.participation}
            onChange={value => {
              handleEventSelectChange('participation', value);
            }}
          />
          <DoubleLineIconSelect
            label='Replacements'
            icon='undo'
            description='Replacement rule applied to group events'
            name='preferences.events.replacements'
            data={GROUP_EVENT_REPLACEMENTS_OPTIONS}
            value={preferences.events.replacements}
            onChange={value => {
              handleEventSelectChange('replacements', value);
            }}
          />
          <DoubleLineIconSelect
            label='Activity'
            icon='eventList'
            description='Default activity type used for new events'
            name='preferences.events.activity'
            data={GROUP_EVENT_ACTIVITY_OPTIONS}
            value={preferences.events.activity}
            onChange={value => {
              handleEventSelectChange('activity', value);
            }}
          />
          <DoubleLineIconCheckbox
            label='Visible Events'
            icon='visibility'
            description='Allows events to be visible to other users'
            name='preferences.events.visibility'
            checked={preferences.events.visibility}
            onCheckedChange={checked => {
              handleEventToggleChange('visibility', checked);
            }}
          />
          <DoubleLineIconCheckbox
            label='Invitations Enabled'
            icon='send'
            description='Allows invitations to be sent for group events'
            name='preferences.events.invitations'
            checked={preferences.events.invitations}
            onCheckedChange={checked => {
              handleEventToggleChange('invitations', checked);
            }}
          />
        </FieldSet>
      </Grid>
    </Form>
  );
}
