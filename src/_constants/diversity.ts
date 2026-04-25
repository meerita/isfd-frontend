/** @format */

import { Gender } from '@/_types/genders';

export const DIVERSITY: ReadonlyArray<{
  label: string;
  value: Gender;
}> = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

export default DIVERSITY;
