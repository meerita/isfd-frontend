/** @format */

'use client';
import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Line from '@/_components/Line';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';

export default function ChangePasswordForm() {
  return (
    <Section>
      <Form>
        <Text color='gray' size='small'>
          Before you change your password, make sure you provide your current
          password.
        </Text>
        <Grid gap={16} columns={2} alignItems='start' margin={16}>
          <TextInput
            label='Current Password'
            name='current_password'
            type='password'
            required
          />
        </Grid>
        <Line />
        <Text color='gray'>
          Now enter your new password: 6 characters minimum, with at least one
          uppercase letter, one lowercase letter, and one number.
        </Text>

        <Grid gap={16} columns={2} alignItems='start'>
          <TextInput
            label='New Password'
            name='new_password'
            type='password'
            required
          />
          <TextInput
            label='Confirm New Password'
            name='confirm_new_password'
            type='password'
            required
          />{' '}
        </Grid>
        <ButtonGroup>
          <Button type='submit' color='primary' icon='password'>
            Change Password
          </Button>
        </ButtonGroup>
      </Form>
    </Section>
  );
}
