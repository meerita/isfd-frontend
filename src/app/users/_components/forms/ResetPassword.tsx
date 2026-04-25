/** @format */

'use client';

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';

export default function ResetPassword() {
  return (
    <Section>
      <Title size='small' margin={0}>
        Reset your password
      </Title>
      <Text size='small' color='gray'>
        <strong className='color--black'>If you forgot your password</strong>,
        you can reset it here. You will receive an email with a link to reset
        your password.
      </Text>
      <Form action='/account/password/reset'>
        <ButtonGroup>
          <Button type='submit' icon='lockReset'>
            Reset Password
          </Button>
        </ButtonGroup>
      </Form>
    </Section>
  );
}
