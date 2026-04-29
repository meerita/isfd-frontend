/** @format */

import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';

export default function ClubDetailLoading() {
  return (
    <Main className='padding--32'>
      <Grid gap={8} className='max-width--75 margin-inline--auto'>
        <Title size='large'>Loading club...</Title>
        <Text color='gray'>Preparing the club detail view.</Text>
      </Grid>
    </Main>
  );
}
