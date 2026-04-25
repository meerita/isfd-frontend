/** @format */

import API_ROUTES from './apiRoutes';

const LEGAL_DOCUMENT_TYPE_LABELS: Readonly<
  Record<'TERMS' | 'PRIVACY' | 'SUBSCRIPTION', string>
> = {
  TERMS: 'Terms',
  PRIVACY: 'Privacy',
  SUBSCRIPTION: 'Subscription',
};

const RAW_LEGAL_LANGUAGES = ['EN', 'ES'] as const;

const LEGAL_LANGUAGE_LABELS: Readonly<
  Record<(typeof RAW_LEGAL_LANGUAGES)[number], string>
> = {
  EN: 'English',
  ES: 'Spanish',
};

const LEGAL_REQUIRED_LANGUAGES = new Set(['EN']);

export const LEGAL_DOCUMENT_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
] as const;

export const LEGAL_DOCUMENT_TYPES = [
  {
    value: 'TERMS',
    label: LEGAL_DOCUMENT_TYPE_LABELS.TERMS,
    publicPath: API_ROUTES.LEGAL_TERMS,
  },
  {
    value: 'PRIVACY',
    label: LEGAL_DOCUMENT_TYPE_LABELS.PRIVACY,
    publicPath: API_ROUTES.LEGAL_PRIVACY,
  },
  {
    value: 'SUBSCRIPTION',
    label: LEGAL_DOCUMENT_TYPE_LABELS.SUBSCRIPTION,
    publicPath: API_ROUTES.LEGAL_SUBSCRIPTION,
  },
] as const;

export const LEGAL_LANGUAGES = RAW_LEGAL_LANGUAGES.map(value => ({
  value,
  label: LEGAL_LANGUAGE_LABELS[value],
  required: LEGAL_REQUIRED_LANGUAGES.has(value),
})) as ReadonlyArray<
  Readonly<{
    value: (typeof RAW_LEGAL_LANGUAGES)[number];
    label: string;
    required: boolean;
  }>
>;
