/** @format */

import Link from 'next/link';

import { getAdminContributionById } from '@/_actions/contribution/getAdminContributionById';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import { resolveContributionErrorMessage } from '@/_constants/contributionErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  ContributionTargetEntityType,
  ContributionType,
} from '@/_types/contribution';
import { getDictionary } from '../../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../../_i18n/resolveRequestLocale';
import ContributionReviewActions from '../_components/ContributionReviewActions';
import ContributionStatusBadge from '../_components/ContributionStatusBadge';
import { formatDateTime, PLACEHOLDER } from '../_components/utils';

type ContributionPageParams = Readonly<{
  id: string;
}>;

type ContributionPageProps = Readonly<{
  params: Promise<ContributionPageParams> | ContributionPageParams;
}>;

function getContributionTypeLabel(
  type: ContributionType,
  dictionary: ReturnType<typeof getDictionary>,
): string {
  return type === 'PERSON_PORTRAIT_SUBMISSION'
    ? dictionary.contributions.labels.contributionType.personPortraitSubmission
    : dictionary.contributions.labels.contributionType.stadiumImageSubmission;
}

function getTargetEntityTypeLabel(
  type: ContributionTargetEntityType,
  dictionary: ReturnType<typeof getDictionary>,
): string {
  return type === 'PERSON'
    ? dictionary.contributions.labels.targetEntityType.person
    : dictionary.contributions.labels.targetEntityType.stadium;
}

function resolveTargetHref(
  targetEntityType: ContributionTargetEntityType,
  targetEntityId: string,
): string {
  return targetEntityType === 'PERSON'
    ? NAVIGATION.PERSON_BY_ID(targetEntityId)
    : NAVIGATION.STADIUM_BY_ID(targetEntityId);
}

function DetailField({
  label,
  value,
}: Readonly<{
  label: string;
  value: React.ReactNode;
}>): React.JSX.Element {
  return (
    <Grid gap={4}>
      <Text size='small' color='gray'>
        {label}
      </Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text
          size='small'
          weight='bold'
          className='font-family--monospace word-break--break-all'
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </Grid>
  );
}

export default async function ContributionDetailPage({
  params,
}: ContributionPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);
  const resolvedParams = await params;
  const contributionId = resolvedParams?.id?.trim() ?? '';

  if (!contributionId) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[{ label: dictionary.navigation.contributions }]}
          icon='uploadFile'
        />
        <Main>
          <Text weight='bold'>{dictionary.contributions.detail.unavailableTitle}</Text>
          <Text size='small' color='gray'>
            {dictionary.contributions.detail.missingId}
          </Text>
        </Main>
      </Grid>
    );
  }

  const response = await getAdminContributionById(contributionId);

  if (!response.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            {
              label: dictionary.navigation.contributions,
              href: NAVIGATION.CONTRIBUTIONS,
            },
          ]}
          icon='uploadFile'
        />
        <Main>
          <Text weight='bold'>{dictionary.contributions.detail.unavailableTitle}</Text>
          <Text size='small' color='gray'>
            {resolveContributionErrorMessage(
              response.error,
              dictionary.contributions.errors,
              dictionary.common.unexpectedError,
            )}
          </Text>
        </Main>
      </Grid>
    );
  }

  const contribution = response.data;
  const targetHref = resolveTargetHref(
    contribution.targetEntityType,
    contribution.targetEntityId,
  );

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          {
            label: dictionary.navigation.contributions,
            href: NAVIGATION.CONTRIBUTIONS,
          },
          { label: contribution.id },
        ]}
        icon='uploadFile'
      >
        <ContributionReviewActions
          contributionId={contribution.id}
          reviewStatus={contribution.reviewStatus}
          targetEntityType={contribution.targetEntityType}
          targetEntityId={contribution.targetEntityId}
        />
      </SectionHeader>

      <Main>
        <Grid gap={16}>
          {contribution.reviewStatus === 'PENDING' ? (
            <Text size='small' color='gray'>
              {dictionary.contributions.detail.pendingHelp}
            </Text>
          ) : null}

          <Grid columns={2} gap={16}>
            <DetailField
              label={dictionary.contributions.fields.id}
              value={contribution.id}
            />
            <DetailField
              label={dictionary.contributions.fields.reviewStatus}
              value={<ContributionStatusBadge status={contribution.reviewStatus} />}
            />
            <DetailField
              label={dictionary.contributions.fields.contributionType}
              value={getContributionTypeLabel(
                contribution.contributionType,
                dictionary,
              )}
            />
            <DetailField
              label={dictionary.contributions.fields.targetEntityType}
              value={getTargetEntityTypeLabel(
                contribution.targetEntityType,
                dictionary,
              )}
            />
            <DetailField
              label={dictionary.contributions.fields.targetEntityId}
              value={
                <Link href={targetHref}>
                  <Text
                    size='small'
                    weight='bold'
                    className='font-family--monospace word-break--break-all'
                  >
                    {contribution.targetEntityId}
                  </Text>
                </Link>
              }
            />
            <DetailField
              label={dictionary.contributions.fields.assetId}
              value={contribution.assetId}
            />
            <DetailField
              label={dictionary.contributions.fields.submittedByUserId}
              value={contribution.submittedByUserId}
            />
            <DetailField
              label={dictionary.contributions.fields.reviewedByUserId}
              value={contribution.reviewedByUserId ?? PLACEHOLDER}
            />
            <DetailField
              label={dictionary.contributions.fields.reviewedAt}
              value={formatDateTime(contribution.reviewedAt, locale)}
            />
            <DetailField
              label={dictionary.contributions.fields.createdAt}
              value={formatDateTime(contribution.createdAt, locale)}
            />
            <DetailField
              label={dictionary.contributions.fields.updatedAt}
              value={formatDateTime(contribution.updatedAt, locale)}
            />
          </Grid>
        </Grid>
      </Main>
    </Grid>
  );
}
