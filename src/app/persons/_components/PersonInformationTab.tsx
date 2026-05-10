/** @format */

'use client';

import type { CountrySelectOption } from '@/_types/country';
import type { PersonAdminDetail } from '@/_types/person';
import PersonAchievementsSection from './PersonAchievementsSection';
import PersonClubsSection from './PersonClubsSection';
import PersonForm from './PersonForm';
import PersonGamesSection from './PersonGamesSection';
import PersonMediaSection from './PersonMediaSection';
import PersonProfileSection from './PersonProfileSection';

export type PersonSection = 'profile' | 'media' | 'clubs' | 'games' | 'achievements';

type PersonInformationTabProps = Readonly<{
  person: PersonAdminDetail;
  section: PersonSection;
  edit: boolean;
  countries: ReadonlyArray<CountrySelectOption>;
  selectedPrimaryNationalityCountryLabel?: string | null;
  cancelHref: string;
  successHref: string;
}>;

export default function PersonInformationTab({
  person,
  section,
  edit,
  countries,
  selectedPrimaryNationalityCountryLabel,
  cancelHref,
  successHref,
}: PersonInformationTabProps): React.JSX.Element {
  if (edit) {
    return (
      <PersonForm
        person={person}
        countries={countries}
        selectedPrimaryNationalityCountryLabel={
          selectedPrimaryNationalityCountryLabel
        }
        edit
        cancelHref={cancelHref}
        successHref={successHref}
      />
    );
  }

  switch (section) {
    case 'media':
      return <PersonMediaSection person={person} />;
    case 'clubs':
      return <PersonClubsSection />;
    case 'games':
      return <PersonGamesSection />;
    case 'achievements':
      return <PersonAchievementsSection />;
    case 'profile':
    default:
      return <PersonProfileSection person={person} />;
  }
}
