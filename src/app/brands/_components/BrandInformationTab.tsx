/** @format */

'use client';

import type { Brand } from '@/_types/brand';
import BrandForm from './BrandForm';
import BrandMediaSection from './BrandMediaSection';
import BrandProfileSection from './BrandProfileSection';

export type BrandSection = 'profile' | 'media';

type BrandInformationTabProps = Readonly<{
  brand: Brand;
  section: BrandSection;
  edit: boolean;
  cancelHref: string;
  successHref: string;
}>;

export default function BrandInformationTab({
  brand,
  section,
  edit,
  cancelHref,
  successHref,
}: BrandInformationTabProps): React.JSX.Element {
  if (edit) {
    return (
      <BrandForm
        brand={brand}
        edit
        cancelHref={cancelHref}
        successHref={successHref}
      />
    );
  }

  switch (section) {
    case 'media':
      return <BrandMediaSection brand={brand} />;
    case 'profile':
    default:
      return <BrandProfileSection brand={brand} />;
  }
}
