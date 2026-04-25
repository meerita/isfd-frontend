/** @format */

// File: src/app/forbidden/page.tsx
// Purpose: Render an access denied screen for non-admin users
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Button from '@/_components/forms/Button';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';

export default function ForbiddenPage() {
  return (
    <Section className='min-height--100vh display--grid place-items--center background-color--lightestGray'>
      <Grid gap={16} className='max-width--480 text-align--center'>
        <Title color='darkestGray'>Access restricted</Title>
        <Text color='darkestGray'>
          This area is reserved for Sport App superadmins. If you believe you
          should have access, please contact the platform owner.
        </Text>
        <Box className='display--inline-block margin-inline--auto'>
          <Button href='/' kind='secondary'>
            Back to login
          </Button>
        </Box>
      </Grid>
    </Section>
  );
}
