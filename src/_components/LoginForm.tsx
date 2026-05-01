/** @format */
/**
 * @file src/_components/LoginForm.tsx
 * @description Renders the login form with locale-aware credential and OTP copy.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { loginWithEmail } from '@/_actions/auth/loginWithEmail';
import { useI18n } from '@/_i18n/I18nProvider';
import type { LoginActionState } from '@/_types/auth';

import Button from './forms/Button';
import Form from './forms/Form';
import TextInput from './forms/TextInput';
import ButtonGroup from './navigation/ButtonGroup';
import Text from './typography/Text';

const INITIAL_STATE: LoginActionState = {
  status: 'idle',
  step: 'credentials',
};

const IS_LOCAL_DEVELOPMENT = process.env.NODE_ENV === 'development';
const DEVICE_ID_STORAGE_KEY = 'isfd-device-id';

export default function LoginForm(): React.JSX.Element {
  const { dictionary, locale } = useI18n();
  const [state, formAction, pending] = useActionState<
    LoginActionState,
    FormData
  >(loginWithEmail, INITIAL_STATE);
  const [deviceId] = useState<string>(function buildInitialDeviceId() {
    if (typeof window === 'undefined') {
      return '';
    }

    const storedDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);

    if (storedDeviceId) {
      return storedDeviceId;
    }

    const generatedDeviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, generatedDeviceId);

    return generatedDeviceId;
  });

  const isOtpStep = state.step === 'otp';

  useEffect(
    function syncLoginNotifications(): void {
      if (state.status === 'error' && state.error) {
        toast.error(state.error.error);
      }

      if (state.status === 'awaiting_otp') {
        toast.success(dictionary.auth.otpSent);
      }
    },
    [dictionary.auth.otpSent, state.error, state.status],
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
          <input type='hidden' name='device_id' value={deviceId} />
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
            placeholder={dictionary.auth.enterPassword}
            autoComplete='current-password'
            disabled={pending}
            required
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
              : dictionary.common.sendingCode
            : isOtpStep
              ? dictionary.common.verifyCode
              : dictionary.common.continue}
        </Button>
      </ButtonGroup>
    </Form>
  );
}
