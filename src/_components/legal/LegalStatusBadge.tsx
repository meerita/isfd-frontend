/** @format */

'use client';

import Text from '@/_components/typography/Text';
import type { LegalDocumentStatus } from '@/_types/legal';

const STATUS_STYLES: Record<LegalDocumentStatus, string> = {
  DRAFT: 'background-color--lightest-blue color--blue',
  PUBLISHED: 'background-color--lightest-green color--green',
  ARCHIVED: 'background-color--lightest-gray color--gray',
};

export default function LegalStatusBadge({
  status,
}: Readonly<{
  status: LegalDocumentStatus;
}>) {
  return (
    <Text
      inline
      size='tiny'
      weight='bold'
      className={`padding-inline--10 padding-block--4 border-radius--512 text-transform--uppercase ${STATUS_STYLES[status]}`}
    >
      {status}
    </Text>
  );
}
