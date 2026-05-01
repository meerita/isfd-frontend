/** @format */
/**
 * @file src/_components/RegisterForm.tsx
 * @description Renders the registration form with locale-aware OTP and credential copy.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { registerAction } from '@/_actions/auth/registerAction';
import { useI18n } from '@/_i18n/I18nProvider';
import type { RegisterActionState } from '@/_types/auth';

import Button from './forms/Button';
import Form from './forms/Form';
import TextInput from './forms/TextInput';
import ButtonGroup from './navigation/ButtonGroup';
import Text from './typography/Text';

const INITIAL_STATE: RegisterActionState = {
  status: 'idle',
  step: 'credentials',
};

const IS_LOCAL_DEVELOPMENT = process.env.NODE_ENV === 'development';

export default function RegisterForm(): React.JSX.Element {
  const { dictionary, locale } = useI18n();
  const [state, formAction, pending] = useActionState<
    RegisterActionState,
    FormData
  >(registerAction, INITIAL_STATE);

  const isOtpStep = state.step === 'otp';

  useEffect(
    function syncRegistrationNotifications(): void {
      if (state.status === 'error' && state.error) {
        toast.error(state.error.error);
      }

      if (state.status === 'awaiting_otp') {
        toast.success(dictionary.auth.otpSentCheckEmail);
      }
    },
    [dictionary.auth.otpSentCheckEmail, state.error, state.status],
  );

  return (
    <Form action={formAction} gap={24}>
      {isOtpStep ? (
        <>
          <input
            type='hidden'
            name='challenge_id'
            value={state.challengeId ?? ''}
          />
          {IS_LOCAL_DEVELOPMENT && state.otpCode ? (
            <Text color='gray'>
              {dictionary.auth.otpCode}: <strong>{state.otpCode}</strong>
            </Text>
          ) : (
            <Text color='gray'>{dictionary.auth.checkEmailForOtp}</Text>
          )}
          <TextInput
            label={dictionary.auth.otpCode}
            name='code'
            type='text'
            placeholder={dictionary.auth.enterOtpCode}
            autoComplete='one-time-code'
            disabled={pending}
            autoFocus
            required
          />
          {state.otpExpiresAt ? (
            <Text size='small' color='gray'>
              {dictionary.auth.codeExpiresAt.replace(
                '{date}',
                new Date(state.otpExpiresAt).toLocaleString(locale),
              )}
            </Text>
          ) : null}
        </>
      ) : (
        <>
          <TextInput
            label={dictionary.auth.email}
            name='email'
            type='email'
            placeholder={dictionary.auth.emailPlaceholder}
            autoComplete='email'
            disabled={pending}
            required
          />
          <TextInput
            label={dictionary.auth.password}
            name='password'
            type='password'
            placeholder={dictionary.auth.choosePassword}
            autoComplete='new-password'
            disabled={pending}
            required
          />
          <TextInput
            label={dictionary.auth.usernameOptional}
            name='username'
            type='text'
            placeholder={dictionary.auth.usernamePlaceholder}
            autoComplete='username'
            disabled={pending}
          />
        </>
      )}
      <ButtonGroup>
        <Button
          icon='send'
          type='submit'
          disabled={pending}
          aria-busy={pending}
        >
          {pending
            ? isOtpStep
              ? dictionary.common.verifying
              : dictionary.auth.createAccountPending
            : isOtpStep
              ? dictionary.common.verifyCode
              : dictionary.common.createAccount}
        </Button>
      </ButtonGroup>
    </Form>
  );
}
