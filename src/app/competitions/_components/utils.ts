/** @format */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const PLACEHOLDER = '--';

export function parsePositiveInt(
  value: string | string[] | undefined,
  fallback: number,
  max?: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  const integer = Math.floor(parsed);
  return max ? Math.min(integer, max) : integer;
}

export function parseString(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.length > 0 ? raw : undefined;
}

export function parseUuid(value: string | string[] | undefined): string | undefined {
  const parsed = parseString(value);
  return parsed && UUID_PATTERN.test(parsed) ? parsed : undefined;
}

export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return PLACEHOLDER;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return PLACEHOLDER;

  return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return PLACEHOLDER;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return PLACEHOLDER;

  return parsed.toLocaleString();
}

export function formatDateForInput(value: string | null | undefined): string {
  if (!value) return '';
  if (DATE_PATTERN.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toISOString().slice(0, 10);
}
