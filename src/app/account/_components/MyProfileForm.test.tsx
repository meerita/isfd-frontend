/** @format */

import { expect, mock, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

test('renders the profile form in creation mode when profile is missing', async () => {
  mock.module('next/navigation', () => ({
    useRouter: () => ({
      refresh() {},
    }),
  }));
  mock.module('@/_actions/account/handleUnauthorized', () => ({
    handleUnauthorized: async () => undefined,
  }));

  const { default: MyProfileForm } = await import('./MyProfileForm');

  const markup = renderToStaticMarkup(<MyProfileForm initialProfile={null} />);

  expect(markup).toContain('Todavía no has creado tu perfil.');
  expect(markup).toContain('Guardar perfil');
  expect(markup).toContain('value="public"');
});
