/** @format */

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Title from '@/_components/typography/Title';
import Text from '@/_components/typography/Text';
import type { TextColor } from '@/_constants/typography';

type TrendDirection = 'up' | 'down' | 'steady';

type KpiCard = Readonly<{
  id: string;
  label: string;
  value: string;
  delta: string;
  detail: string;
  trend: TrendDirection;
}>;

type CampaignSnapshot = Readonly<{
  id: string;
  name: string;
  owner: string;
  metric: string;
  status: string;
  statusColor: TextColor;
}>;

type UpcomingEvent = Readonly<{
  id: string;
  title: string;
  date: string;
  location: string;
  focus: string;
}>;

type ActivityItem = Readonly<{
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  accentColor: TextColor;
}>;

type TeamLoad = Readonly<{
  id: string;
  team: string;
  capacity: string;
  focus: string;
  health: 'stable' | 'watch' | 'critical';
}>;

const TREND_STYLES: Readonly<
  Record<TrendDirection, Readonly<{ color: TextColor }>>
> = {
  up: { color: 'green' },
  down: { color: 'red' },
  steady: { color: 'gray' },
};

const KPI_CARDS = [
  {
    id: 'activeCampaigns',
    label: 'Active Campaigns',
    value: '18',
    delta: '+3 vs last week',
    detail: '82% average completion',
    trend: 'up',
  },
  {
    id: 'pendingApprovals',
    label: 'Pending Approvals',
    value: '6',
    delta: '2 require compliance',
    detail: 'Clears daily at 14:00',
    trend: 'down',
  },
  {
    id: 'newMembers',
    label: 'New Members (24h)',
    value: '+412',
    delta: '+6% lift',
    detail: 'Spain + LATAM driving growth',
    trend: 'up',
  },
  {
    id: 'supportBacklog',
    label: 'Support Backlog',
    value: '38 tickets',
    delta: 'SLA 92% met',
    detail: 'Most related to onboarding',
    trend: 'steady',
  },
] satisfies ReadonlyArray<KpiCard>;

const ACTIVE_CAMPAIGNS = [
  {
    id: 'urban-ride',
    name: 'Urban Ride Week',
    owner: 'Growth · Cycling',
    metric: '82% completion · 14 cities',
    status: 'Live',
    statusColor: 'green',
  },
  {
    id: 'marathon-series',
    name: 'Marathon Series 2026',
    owner: 'Events · Endurance',
    metric: 'Registration pacing 109%',
    status: 'Next checkpoint in 2d',
    statusColor: 'orange',
  },
  {
    id: 'youth-academy',
    name: 'Youth Academy Draft',
    owner: 'Community · Mentors',
    metric: 'Talent pool 468 / 500',
    status: 'Needs reviewer',
    statusColor: 'purple',
  },
] satisfies ReadonlyArray<CampaignSnapshot>;

const UPCOMING_EVENTS = [
  {
    id: 'summit',
    title: 'Global Coaches Summit',
    date: '12 Mar · 09:00',
    location: 'Barcelona · Hybrid',
    focus: 'Leadership · Workshops',
  },
  {
    id: 'tri-clinic',
    title: 'Triathlon Clinic',
    date: '16 Mar · 07:30',
    location: 'Lisbon Waterfront',
    focus: 'Swimming blocks + run pacing',
  },
  {
    id: 'club-audit',
    title: 'Club Licensing Audit',
    date: '19 Mar · 15:00',
    location: 'Remote',
    focus: 'Compliance review',
  },
] satisfies ReadonlyArray<UpcomingEvent>;

const ACTIVITY_FEED = [
  {
    id: 'ops-01',
    title: 'Logistics handoff completed',
    detail: 'Buenos Aires Half Marathon now handled by regional PMO.',
    timestamp: '08:10 · Ops',
    accentColor: 'green',
  },
  {
    id: 'ops-02',
    title: 'Two campaigns flagged for content',
    detail: 'Waiting for brand review before publishing to Tier-2 clubs.',
    timestamp: '07:45 · Brand Studio',
    accentColor: 'orange',
  },
  {
    id: 'ops-03',
    title: 'New wellness partner onboarded',
    detail: 'MindfulFuel offers perks across LATAM centers.',
    timestamp: '07:25 · Partnerships',
    accentColor: 'blue',
  },
] satisfies ReadonlyArray<ActivityItem>;

const TEAM_LOAD = [
  {
    id: 'growth',
    team: 'Growth Pods',
    capacity: '76% utilized',
    focus: 'Personalized onboarding + referrals',
    health: 'stable',
  },
  {
    id: 'community',
    team: 'Community Success',
    capacity: '91% utilized',
    focus: 'Moderator backfill · guideline refresh',
    health: 'watch',
  },
  {
    id: 'infrastructure',
    team: 'Infrastructure',
    capacity: '63% utilized',
    focus: 'Realtime scoring rollout',
    health: 'stable',
  },
  {
    id: 'support',
    team: 'Support Guild',
    capacity: '98% utilized',
    focus: 'Onboarding tickets · multi-language FAQ',
    health: 'critical',
  },
] satisfies ReadonlyArray<TeamLoad>;

const HEALTH_COLOR: Readonly<Record<TeamLoad['health'], TextColor>> = {
  stable: 'green',
  watch: 'orange',
  critical: 'red',
};

const LAST_REFRESH = 'Mock snapshot · Today, 08:45 GMT-3';

export default function Dashboard() {
  return (
    <Section
      gap={32}
      padding={32}
      className='background-color--almost-white'
      style={{ minHeight: '100vh' }}
    >
      <div className='display--grid gap--8'>
        <Title size='large' as='h1'>
          Operations Control Center
        </Title>
        <Text color='gray'>
          Daily mock pulse of SportApp activity. No live data is requested.
        </Text>
        <Text size='small' color='lighterGray'>
          {LAST_REFRESH}
        </Text>
      </div>

      <Grid columns={4} gap={24}>
        {KPI_CARDS.map(card => (
          <Card key={card.id} padding={24}>
            <Text size='small' color='gray'>
              {card.label}
            </Text>
            <Title size='medium' inline>
              {card.value}
            </Title>
            <Text size='small' color={TREND_STYLES[card.trend].color}>
              {card.delta}
            </Text>
            <Text size='small' color='lighterGray'>
              {card.detail}
            </Text>
          </Card>
        ))}
      </Grid>

      <Grid columns={2} gap={24}>
        <Card padding={24}>
          <Title size='small' as='h3'>
            Active Campaigns
          </Title>
          <Text size='small' color='gray'>
            Consolidated view of the initiatives rolling out this week.
          </Text>
          <Grid gap={16}>
            {ACTIVE_CAMPAIGNS.map(campaign => (
              <Grid key={campaign.id} gap={4}>
                <Title size='normal' weight='semibold' as='h4'>
                  {campaign.name}
                </Title>
                <Text size='small' color='gray'>
                  {campaign.owner}
                </Text>
                <Text size='small'>{campaign.metric}</Text>
                <Text size='small' color={campaign.statusColor}>
                  {campaign.status}
                </Text>
              </Grid>
            ))}
          </Grid>
        </Card>

        <Card padding={24}>
          <Title size='small' as='h3'>
            Upcoming Events
          </Title>
          <Text size='small' color='gray'>
            Logistics-ready timeline for the next seven days.
          </Text>
          <Grid gap={16}>
            {UPCOMING_EVENTS.map(event => (
              <Grid key={event.id} gap={4}>
                <Title size='normal' weight='semibold' as='h4'>
                  {event.title}
                </Title>
                <Text size='small'>{event.date}</Text>
                <Text size='small' color='gray'>
                  {event.location}
                </Text>
                <Text size='small' color='lighterGray'>
                  {event.focus}
                </Text>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>

      <Grid columns={2} gap={24}>
        <Card padding={24}>
          <Title size='small' as='h3'>
            Operational Updates
          </Title>
          <Text size='small' color='gray'>
            Highlights curated by the command center.
          </Text>
          <Grid gap={16}>
            {ACTIVITY_FEED.map(item => (
              <Grid key={item.id} gap={4}>
                <Text size='small' color={item.accentColor} weight='semibold'>
                  {item.timestamp}
                </Text>
                <Title size='normal' weight='semibold' as='h4'>
                  {item.title}
                </Title>
                <Text size='small' color='gray'>
                  {item.detail}
                </Text>
              </Grid>
            ))}
          </Grid>
        </Card>

        <Card padding={24}>
          <Title size='small' as='h3'>
            Team Load
          </Title>
          <Text size='small' color='gray'>
            Capacity and focus areas to anticipate bottlenecks.
          </Text>
          <Grid gap={16}>
            {TEAM_LOAD.map(team => (
              <Grid key={team.id} gap={4}>
                <Title size='normal' weight='semibold' as='h4'>
                  {team.team}
                </Title>
                <Text size='small'>{team.capacity}</Text>
                <Text size='small' color='gray'>
                  {team.focus}
                </Text>
                <Text size='small' color={HEALTH_COLOR[team.health]}>
                  Health · {team.health}
                </Text>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>
    </Section>
  );
}
