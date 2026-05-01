/** @format */

'use client';

import type { City } from '@/_types/city';
import type { Country } from '@/_types/country';
import type { Federation } from '@/_types/federation';
import FederationForm from './FederationForm';
import FederationProfileSection from './FederationProfileSection';
import FederationSectionPlaceholder from './FederationSectionPlaceholder';

export type FederationSection =
  | 'profile'
  | 'media'
  | 'teams'
  | 'championships';

type FederationInformationTabProps = Readonly<{
  federation: Federation;
  section: FederationSection;
  edit: boolean;
  countries: ReadonlyArray<Pick<Country, 'id' | 'name'>>;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
  selectedCountryLabel?: string | null;
  selectedCityLabel?: string | null;
  cancelHref: string;
  successHref: string;
}>;

export default function FederationInformationTab({
  federation,
  section,
  edit,
  countries,
  initialCities,
  selectedCountryLabel,
  selectedCityLabel,
  cancelHref,
  successHref,
}: FederationInformationTabProps): React.JSX.Element {
  if (edit) {
    return (
      <FederationForm
        federation={federation}
        countries={countries}
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
      return <FederationSectionPlaceholder section='media' />;
    case 'teams':
      return <FederationSectionPlaceholder section='teams' />;
    case 'championships':
      return <FederationSectionPlaceholder section='championships' />;
    case 'profile':
    default:
      return (
        <FederationProfileSection
          federation={federation}
          countryLabel={selectedCountryLabel}
          cityLabel={selectedCityLabel}
        />
      );
  }
}
