/** @format */

import Link from 'next/link';

import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import RegisterForm from '@/_components/RegisterForm';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import GLOBALS from '@/_constants/globals';

export default function RegisterPage() {
  return (
    <Grid alignItems='stretch' columns={2} className='min-height--100vh'>
      <Box className='padding--32 background-color--black'>
        <article className='gap--16 height--100 display--grid'>
          <header className='align-self--start'>
            <Title color='white'>{GLOBALS.metadata.title}</Title>
          </header>
          <blockquote className='align-self--end padding--0 margin--0'>
            <Text color='white'>Start your journey today.</Text>
          </blockquote>
        </article>
      </Box>
      <Grid alignItems='center'>
        <Box padding={24}>
          <Title>Create account</Title>
          <RegisterForm />
          <Text size='small' color='gray'>
            Already have an account?{' '}
            <Link href='/'>Sign in</Link>
          </Text>
        </Box>
      </Grid>
    </Grid>
  );
}
