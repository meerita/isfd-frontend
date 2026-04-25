/** @format */

import type { UserSkillLevel } from '@/_types/user';

export const USER_SKILL_LEVELS: ReadonlyArray<UserSkillLevel> = [
  'ANY',
  'NOVICE',
  'ADVANCED_BEGINNER',
  'COMPETENT',
  'PROFICIENT',
  'EXPERT',
  'PROFESSIONAL',
];

export const USER_SKILL_LEVEL_OPTIONS: ReadonlyArray<
  Readonly<{ value: UserSkillLevel; label: string }>
> = [
  { value: 'ANY', label: 'Any' },
  { value: 'NOVICE', label: 'Novice' },
  { value: 'ADVANCED_BEGINNER', label: 'Advanced Beginner' },
  { value: 'COMPETENT', label: 'Competent' },
  { value: 'PROFICIENT', label: 'Proficient' },
  { value: 'EXPERT', label: 'Expert' },
  { value: 'PROFESSIONAL', label: 'Professional' },
];
