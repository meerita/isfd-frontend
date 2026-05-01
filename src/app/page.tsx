/** @format */
/**
 * @file src/app/page.tsx
 * @description Renders the public home page with locale-aware marketing copy and login access.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

import LoginForm from '@/_components/LoginForm';
import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import GLOBALS from '@/_constants/globals';
import { getDictionary } from '../_i18n/getDictionary';
import { resolveRequestLocale } from '../_i18n/resolveRequestLocale';

export default async function Home(): Promise<React.JSX.Element> {
  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <Grid alignItems='stretch' columns={2} className='min-height--100vh'>
      <Box className='padding--32 background-color--black'>
        <article className='gap--16 height--100 display--grid'>
          <header className='align-self--start'>
            <Title color='white'>{GLOBALS.metadata.title}</Title>
          </header>
          <blockquote className='align-self--end padding--0 margin--0'>
            <Text color='white'>{dictionary.home.quote}</Text>
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
