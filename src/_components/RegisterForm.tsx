/** @format */

'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { registerAction } from '@/_actions/auth/registerAction';
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

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState<RegisterActionState, FormData>(
    registerAction,
    INITIAL_STATE,
  );
  const isOtpStep = state.step === 'otp';

  useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast.error(state.error.error);
    }

    if (state.status === 'awaiting_otp') {
      toast.success('OTP code sent. Check your email.');
    }
  }, [state.status, state.error]);

  return (
    <Form action={formAction} gap={24}>
      {isOtpStep ? (
        <>
          <input type='hidden' name='challenge_id' value={state.challengeId ?? ''} />
          {IS_LOCAL_DEVELOPMENT && state.otpCode ? (
            <Text color='gray'>
              This is your OTP code: <strong>{state.otpCode}</strong>
            </Text>
          ) : (
            <Text color='gray'>
              Check your email for the OTP code.
            </Text>
          )}
          <TextInput
            label='OTP code'
            name='code'
            type='text'
            placeholder='Enter the 6-digit code'
            autoComplete='one-time-code'
            disabled={pending}
            autoFocus
            required
          />
          {state.otpExpiresAt ? (
            <Text size='small' color='gray'>
              Code expires at {new Date(state.otpExpiresAt).toLocaleString()}.
            </Text>
          ) : null}
        </>
      ) : (
        <>
          <TextInput
            label='Email'
            name='email'
            type='email'
            placeholder='name@example.com'
            autoComplete='email'
            disabled={pending}
            required
          />
          <TextInput
            label='Password'
            name='password'
            type='password'
            placeholder='Choose a password'
            autoComplete='new-password'
            disabled={pending}
            required
          />
          <TextInput
            label='Username (optional)'
            name='username'
            type='text'
            placeholder='your_username'
            autoComplete='username'
            disabled={pending}
          />
        </>
      )}
      <ButtonGroup>
        <Button icon='send' type='submit' disabled={pending} aria-busy={pending}>
          {pending
            ? isOtpStep
              ? 'Verifying...'
              : 'Creating account...'
            : isOtpStep
              ? 'Verify code'
              : 'Create account'}
        </Button>
      </ButtonGroup>
    </Form>
  );
}
