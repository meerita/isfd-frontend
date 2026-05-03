/** @format */
/**
 * @file src/_i18n/getDictionary.ts
 * @description Loads locale dictionaries and returns a shared dictionary contract for the application UI.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

import { FALLBACK_LOCALE, type AppLocale } from './config';
import en from './messages/en';
import es from './messages/es';

export interface AppDictionary {
  readonly common: {
    readonly continue: string;
    readonly createAccount: string;
    readonly verifyCode: string;
    readonly verifying: string;
    readonly sendingCode: string;
    readonly notDefined: string;
    readonly apply: string;
    readonly reset: string;
    readonly edit: string;
    readonly cancel: string;
    readonly back: string;
    readonly previous: string;
    readonly next: string;
    readonly active: string;
    readonly inactive: string;
    readonly all: string;
    readonly unexpectedError: string;
  };
  readonly auth: {
    readonly email: string;
    readonly password: string;
    readonly otpCode: string;
    readonly usernameOptional: string;
    readonly checkEmailForOtp: string;
    readonly otpSent: string;
    readonly otpSentCheckEmail: string;
    readonly enterPassword: string;
    readonly choosePassword: string;
    readonly enterOtpCode: string;
    readonly emailPlaceholder: string;
    readonly usernamePlaceholder: string;
    readonly codeExpiresAt: string;
    readonly createAccountPending: string;
  };
  readonly home: {
    readonly quote: string;
  };
  readonly navigation: {
    readonly account: string;
    readonly brands: string;
    readonly clubs: string;
    readonly competitions: string;
    readonly countries: string;
    readonly dashboard: string;
    readonly federations: string;
    readonly logout: string;
    readonly persons: string;
    readonly stadiums: string;
    readonly users: string;
  };
  readonly competitions: {
    readonly overviewIntro: string;
    readonly totalSuffix: string;
    readonly actions: {
      readonly createCompetition: string;
      readonly createPyramid: string;
      readonly createTier: string;
      readonly createSeason: string;
      readonly createEdition: string;
    };
    readonly sidebar: {
      readonly overview: string;
      readonly types: string;
      readonly competitions: string;
      readonly pyramids: string;
      readonly tiers: string;
      readonly seasons: string;
      readonly editions: string;
    };
    readonly cards: {
      readonly typesTitle: string;
      readonly typesDescription: string;
      readonly competitionsTitle: string;
      readonly competitionsDescription: string;
      readonly pyramidsTitle: string;
      readonly pyramidsDescription: string;
      readonly tiersTitle: string;
      readonly tiersDescription: string;
      readonly seasonsTitle: string;
      readonly seasonsDescription: string;
      readonly editionsTitle: string;
      readonly editionsDescription: string;
    };
    readonly sections: {
      readonly competitionsTitle: string;
      readonly competitionsDescription: string;
      readonly competitionsCta: string;
      readonly pyramidsTitle: string;
      readonly pyramidsDescription: string;
      readonly pyramidsCta: string;
      readonly tiersTitle: string;
      readonly tiersDescription: string;
      readonly tiersCta: string;
      readonly seasonsTitle: string;
      readonly seasonsDescription: string;
      readonly seasonsCta: string;
      readonly editionsTitle: string;
      readonly editionsDescription: string;
      readonly editionsCta: string;
    };
    readonly list: {
      readonly title: string;
      readonly createAction: string;
      readonly loadErrorTitle: string;
      readonly emptyState: string;
      readonly paginationLabel: string;
      readonly headers: {
        readonly name: string;
        readonly competitionType: string;
        readonly federation: string;
        readonly country: string;
        readonly active: string;
        readonly created: string;
        readonly updated: string;
      };
      readonly filters: {
        readonly updating: string;
        readonly sort: string;
        readonly status: string;
        readonly competitionType: string;
        readonly federation: string;
        readonly country: string;
        readonly allCompetitionTypes: string;
        readonly allFederations: string;
        readonly allCountries: string;
        readonly updatedDesc: string;
        readonly updatedAsc: string;
        readonly createdDesc: string;
        readonly createdAsc: string;
        readonly nameAsc: string;
        readonly nameDesc: string;
        readonly sortOrderAsc: string;
        readonly sortOrderDesc: string;
        readonly activeFirst: string;
        readonly inactiveFirst: string;
      };
    };
    readonly pyramids: {
      readonly title: string;
      readonly createAction: string;
      readonly loadErrorTitle: string;
      readonly emptyState: string;
      readonly paginationLabel: string;
      readonly headers: {
        readonly name: string;
        readonly country: string;
        readonly federation: string;
        readonly scope: string;
        readonly active: string;
        readonly updated: string;
      };
      readonly filters: {
        readonly updating: string;
        readonly sort: string;
        readonly status: string;
        readonly country: string;
        readonly federation: string;
        readonly scope: string;
        readonly allCountries: string;
        readonly allFederations: string;
        readonly allScopes: string;
        readonly updatedDesc: string;
        readonly updatedAsc: string;
        readonly createdDesc: string;
        readonly createdAsc: string;
        readonly nameAsc: string;
        readonly nameDesc: string;
      };
    };
    readonly tiers: {
      readonly title: string;
      readonly createAction: string;
      readonly loadErrorTitle: string;
      readonly emptyState: string;
      readonly paginationLabel: string;
      readonly headers: {
        readonly name: string;
        readonly pyramid: string;
        readonly parentTier: string;
        readonly scope: string;
        readonly participantScope: string;
        readonly level: string;
        readonly active: string;
        readonly updated: string;
      };
      readonly filters: {
        readonly updating: string;
        readonly allPyramids: string;
        readonly allParentTiers: string;
        readonly allParticipantScopes: string;
        readonly allScopes: string;
        readonly updatedDesc: string;
        readonly updatedAsc: string;
        readonly createdDesc: string;
        readonly createdAsc: string;
        readonly nameAsc: string;
        readonly nameDesc: string;
      };
    };
    readonly types: {
      readonly title: string;
      readonly createAction: string;
      readonly loadErrorTitle: string;
      readonly emptyState: string;
      readonly paginationLabel: string;
      readonly yes: string;
      readonly no: string;
      readonly headers: {
        readonly name: string;
        readonly slug: string;
        readonly code: string;
        readonly category: string;
        readonly participantScope: string;
        readonly active: string;
        readonly created: string;
        readonly updated: string;
      };
      readonly filters: {
        readonly updating: string;
        readonly sort: string;
        readonly status: string;
        readonly category: string;
        readonly participantScope: string;
        readonly allCategories: string;
        readonly allScopes: string;
        readonly updatedDesc: string;
        readonly updatedAsc: string;
        readonly createdDesc: string;
        readonly createdAsc: string;
        readonly nameAsc: string;
        readonly nameDesc: string;
        readonly sortOrderAsc: string;
        readonly sortOrderDesc: string;
        readonly activeFirst: string;
        readonly inactiveFirst: string;
      };
    };
  };
  readonly brands: {
    readonly detail: {
      readonly profile: string;
      readonly media: string;
      readonly identity: string;
      readonly links: string;
      readonly metadata: string;
      readonly noIconAvailable: string;
      readonly noDetailImageAvailable: string;
      readonly notAvailableTitle: string;
      readonly backToBrands: string;
    };
    readonly form: {
      readonly name: string;
      readonly websiteUrl: string;
      readonly iconImageUrl: string;
      readonly detailImageUrl: string;
      readonly activeLabel: string;
      readonly id: string;
      readonly slug: string;
      readonly createdAt: string;
      readonly updatedAt: string;
    };
    readonly delete: {
      readonly confirmTitle: string;
      readonly confirmBody: string;
      readonly success: string;
      readonly pending: string;
      readonly action: string;
      readonly defaultError: string;
    };
    readonly errors: Readonly<Record<string, string>>;
  };
  readonly persons: {
    readonly sectionTitle: string;
    readonly addPerson: string;
    readonly loadErrorTitle: string;
    readonly emptyState: string;
    readonly paginationLabel: string;
    readonly avatarMissing: string;
    readonly avatarAvailable: string;
    readonly headers: {
      readonly avatar: string;
      readonly fullName: string;
      readonly slug: string;
      readonly displayName: string;
      readonly gender: string;
      readonly currentProfession: string;
      readonly primaryNationality: string;
      readonly active: string;
      readonly created: string;
      readonly updated: string;
    };
    readonly filters: {
      readonly updating: string;
      readonly sort: string;
      readonly status: string;
      readonly gender: string;
      readonly currentProfession: string;
      readonly anyGender: string;
      readonly anyProfession: string;
      readonly updatedDesc: string;
      readonly updatedAsc: string;
      readonly createdDesc: string;
      readonly createdAsc: string;
      readonly fullNameAsc: string;
      readonly fullNameDesc: string;
      readonly displayNameAsc: string;
      readonly displayNameDesc: string;
      readonly activeFirst: string;
      readonly inactiveFirst: string;
    };
    readonly detail: {
      readonly deletePerson: string;
      readonly makeActive: string;
      readonly makeInactive: string;
      readonly activating: string;
      readonly deactivating: string;
      readonly information: string;
      readonly profile: string;
      readonly media: string;
      readonly clubs: string;
      readonly games: string;
      readonly achievements: string;
      readonly communityIdentity: string;
      readonly legalIdentity: string;
      readonly location: string;
      readonly birthLocation: string;
      readonly currentLocation: string;
      readonly primaryNationality: string;
      readonly physicalDetails: string;
      readonly professionalInformation: string;
      readonly sectionsPending: string;
      readonly noAvatarAvailable: string;
      readonly noHeroAvailable: string;
      readonly notAvailableTitle: string;
      readonly backToPersons: string;
    };
    readonly form: {
      readonly identity: string;
      readonly vitals: string;
      readonly background: string;
      readonly professionalActivity: string;
      readonly media: string;
      readonly metadata: string;
      readonly fullName: string;
      readonly displayName: string;
      readonly firstName: string;
      readonly middleName: string;
      readonly lastName: string;
      readonly secondSurname: string;
      readonly knownAs: string;
      readonly nativeFullName: string;
      readonly activeLabel: string;
      readonly activeHelper: string;
      readonly birthDate: string;
      readonly deathDate: string;
      readonly deceased: string;
      readonly gender: string;
      readonly heightCm: string;
      readonly weightKg: string;
      readonly hairColor: string;
      readonly ethnicity: string;
      readonly skinColor: string;
      readonly birthLocationId: string;
      readonly currentCityId: string;
      readonly primaryNationalityCountry: string;
      readonly primaryNationalityCountryTitle: string;
      readonly currentProfession: string;
      readonly dominantFoot: string;
      readonly professionalDebutDate: string;
      readonly retirementDate: string;
      readonly avatarImageUrl: string;
      readonly heroImageUrl: string;
      readonly id: string;
      readonly slug: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly countriesUnavailable: string;
      readonly noGender: string;
      readonly noHairColor: string;
      readonly noEthnicity: string;
      readonly noSkinColor: string;
      readonly noCountry: string;
      readonly noCurrentProfession: string;
      readonly noDominantFoot: string;
      readonly createPending: string;
      readonly updatePending: string;
      readonly createAction: string;
      readonly updateAction: string;
      readonly createSuccess: string;
      readonly updateSuccess: string;
      readonly placeholders: {
        readonly fullName: string;
        readonly displayName: string;
        readonly firstName: string;
        readonly middleName: string;
        readonly lastName: string;
        readonly secondSurname: string;
        readonly knownAs: string;
        readonly nativeFullName: string;
        readonly avatarImageUrl: string;
        readonly heroImageUrl: string;
      };
      readonly titles: {
        readonly nativeFullName: string;
      };
    };
    readonly delete: {
      readonly confirmTitle: string;
      readonly confirmBody: string;
      readonly success: string;
      readonly pending: string;
      readonly action: string;
      readonly defaultError: string;
    };
    readonly errors: Readonly<Record<string, string>>;
  };
  readonly clubs: {
    readonly detail: {
      readonly profile: string;
      readonly media: string;
      readonly persons: string;
      readonly championships: string;
      readonly games: string;
      readonly achievements: string;
      readonly identity: string;
      readonly foundation: string;
      readonly location: string;
      readonly metadata: string;
      readonly representativeImage: string;
      readonly sectionsPending: string;
      readonly noRepresentativeImage: string;
      readonly notAvailableTitle: string;
      readonly backToClubs: string;
    };
    readonly form: {
      readonly name: string;
      readonly shortName: string;
      readonly acronym: string;
      readonly nativeName: string;
      readonly foundedAs: string;
      readonly foundedAt: string;
      readonly dissolvedAt: string;
      readonly dissolved: string;
      readonly activeLabel: string;
      readonly countryId: string;
      readonly cityId: string;
      readonly primaryStadiumId: string;
      readonly officialWebsiteUrl: string;
      readonly logoUrl: string;
      readonly heroImageUrl: string;
      readonly id: string;
      readonly slug: string;
      readonly createdAt: string;
      readonly updatedAt: string;
    };
    readonly delete: {
      readonly confirmTitle: string;
      readonly confirmBody: string;
      readonly success: string;
      readonly pending: string;
      readonly action: string;
      readonly defaultError: string;
    };
    readonly errors: Readonly<Record<string, string>>;
  };
  readonly stadiums: {
    readonly detail: {
      readonly profile: string;
      readonly media: string;
      readonly identity: string;
      readonly location: string;
      readonly specifications: string;
      readonly metadata: string;
      readonly noImageAvailable: string;
      readonly notAvailableTitle: string;
      readonly backToStadiums: string;
    };
    readonly form: {
      readonly name: string;
      readonly surfaceType: string;
      readonly seatCount: string;
      readonly primaryClubId: string;
      readonly formerNames: string;
      readonly activeLabel: string;
      readonly countryId: string;
      readonly cityId: string;
      readonly imageUrl: string;
      readonly id: string;
      readonly slug: string;
      readonly createdAt: string;
      readonly updatedAt: string;
    };
    readonly delete: {
      readonly confirmTitle: string;
      readonly confirmBody: string;
      readonly success: string;
      readonly pending: string;
      readonly action: string;
      readonly defaultError: string;
    };
    readonly errors: Readonly<Record<string, string>>;
  };
  readonly federations: {
    readonly detail: {
      readonly profile: string;
      readonly media: string;
      readonly teams: string;
      readonly championships: string;
      readonly identity: string;
      readonly foundation: string;
      readonly location: string;
      readonly metadata: string;
      readonly representativeImage: string;
      readonly sectionsPending: string;
      readonly noRepresentativeImage: string;
      readonly notAvailableTitle: string;
      readonly backToFederations: string;
    };
    readonly form: {
      readonly name: string;
      readonly federationLevel: string;
      readonly nativeName: string;
      readonly shortName: string;
      readonly acronym: string;
      readonly foundationDate: string;
      readonly countryId: string;
      readonly cityId: string;
      readonly officialWebsiteUrl: string;
      readonly iconUrl: string;
      readonly heroImageUrl: string;
      readonly description: string;
      readonly activeLabel: string;
      readonly id: string;
      readonly slug: string;
      readonly createdAt: string;
      readonly updatedAt: string;
    };
    readonly delete: {
      readonly confirmTitle: string;
      readonly confirmBody: string;
      readonly success: string;
      readonly pending: string;
      readonly action: string;
      readonly defaultError: string;
    };
    readonly errors: Readonly<Record<string, string>>;
  };
}

const DICTIONARIES: Readonly<Record<AppLocale, AppDictionary>> = {
  en,
  es,
};

export function getDictionary(locale: AppLocale): AppDictionary {
  const dictionary = DICTIONARIES[locale];

  if (dictionary) {
    return dictionary;
  }

  return DICTIONARIES[FALLBACK_LOCALE];
}
