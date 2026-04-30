/** @format */

import Button from '@/_components/forms/Button';
import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { resolveBrandErrorMessage } from '@/_constants/brandErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import { getAdminBrandById } from '@/_actions/brand/getAdminBrandById';
import BrandForm from '../_components/BrandForm';
import DeleteBrandButton from '../_components/DeleteBrandButton';

type BrandPageParams = Readonly<{
  id?: string;
}>;

type BrandDetailsPageProps = Readonly<{
  params?: Promise<BrandPageParams> | BrandPageParams;
}>;

function renderUnavailable(title: string, message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>{title}</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.BRANDS}>Back to brands</Button>
      </Grid>
    </Main>
  );
}

export default async function BrandDetailsPage({
  params,
}: BrandDetailsPageProps = {}) {
  await requireAdminAccess();

  const resolvedParams = await Promise.resolve(params);
  const brandId = resolvedParams?.id;

  if (!brandId) {
    return renderUnavailable(
      'Brand unavailable',
      'Missing brand identifier in the URL.',
    );
  }

  const brandResponse = await getAdminBrandById(brandId);
  if (!brandResponse.data) {
    return renderUnavailable(
      'Brand unavailable',
      resolveBrandErrorMessage(brandResponse.error),
    );
  }

  const brand = brandResponse.data;

  return (
    <Grid gap={24}>
      <SectionHeader title={`${SECTIONS.BRANDS} / ${brand.name}`} icon='brand'>
        <Box display='flex' gap={4} alignItems='center'>
          <DeleteBrandButton brandId={brand.id} brandName={brand.name} />
          <Button href={NAVIGATION.BRANDS}>All brands</Button>
        </Box>
      </SectionHeader>

      <BrandForm brand={brand} edit />
    </Grid>
  );
}
