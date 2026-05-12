/** @format */

import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import SensitiveValue from './SensitiveValue';

test('renders masked values by default without exposing the raw ID', () => {
  const markup = renderToStaticMarkup(<SensitiveValue value='user-123456789' />);

  expect(markup).toContain('••••••••');
  expect(markup).toContain('aria-label="Show sensitive value"');
  expect(markup).not.toContain('user-123456789');
});
