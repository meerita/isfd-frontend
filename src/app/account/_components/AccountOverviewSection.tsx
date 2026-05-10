/** @format */

import Grid from '@/_components/layout/Grid';
import type {
  CurrentSessionResponse,
  GetMyPointsResponse,
  GetMyProfileResponse,
  MeApiResult,
  MeResponse,
} from '@/_types/me';
import AccountIdentityCard from './AccountIdentityCard';
import AccountProfileSummaryCard from './AccountProfileSummaryCard';
import CurrentSessionCard from './CurrentSessionCard';
import MyPointsCard from './MyPointsCard';

export default function AccountOverviewSection({
  me,
  profile,
  pointsResult,
  sessionResult,
}: Readonly<{
  me: MeResponse;
  profile: GetMyProfileResponse | null;
  pointsResult: MeApiResult<GetMyPointsResponse>;
  sessionResult?: MeApiResult<CurrentSessionResponse>;
}>): React.JSX.Element {
  return (
    <Grid gap={16}>
      <Grid columns={2} gap={16}>
        <AccountIdentityCard me={me} profile={profile} />
        <AccountProfileSummaryCard profile={profile} />
      </Grid>

      <Grid columns={2} gap={16}>
        <MyPointsCard pointsResult={pointsResult} />
        {sessionResult ? <CurrentSessionCard sessionResult={sessionResult} /> : null}
      </Grid>
    </Grid>
  );
}
