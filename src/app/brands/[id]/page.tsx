/** @format */

import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import { resolveLocalizedBrandErrorMessage } from '@/_constants/brandErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import { getDictionary } from '../../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../../_i18n/resolveRequestLocale';
import { getAdminBrandById } from '@/_actions/brand/getAdminBrandById';
import BrandInformationTab, {
  type BrandSection,
} from '../_components/BrandInformationTab';
import DeleteBrandButton from '../_components/DeleteBrandButton';
import BrandSidebarNavigation from '../_components/BrandSideBar';
import BrandUnavailable from '../_components/BrandUnavailable';

type BrandPageParams = Readonly<{
  id: string;
}>;

type BrandPageSearchParams = Readonly<{
  section?: string | string[];
  edit?: string | string[];
}>;

type BrandDetailsPageProps = Readonly<{
  params: Promise<BrandPageParams> | BrandPageParams;
  searchParams?: Promise<BrandPageSearchParams> | BrandPageSearchParams;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): BrandSection {
  switch (value) {
    case 'media':
      return value;
    case 'profile':
    default:
      return 'profile';
  }
}

function buildBrandHref(brandId: string, section: BrandSection, edit?: boolean): string {
  const params = new URLSearchParams();
  params.set('section', section);

  if (edit) {
    params.set('edit', 'true');
  }

  return `${NAVIGATION.BRAND_BY_ID(brandId)}?${params.toString()}`;
}

export default async function BrandDetailsPage({
  params,
  searchParams,
}: BrandDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const brandId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!brandId) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[{ label: dictionary.navigation.brands }]}
          icon='brand'
        />
        <BrandUnavailable message={dictionary.brands.errors.BRAND_NOT_FOUND} />
      </Grid>
    );
  }

  const brandResponse = await getAdminBrandById(brandId);
  if (!brandResponse.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[{ label: dictionary.navigation.brands, href: NAVIGATION.BRANDS }]}
          icon='brand'
        />
        <BrandUnavailable
          message={resolveLocalizedBrandErrorMessage(
            brandResponse.error,
            dictionary.brands.errors,
            dictionary.common.unexpectedError,
          )}
        />
      </Grid>
    );
  }

  const brand = brandResponse.data;
  const detailHref = buildBrandHref(brand.id, section);
  const editHref = buildBrandHref(brand.id, section, true);

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: dictionary.navigation.brands, href: NAVIGATION.BRANDS },
          { label: brand.name },
        ]}
        icon='brand'
      >
        <ButtonGroup gap={4}>
          <DeleteBrandButton brandId={brand.id} brandName={brand.name} />
          <Button
            icon='edit'
            type='button'
            href={edit ? detailHref : editHref}
            variant={edit ? 'borderless' : 'solid'}
          >
            {edit ? dictionary.common.cancel : dictionary.common.edit}
          </Button>
        </ButtonGroup>
      </SectionHeader>
      <Main>
        <Grid className='c-aside-grid' gap={16}>
          <BrandSidebarNavigation brandId={brand.id} activeSection={section} />
          <BrandInformationTab
            brand={brand}
            section={section}
            edit={edit}
            cancelHref={detailHref}
            successHref={detailHref}
          />
        </Grid>
      </Main>
    </Grid>
  );
}
