/** @format */

import { redirect } from 'next/navigation';

export default function TermsLegacyPage() {
  redirect('/legal?type=TERMS');
}
