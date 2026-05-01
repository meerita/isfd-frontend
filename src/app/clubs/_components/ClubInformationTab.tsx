/** @format */

'use client';

import type { City } from '@/_types/city';
import type { Club } from '@/_types/club';
import type { CountrySelectOption } from '@/_types/country';
import ClubForm from './ClubForm';
import ClubProfileSection from './ClubProfileSection';
import ClubSectionPlaceholder from './ClubSectionPlaceholder';

export type ClubSection =
  | 'profile'
  | 'media'
  | 'persons'
  | 'championships'
  | 'games'
  | 'achievements';

type ClubInformationTabProps = Readonly<{
  club: Club;
  section: ClubSection;
  edit: boolean;
  countries: ReadonlyArray<CountrySelectOption>;
  initialProvinceName?: string | null;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
  selectedCountryLabel?: string | null;
  selectedCityLabel?: string | null;
  selectedPrimaryStadiumLabel?: string | null;
  cancelHref: string;
  successHref: string;
}>;

export default function ClubInformationTab({
  club,
  section,
  edit,
  countries,
  initialProvinceName,
  initialCities,
  selectedCountryLabel,
  selectedCityLabel,
  selectedPrimaryStadiumLabel,
  cancelHref,
  successHref,
}: ClubInformationTabProps): React.JSX.Element {
  if (edit) {
    return (
      <ClubForm
        club={club}
        countries={countries}
        initialProvinceName={initialProvinceName}
        initialCities={initialCities}
        selectedCountryLabel={selectedCountryLabel}
        selectedCityLabel={selectedCityLabel}
        selectedPrimaryStadiumLabel={selectedPrimaryStadiumLabel}
        edit
        cancelHref={cancelHref}
        successHref={successHref}
      />
    );
  }

  switch (section) {
    case 'media':
      return <ClubSectionPlaceholder section='media' />;
    case 'persons':
      return <ClubSectionPlaceholder section='persons' />;
    case 'championships':
      return <ClubSectionPlaceholder section='championships' />;
    case 'games':
      return <ClubSectionPlaceholder section='games' />;
    case 'achievements':
      return <ClubSectionPlaceholder section='achievements' />;
    case 'profile':
    default:
      return (
        <ClubProfileSection
          club={club}
          countryLabel={selectedCountryLabel}
          cityLabel={selectedCityLabel}
          primaryStadiumLabel={selectedPrimaryStadiumLabel}
        />
      );
  }
}
