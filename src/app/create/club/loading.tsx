/** @format */

import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';

export default function CreateClubLoading() {
  return (
    <Grid gap={8}>
      <Title size='large'>Loading club form...</Title>
      <Text color='gray'>Preparing the create club screen.</Text>
    </Grid>
  );
}
