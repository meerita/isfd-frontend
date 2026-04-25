/** @format */

// File: src/app/groups/_components/ProfileDetail.tsx
// Purpose: Render the group profile summary in the detail view
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import Card from '@/_components/Card';
import LastUpdated from '@/_components/forms/LastUpdated';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import List from '@/_components/navigation/List';
import ListItemData from '@/_components/navigation/ListItemData';
import Title from '@/_components/typography/Title';
import {
  isVisibleGroupVisibility,
  normalizeGroupVisibility,
} from '@/_helpers/normalizeGroupVisibility';
import type { Group } from '@/_types/group';

const EMPTY_VALUE = '-';

function toText(value?: string | number | null): string {
  if (typeof value === 'number') {
    return String(value);
  }

  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0
    ? normalizedValue
    : EMPTY_VALUE;
}

function toLabel(value?: string): string {
  const normalizedValue = toText(value);

  if (normalizedValue === EMPTY_VALUE) {
    return normalizedValue;
  }

  return normalizedValue
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split('_')
    .join(' ')
    .split(' ')
    .filter(Boolean)
    .map(function capitalizeSegment(segment: string): string {
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(' ');
}

function toDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function toDateText(value?: string): string {
  const parsedDate = toDate(value);

  if (!parsedDate) {
    return EMPTY_VALUE;
  }

  return parsedDate.toLocaleDateString('es-ES');
}

function toCoordsText(coords?: Group['location']['coords']): string {
  if (!coords) {
    return EMPTY_VALUE;
  }

  return `Lat: ${coords.latitude}, Lng: ${coords.longitude}`;
}

function buildAddress(group: Group): string {
  const location = group.location;
  const addressParts = [location?.street, location?.number, location?.zip]
    .filter(function isAddressPart(
      value: string | number | undefined,
    ): value is string | number {
      return value !== undefined && String(value).trim().length > 0;
    })
    .map(String);

  return addressParts.length > 0 ? addressParts.join(' ') : EMPTY_VALUE;
}

export default function ProfileDetail({ group }: Readonly<{ group: Group }>) {
  const updatedDate = toDate(group.updatedAt);
  const membershipPrivacy =
    group.preferences?.membership?.privacy ?? group.privacy;
  const visibilityPreference = normalizeGroupVisibility(
    group.preferences?.visibility?.visibility ?? group.visibility,
  );
  const membershipJoinMode =
    group.preferences?.membership?.joinMode ?? group.joinMode;

  return (
    <Card className='display--grid gap--16'>
      <SectionHeader title={group.name} icon='users' />
      <Grid gap={32} columns={2} alignItems='start'>
        <Grid gap={32}>
          <Grid gap={4}>
            <Title size='tiny' weight='bold'>
              Identity
            </Title>
            <List ordered gap={0}>
              <ListItemData label='UUID' value={group.id} line />
              <ListItemData label='Name' value={toText(group.name)} line />
              <ListItemData label='Slug' value={toText(group.slug)} line />
              <ListItemData
                label='Created at'
                value={toDateText(group.createdAt)}
              />
            </List>
          </Grid>

          <Grid gap={4}>
            <Title size='tiny' weight='bold'>
              Profile Information
            </Title>
            <List ordered gap={0}>
              <ListItemData
                label='Description'
                value={toText(group.description)}
                line
              />
              <ListItemData
                label='Sport'
                value={toText(group.sport?.localizedName ?? group.sport?.id)}
                line
              />
              <ListItemData
                label='Privacy'
                value={toLabel(membershipPrivacy)}
                line
              />
              <ListItemData
                label='Visibility'
                value={toLabel(visibilityPreference)}
                line
              />
              <ListItemData
                label='Join Mode'
                value={toLabel(membershipJoinMode)}
              />
            </List>
          </Grid>

          {updatedDate ? <LastUpdated date={updatedDate} /> : null}
        </Grid>

        <Grid gap={32}>
          <Grid gap={4}>
            <Title size='tiny' weight='bold'>
              Status
            </Title>
            <List ordered gap={0}>
              <ListItemData
                label='Active'
                active={group.status === 'ACTIVE'}
                line
              />
              <ListItemData
                label='Visible'
                active={isVisibleGroupVisibility(visibilityPreference)}
              />
            </List>
          </Grid>

          <Grid gap={4}>
            <Title size='tiny' weight='bold'>
              Location
            </Title>
            <List ordered gap={0}>
              <ListItemData
                label='Continent'
                value={toText(group.location?.continent)}
                line
              />
              <ListItemData
                label='Country'
                value={toText(group.location?.country)}
                line
              />
              <ListItemData
                label='Province'
                value={toText(group.location?.province)}
                line
              />
              <ListItemData
                label='City'
                value={toText(group.location?.city)}
                line
              />
              <ListItemData
                label='Coordinates'
                value={toCoordsText(group.location?.coords)}
                line
              />
              <ListItemData label='Address' value={buildAddress(group)} />
            </List>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}
