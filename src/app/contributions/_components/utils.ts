/** @format */

export { parseUuid } from '@/_helpers/uuid';

export const PLACEHOLDER = '--';

export function parsePositiveInt(
  value: string | string[] | undefined,
  fallback: number,
  max?: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  const integer = Math.floor(parsed);
  return max ? Math.min(integer, max) : integer;
}

export function parseString(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.length > 0 ? raw : undefined;
}

export function formatDateTime(
  value: string | null | undefined,
  locale?: string,
): string {
  if (!value) return PLACEHOLDER;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return PLACEHOLDER;

  return parsed.toLocaleString(locale);
}
