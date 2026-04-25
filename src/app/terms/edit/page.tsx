/** @format */

import { redirect } from 'next/navigation';

export default function TermsLegacyEditPage() {
  redirect('/legal?type=TERMS');
}
