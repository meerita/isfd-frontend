/** @format */

'use client';

import type { City } from '@/_types/city';
import type { CountrySelectOption } from '@/_types/country';
import type { Stadium } from '@/_types/stadium';
import StadiumForm from './StadiumForm';
import StadiumMediaSection from './StadiumMediaSection';
import StadiumProfileSection from './StadiumProfileSection';

export type StadiumSection = 'profile' | 'media';

type StadiumInformationTabProps = Readonly<{
  stadium: Stadium;
  section: StadiumSection;
  edit: boolean;
  countries: ReadonlyArray<CountrySelectOption>;
  initialProvinceName?: string | null;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
  selectedCountryLabel?: string | null;
  selectedCityLabel?: string | null;
  selectedPrimaryClubLabel?: string | null;
  cancelHref: string;
  successHref: string;
}>;

export default function StadiumInformationTab({
  stadium,
  section,
  edit,
  countries,
  initialProvinceName,
  initialCities,
  selectedCountryLabel,
  selectedCityLabel,
  selectedPrimaryClubLabel,
  cancelHref,
  successHref,
}: StadiumInformationTabProps): React.JSX.Element {
  if (edit) {
    return (
      <StadiumForm
        stadium={stadium}
        countries={countries}
        initialProvinceName={initialProvinceName}
        initialCities={initialCities}
        selectedCountryLabel={selectedCountryLabel}
        selectedCityLabel={selectedCityLabel}
        edit
        cancelHref={cancelHref}
        successHref={successHref}
      />
    );
  }

  switch (section) {
    case 'media':
      return <StadiumMediaSection stadium={stadium} />;
    case 'profile':
    default:
      return (
        <StadiumProfileSection
          stadium={stadium}
          countryLabel={selectedCountryLabel}
          cityLabel={selectedCityLabel}
          primaryClubLabel={selectedPrimaryClubLabel}
        />
      );
  }
}
