/** @format */

'use client';

import Text from '@/_components/typography/Text';
import { useI18n } from '@/_i18n/I18nProvider';
import type { ContributionReviewStatus } from '@/_types/contribution';

const STATUS_STYLES: Record<ContributionReviewStatus, string> = {
  PENDING: 'background-color--lightest-blue color--blue',
  APPROVED: 'background-color--lightest-green color--green',
  REJECTED: 'background-color--lightest-gray color--gray',
};

export default function ContributionStatusBadge({
  status,
}: Readonly<{
  status: ContributionReviewStatus;
}>): React.JSX.Element {
  const { dictionary } = useI18n();

  const label =
    status === 'PENDING'
      ? dictionary.contributions.labels.reviewStatus.pending
      : status === 'APPROVED'
        ? dictionary.contributions.labels.reviewStatus.approved
        : dictionary.contributions.labels.reviewStatus.rejected;

  return (
    <Text
      inline
      size='tiny'
      weight='bold'
      className={`padding-inline--10 padding-block--4 border-radius--512 text-transform--uppercase ${STATUS_STYLES[status]}`}
    >
      {label}
    </Text>
  );
}
