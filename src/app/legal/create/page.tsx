/** @format */

import { redirect } from 'next/navigation';

import NAVIGATION from '@/_constants/navigation';

export default function LegacyCreateLegalDocumentPage() {
  redirect(NAVIGATION.LEGAL_CREATE);
}
