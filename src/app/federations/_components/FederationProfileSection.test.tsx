/** @format */

import { expect, mock, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { I18nProvider } from '@/_i18n/I18nProvider';
import { getDictionary } from '@/_i18n/getDictionary';
import type { Federation } from '@/_types/federation';

test('renders dissolution date in federation detail', async () => {
  mock.module('next/navigation', () => ({
    useRouter: () => ({
      prefetch() {},
      push() {},
    }),
  }));

  const { default: FederationProfileSection } = await import(
    './FederationProfileSection'
  );
  const dictionary = getDictionary('es');
  const federation: Federation = {
    id: 'fed-1',
    name: 'UEFA',
    slug: 'uefa',
    federationLevel: 'CONTINENTAL',
    iconUrl: null,
    countryId: 'country-1',
    cityId: 'city-1',
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    nativeName: null,
    shortName: null,
    acronym: 'UEFA',
    foundationDate: '1954-06-15',
    dissolutionDate: '2024-06-01',
    officialWebsiteUrl: null,
    heroImageUrl: null,
  };

  const markup = renderToStaticMarkup(
    <I18nProvider locale='es' dictionary={dictionary}>
      <FederationProfileSection federation={federation} />
    </I18nProvider>,
  );

  expect(markup).toContain('Fecha de disolución');
  expect(markup).toContain(
    new Date('2024-06-01T00:00:00Z').toLocaleDateString('es'),
  );
  expect(markup).not.toContain('Descripción');
});
