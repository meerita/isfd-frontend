/** @format */

'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import NumberInput from '@/_components/forms/NumberInput';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { updateUserEmail } from '@/_actions/user/updateUserEmail';
import { verifyUserEmail } from '@/_actions/user/verifyUserEmail';
import type { EmailVerificationResponse } from '@/_actions/user/updateUserEmail';
import type { User } from '@/_types/user';

const CODE_LENGTH = 6 as const;

type EmailFields = Readonly<{
  email: string;
  confirmation: string;
}>;

function createEmptyDigits(): string[] {
  return Array.from({ length: CODE_LENGTH }, () => '');
}

export default function ChangeEmailForm({ user }: Readonly<{ user: User }>) {
  const [emailFields, setEmailFields] = useState<EmailFields>({
    email: '',
    confirmation: '',
  });
  const [verificationData, setVerificationData] =
    useState<EmailVerificationResponse | null>(null);
  const [codeDigits, setCodeDigits] = useState<string[]>(createEmptyDigits);
  const [isRequestPending, startRequestTransition] = useTransition();
  const [isVerifyPending, startVerifyTransition] = useTransition();

  const normalizedEmail = emailFields.email.trim();
  const normalizedConfirmation = emailFields.confirmation.trim();
  const emailsMatch =
    normalizedEmail.length > 0 && normalizedEmail === normalizedConfirmation;

  const verificationCodeInput = codeDigits.join('');
  const isVerifyEnabled =
    verificationCodeInput.length === CODE_LENGTH &&
    codeDigits.every(digit => digit.length === 1);

  const username = user.identity?.username?.trim() ?? '';

  function handleEmailFieldChange(
    field: keyof EmailFields,
    value: string,
  ): void {
    setEmailFields(previous => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!emailsMatch) {
      toast.error('Emails do not match.', {
        description: 'Make sure both email inputs contain the same address.',
      });
      return;
    }

    startRequestTransition(() => {
      void submitEmailChange(normalizedEmail);
    });
  }

  async function submitEmailChange(nextEmail: string): Promise<void> {
    const uuid = user.uuid.trim();

    if (!uuid) {
      toast.error('Missing user identifier to update the email.');
      return;
    }

    const result = await updateUserEmail({
      uuid,
      username,
      email: nextEmail,
    });

    if (result.status === 'error') {
      toast.error(result.error?.message ?? 'Unable to request email change.', {
        description: result.error?.reason,
      });
      return;
    }

    setVerificationData(result.data);
    setCodeDigits(createEmptyDigits());
    toast.success('Verification code sent to the new email address.');
  }

  function handleDigitChange(index: number, value: string): void {
    const sanitized = value.replace(/\D/g, '').slice(0, 1);

    setCodeDigits(previous => {
      const next = [...previous];
      next[index] = sanitized;
      return next;
    });
  }

  function handleVerifySubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!verificationData) {
      toast.error('Request an email change before entering the code.');
      return;
    }

    if (!isVerifyEnabled) {
      toast.error('Enter the 6-digit verification code to continue.');
      return;
    }

    startVerifyTransition(() => {
      void submitVerification(verificationCodeInput);
    });
  }

  async function submitVerification(code: string): Promise<void> {
    const uuid = user.uuid.trim();

    if (!uuid) {
      toast.error('Missing user identifier to verify the email.');
      return;
    }

    const result = await verifyUserEmail({
      uuid,
      username,
      code,
    });

    if (result.status === 'error') {
      toast.error(result.error?.message ?? 'Unable to verify the email.', {
        description: result.error?.reason,
      });
      return;
    }

    toast.success('Email verified successfully.');
    setVerificationData(null);
    setCodeDigits(createEmptyDigits());
    setEmailFields({ email: '', confirmation: '' });
  }

  return (
    <Section>
      <Title size='tiny' weight='bold'>
        Change your email
      </Title>
      <Text color='gray' size='small'>
        This is the email address you normally use to log in. It is also used
        for account recovery and important notifications. Make sure to keep it
        up to date.
      </Text>

      {!verificationData ? (
        <Form onSubmit={handleEmailSubmit} gap={24}>
          <Grid columns={2} gap={16}>
            <TextInput
              label='New Email Address'
              name='new_email'
              type='email'
              required
              autoComplete='off'
              value={emailFields.email}
              onChange={event =>
                handleEmailFieldChange('email', event.target.value)
              }
              disabled={isRequestPending}
            />
            <TextInput
              label='Confirm New Email Address'
              name='confirm_new_email'
              type='email'
              required
              autoComplete='off'
              value={emailFields.confirmation}
              onChange={event =>
                handleEmailFieldChange('confirmation', event.target.value)
              }
              disabled={isRequestPending}
            />
          </Grid>
          <ButtonGroup>
            <Button
              type='submit'
              color='primary'
              icon='send'
              disabled={!emailsMatch || isRequestPending}
              aria-busy={isRequestPending}
            >
              {isRequestPending ? 'Sending code...' : 'Change Email'}
            </Button>
          </ButtonGroup>
        </Form>
      ) : null}

      {verificationData ? (
        <Form onSubmit={handleVerifySubmit} gap={24}>
          <Text size='small' color='gray' className='margin-bottom--0'>
            The number is {verificationData.verificationCode || 'unavailable'}
          </Text>
          <Text size='tiny' color='lighterGray'>
            Expires at {verificationData.expiresAt}
          </Text>
          <Grid columns={CODE_LENGTH} gap={16}>
            {codeDigits.map((digit, index) => (
              <NumberInput
                key={`verification-digit-${index}`}
                name={`verification_digit_${index + 1}`}
                inputMode='numeric'
                maxLength={1}
                pattern='[0-9]*'
                value={digit}
                onChange={event => handleDigitChange(index, event.target.value)}
                required
                aria-label={`Verification digit ${index + 1}`}
                className='width--100 display--inline-block text-align--center font-size--20'
              />
            ))}
          </Grid>
          <ButtonGroup>
            <Button
              type='submit'
              color='primary'
              icon='verified'
              disabled={!isVerifyEnabled || isVerifyPending}
              aria-busy={isVerifyPending}
            >
              {isVerifyPending ? 'Verifying...' : 'Verify Email'}
            </Button>
          </ButtonGroup>
        </Form>
      ) : null}
    </Section>
  );
}
