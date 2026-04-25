/** @format */

import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import LoginForm from '@/_components/LoginForm';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import GLOBALS from '@/_constants/globals';

export default function Home() {
  return (
    <Grid alignItems='stretch' columns={2} className='min-height--100vh'>
      <Box className='padding--32 background-color--black'>
        <article className='gap--16 height--100 display--grid'>
          <header className='align-self--start'>
            <Title color='white'>{GLOBALS.metadata.title}</Title>
          </header>
          <blockquote className='align-self--end padding--0 margin--0'>
            <Text color='white'>Victory is the result of diliText effort.</Text>
          </blockquote>
        </article>
      </Box>
      <Grid alignItems='center'>
        <Box padding={24}>
          <LoginForm />
        </Box>
      </Grid>
    </Grid>
  );
}
