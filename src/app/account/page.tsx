/** @format */

import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import { handleUnauthorized } from '@/_actions/account/handleUnauthorized';
import { getCurrentSession } from '@/_actions/account/getCurrentSession';
import { getMe } from '@/_actions/account/getMe';
import { getMyContributions } from '@/_actions/account/getMyContributions';
import { getMyPoints } from '@/_actions/account/getMyPoints';
import { getMyProfile } from '@/_actions/account/getMyProfile';
import {
  parseAccountSection,
  type AccountSection,
} from '@/_constants/account';
import {
  buildAccountHref,
  parseMyContributionsSearchState,
  parseSingleValue,
  type AccountSearchParams,
} from '@/_helpers/account';
import { ACCOUNT_COPY } from './_constants/copy';
import AccountOverviewSection from './_components/AccountOverviewSection';
import AccountSidebarNavigation from './_components/AccountSidebarNavigation';
import CurrentSessionCard from './_components/CurrentSessionCard';
import MyContributionsSection from './_components/MyContributionsSection';
import MyProfileForm from './_components/MyProfileForm';

function getSectionTitle(section: AccountSection): string {
  return ACCOUNT_COPY.sections[section];
}

export default async function AccountPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<AccountSearchParams>;
}>): Promise<React.JSX.Element> {
  const resolvedSearchParams = await searchParams;
  const activeSection = parseAccountSection(
    parseSingleValue(resolvedSearchParams?.section),
  );
  const contributionState = parseMyContributionsSearchState(resolvedSearchParams);

  const mePromise = getMe();
  const profilePromise = getMyProfile();
  const pointsPromise = getMyPoints();
  const contributionsPromise =
    activeSection === 'contributions'
      ? getMyContributions(contributionState)
      : Promise.resolve(null);
  const sessionPromise =
    activeSection === 'session' || activeSection === 'overview'
      ? getCurrentSession()
      : Promise.resolve(null);

  const [meResult, profileResult, pointsResult, contributionsResult, sessionResult] =
    await Promise.all([
      mePromise,
      profilePromise,
      pointsPromise,
      contributionsPromise,
      sessionPromise,
    ]);

  const unauthorizedResult = [
    meResult,
    profileResult,
    pointsResult,
    contributionsResult,
    sessionResult,
  ].find(result => result?.error?.code === 'UNAUTHORIZED');

  if (unauthorizedResult) {
    await handleUnauthorized();
  }

  if (!meResult.data) {
    return (
      <Grid gap={16}>
        <SectionHeader title={ACCOUNT_COPY.title} icon='account' />
        <Main>
          <Text color='gray'>
            {meResult.error?.message ?? 'No se pudo cargar tu cuenta.'}
          </Text>
        </Main>
      </Grid>
    );
  }

  const profile =
    profileResult.data ??
    (profileResult.error?.code === 'PROFILE_NOT_FOUND' ? null : null);

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          {
            label: ACCOUNT_COPY.title,
            href: buildAccountHref({ section: 'overview' }),
          },
          {
            label: getSectionTitle(activeSection),
          },
        ]}
        icon='account'
      />

      <Main>
        <Grid className='c-aside-grid' gap={16}>
          <AccountSidebarNavigation activeSection={activeSection} />
          <Grid gap={16}>
            <Grid gap={8}>
              <Text size='small' color='gray'>
                {getSectionTitle(activeSection)}
              </Text>
              <Text color='gray'>
                {activeSection === 'overview'
                  ? ACCOUNT_COPY.overview.intro
                  : activeSection === 'profile'
                    ? ACCOUNT_COPY.profile.subtitle
                    : activeSection === 'contributions'
                      ? ACCOUNT_COPY.contributions.subtitle
                      : ACCOUNT_COPY.overview.sessionTitle}
              </Text>
            </Grid>

            {activeSection === 'overview' ? (
              <AccountOverviewSection
                me={meResult.data}
                profile={profile}
                pointsResult={pointsResult}
                sessionResult={sessionResult ?? undefined}
              />
            ) : null}

            {activeSection === 'profile' ? (
              <MyProfileForm initialProfile={profile} />
            ) : null}

            {activeSection === 'contributions' && contributionsResult ? (
              <MyContributionsSection result={contributionsResult} />
            ) : null}

            {activeSection === 'session' && sessionResult ? (
              <CurrentSessionCard sessionResult={sessionResult} />
            ) : null}
          </Grid>
        </Grid>
      </Main>
    </Grid>
  );
}
