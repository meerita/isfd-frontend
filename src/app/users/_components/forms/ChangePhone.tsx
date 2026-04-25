/** @format */

'use client';

import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import type { User } from '@/_types/user';

function toPhoneText(value?: string): string {
  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '-';
}

export default function ChangePhoneForm({ user }: Readonly<{ user: User }>) {
  const phone = user.verification?.phone;

  return (
    <Section>
      <Title size='tiny' weight='bold'>
        Phone verification
      </Title>
      <Text color='gray' size='small'>
        The current user payload exposes phone data under verification settings.
        The admin phone update flow is not implemented yet, so this section is
        read-only for now.
      </Text>
      <Grid gap={16}>
        <TextInput
          label='Country'
          value={toPhoneText(phone?.country)}
          disabled
        />
        <TextInput
          label='Phone Number'
          value={toPhoneText(phone?.number)}
          disabled
        />
        <TextInput
          label='Verified'
          value={phone?.verified ? 'Yes' : 'No'}
          disabled
        />
        <TextInput
          label='Primary'
          value={phone?.primary ? 'Yes' : 'No'}
          disabled
        />
      </Grid>
    </Section>
  );
}
