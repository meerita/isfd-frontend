/** @format */

export type EnumOption<TValue extends string> = Readonly<{
  value: TValue;
  label: string;
}>;

export function createEnumOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Readonly<Record<TValue, string>>,
): ReadonlyArray<EnumOption<TValue>> {
  return values.map(value => ({
    value,
    label: labels[value],
  }));
}

export function toEnumValue<TValue extends string>(
  value: unknown,
  values: readonly TValue[],
): TValue | null {
  return typeof value === 'string' &&
    (values as readonly string[]).includes(value)
    ? (value as TValue)
    : null;
}

export function getEnumLabel<TValue extends string>(
  value: TValue | null | undefined,
  labels: Readonly<Record<TValue, string>>,
): string | null {
  if (!value) return null;

  return labels[value];
}
