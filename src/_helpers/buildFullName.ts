/** @format */

// File: src/_helpers/buildFullName.ts
// Purpose: Build a readable full name from profile parts with a fallback label
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

type NameParts = Readonly<{
  name?: string;
  middlename?: string;
  surname?: string;
}>;

export default function buildFullName(
  parts: NameParts,
  fallback = 'No name',
): string {
  const fullName = [parts.name, parts.middlename, parts.surname]
    .map(function trimPart(value?: string): string {
      return value?.trim() ?? '';
    })
    .filter(Boolean)
    .join(' ');

  return fullName || fallback;
}
