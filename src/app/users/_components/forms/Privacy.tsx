/** @format */

'use client';

import { updateUserPrivacy } from '@/_actions/user/updateUserPrivacy';
import DoubleLineIconCheckbox from '@/_components/forms/DoubleLineIconCheckbox';
import FieldSet from '@/_components/forms/Fieldset';
import Form from '@/_components/forms/Form';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Title from '@/_components/typography/Title';
import { User } from '@/_types/user';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type PrivacyState = Readonly<{
  general: Readonly<{
    hiddenInSearch: boolean;
    hideMyGroups: boolean;
  }>;
  pro: Readonly<{
    invisible: boolean;
    hideActivity: boolean;
  }>;
  cookies: Readonly<{
    analytics: boolean;
    marketing: boolean;
    other: boolean;
  }>;
}>;

type PrivacyFieldPath =
  | 'settings.privacy.general.hiddenInSearch'
  | 'settings.privacy.general.hideMyGroups'
  | 'settings.privacy.pro.invisible'
  | 'settings.privacy.pro.hideActivity'
  | 'settings.privacy.cookies.analytics'
  | 'settings.privacy.cookies.marketing'
  | 'settings.privacy.cookies.other';

const buildInitialPrivacyState = (user: User): PrivacyState => ({
  general: {
    hiddenInSearch: Boolean(user.settings?.privacy?.general?.hiddenInSearch),
    hideMyGroups: Boolean(user.settings?.privacy?.general?.hideMyGroups),
  },
  pro: {
    invisible: Boolean(user.settings?.privacy?.pro?.invisible),
    hideActivity: Boolean(user.settings?.privacy?.pro?.hideActivity),
  },
  cookies: {
    analytics: Boolean(user.settings?.privacy?.cookies?.analytics),
    marketing: Boolean(user.settings?.privacy?.cookies?.marketing),
    other: Boolean(user.settings?.privacy?.cookies?.other),
  },
});

const updatePrivacyByPath = (
  previous: PrivacyState,
  name: PrivacyFieldPath,
  checked: boolean,
): PrivacyState => {
  switch (name) {
    case 'settings.privacy.general.hiddenInSearch':
      return {
        ...previous,
        general: {
          ...previous.general,
          hiddenInSearch: checked,
        },
      };
    case 'settings.privacy.general.hideMyGroups':
      return {
        ...previous,
        general: {
          ...previous.general,
          hideMyGroups: checked,
        },
      };
    case 'settings.privacy.pro.invisible':
      return {
        ...previous,
        pro: {
          ...previous.pro,
          invisible: checked,
        },
      };
    case 'settings.privacy.pro.hideActivity':
      return {
        ...previous,
        pro: {
          ...previous.pro,
          hideActivity: checked,
        },
      };
    case 'settings.privacy.cookies.analytics':
      return {
        ...previous,
        cookies: {
          ...previous.cookies,
          analytics: checked,
        },
      };
    case 'settings.privacy.cookies.marketing':
      return {
        ...previous,
        cookies: {
          ...previous.cookies,
          marketing: checked,
        },
      };
    case 'settings.privacy.cookies.other':
      return {
        ...previous,
        cookies: {
          ...previous.cookies,
          other: checked,
        },
      };
    default:
      return previous;
  }
};

export default function PrivacyForm({ user }: Readonly<{ user: User }>) {
  const [privacy, setPrivacy] = useState<PrivacyState>(
    buildInitialPrivacyState(user),
  );
  const [, startTransition] = useTransition();

  const username = user.identity?.username?.trim() ?? '';

  const handleCheckboxChange = async (
    name: PrivacyFieldPath,
    checked: boolean,
  ): Promise<void> => {
    if (!username) {
      toast.error('Missing username to update privacy.');
      return;
    }

    const updatedPrivacy = updatePrivacyByPath(privacy, name, checked);

    startTransition(() => {
      void submitPrivacyUpdate(updatedPrivacy);
    });

    async function submitPrivacyUpdate(
      nextPrivacy: PrivacyState,
    ): Promise<void> {
      try {
        const result = await updateUserPrivacy({
          uuid: user.uuid,
          username,
          privacy: nextPrivacy,
        });

        if (result.status === 'error') {
          toast.error(result.error?.message ?? 'Failed to update privacy.', {
            description: result.error?.reason,
          });
          return;
        }

        setPrivacy(nextPrivacy);
        toast.success('Privacy setting updated successfully');
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to update privacy';

        toast.error(message, {
          description: 'Unexpected error while updating privacy.',
        });
      }
    }
  };

  return (
    <Form>
      <Grid gap={32} columns={2} alignItems='start'>
        <Grid gap={16}>
          <FieldSet>
            <Title size={'tiny'} weight='bold'>
              General
            </Title>
            <DoubleLineIconCheckbox
              label='Hidden in Search'
              icon='exploreOff'
              description='Your profile will not appear in search results'
              name='settings.privacy.general.hiddenInSearch'
              checked={privacy.general.hiddenInSearch}
              onChange={event =>
                handleCheckboxChange(
                  'settings.privacy.general.hiddenInSearch',
                  event.target.checked,
                )
              }
              line
            />
            <DoubleLineIconCheckbox
              label='Hide My Groups'
              icon={privacy.general.hideMyGroups ? 'groupOff' : 'group'}
              description='You can hide the groups you are a member of'
              name='settings.privacy.general.hideMyGroups'
              checked={privacy.general.hideMyGroups}
              onChange={event =>
                handleCheckboxChange(
                  'settings.privacy.general.hideMyGroups',
                  event.target.checked,
                )
              }
            />
          </FieldSet>
          <FieldSet>
            <Title size={'tiny'} weight='bold'>
              Cookies
            </Title>
            <DoubleLineIconCheckbox
              line
              label='Analytics'
              icon={privacy.cookies.analytics ? 'cookiesOn' : 'cookiesOff'}
              description='Used to track user behavior and improve the overall user experience'
              name='settings.privacy.cookies.analytics'
              checked={privacy.cookies.analytics}
              onChange={event =>
                handleCheckboxChange(
                  'settings.privacy.cookies.analytics',
                  event.target.checked,
                )
              }
            />
            <DoubleLineIconCheckbox
              label='Marketing'
              icon={privacy.cookies.marketing ? 'cookiesOn' : 'cookiesOff'}
              description='Used to showcase your interests and recommendations'
              name='settings.privacy.cookies.marketing'
              checked={privacy.cookies.marketing}
              onChange={event =>
                handleCheckboxChange(
                  'settings.privacy.cookies.marketing',
                  event.target.checked,
                )
              }
              line
            />
            <DoubleLineIconCheckbox
              label='Others'
              icon={privacy.cookies.other ? 'cookiesOn' : 'cookiesOff'}
              description='Cookies used for other general purposes'
              name='settings.privacy.cookies.other'
              checked={privacy.cookies.other}
              onChange={event =>
                handleCheckboxChange(
                  'settings.privacy.cookies.other',
                  event.target.checked,
                )
              }
            />
          </FieldSet>
        </Grid>
        <Section>
          <FieldSet>
            <Title size={'tiny'} weight='bold'>
              PRO
            </Title>
            <DoubleLineIconCheckbox
              label='Invisible'
              icon={privacy.pro.invisible ? 'visibilityOff' : 'visibility'}
              description='When the users access your profile this will be hidden'
              name='settings.privacy.pro.invisible'
              checked={privacy.pro.invisible}
              onChange={event =>
                handleCheckboxChange(
                  'settings.privacy.pro.invisible',
                  event.target.checked,
                )
              }
              line
            />
            <DoubleLineIconCheckbox
              label='Hide Activity'
              icon={privacy.pro.hideActivity ? 'publiOff' : 'public'}
              description='Any indication of your activity will be hidden for the rest of the users'
              name='settings.privacy.pro.hideActivity'
              checked={privacy.pro.hideActivity}
              onChange={event =>
                handleCheckboxChange(
                  'settings.privacy.pro.hideActivity',
                  event.target.checked,
                )
              }
            />
          </FieldSet>
        </Section>
      </Grid>
    </Form>
  );
}
