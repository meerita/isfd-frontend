/** @format */

'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { loginWithEmail } from '@/_actions/auth/loginWithEmail';
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

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<
    LoginActionState,
    FormData
  >(loginWithEmail, INITIAL_STATE);
  const isCodeStep = state.step === 'code';
  const codeHelperText = IS_LOCAL_DEVELOPMENT && state.verificationCode
    ? `Local code: ${state.verificationCode}`
    : 'Check your email for the verification code.';

  useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast.error(state.error.error);
    }

    if (state.status === 'awaiting_code') {
      toast.success('Verification code sent.');
    }
  }, [state.status, state.error]);

  return (
    <Form action={formAction} gap={24}>
      {isCodeStep ? (
        <>
          <input type='hidden' name='email' value={state.email ?? ''} />
          <Text color='gray'>
            Enter the verification code for {state.email ?? 'your account'}.
          </Text>
          <TextInput
            label='Verification code'
            name='code'
            type='text'
            placeholder='Enter the code'
            autoComplete='one-time-code'
            helperText={codeHelperText}
            disabled={pending}
            autoFocus
            required
          />
          {state.expiresAt ? (
            <Text size='small' color='gray'>
              Code expires at {new Date(state.expiresAt).toLocaleString()}.
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
            placeholder='Enter your password'
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
            ? isCodeStep
              ? 'Verifying...'
              : 'Sending code...'
            : isCodeStep
              ? 'Verify code'
              : 'Continue'}
        </Button>
      </ButtonGroup>
    </Form>
  );
}
