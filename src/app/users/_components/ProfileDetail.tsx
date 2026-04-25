/** @format */
'use client';
import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import LastUpdated from '@/_components/forms/LastUpdated';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import List from '@/_components/navigation/List';
import ListItemData from '@/_components/navigation/ListItemData';
import { User } from '@/_types/user';
import { useSearchParams } from 'next/navigation';
import ProfileDetailForm from './forms/ProfileDetail';
import Grid from '@/_components/layout/Grid';
import Title from '@/_components/typography/Title';

const toText = (value?: string | number | null): string => {
  if (typeof value === 'number') {
    return String(value);
  }

  const normalizedValue = value?.trim();
  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '-';
};

const toDateText = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString('es-ES');
};

const toCoordsText = (
  coords?: Readonly<{ lat: number; lng: number }> | null,
): string => {
  if (!coords) {
    return '-';
  }

  return `Lat: ${coords.lat}, Lng: ${coords.lng}`;
};

const toDateObject = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

export default function ProfileDetail({
  user,
  edit,
}: Readonly<{ user: User; edit: boolean }>) {
  const searchParams = useSearchParams();
  const isEditing = edit || searchParams.get('edit') === 'true';
  const fullName =
    [user.profile?.name, user.profile?.middlename, user.profile?.surname]
      .filter(Boolean)
      .join(' ') || '-';

  const location = user.profile?.location;
  const phone = user.verification?.phone;
  const updatedDate = toDateObject(user.metadata.updatedAt);

  const userPostalAddress =
    [location?.street, location?.number, location?.zip]
      .filter(Boolean)
      .join(' ') || '-';

  const profileTitle =
    user.profile?.name?.trim() || user.identity?.username || 'User';
  const headerTitle = user.identity?.tag
    ? `${user.identity?.username} - ${user.identity.tag}`
    : user.identity?.username || 'User';

  if (isEditing) {
    return (
      <Card>
        <SectionHeader title={`Edit ${profileTitle} Profile`}>
          <ButtonGroup>
            <Button type='button' href='?section=profile' variant='borderless'>
              Cancel
            </Button>
          </ButtonGroup>
        </SectionHeader>
        <ProfileDetailForm user={user} />
      </Card>
    );
  }

  return (
    <Card className='display--grid gap--16'>
      <SectionHeader
        title={headerTitle}
        icon={
          user.profile?.characteristics?.gender === 'MALE'
            ? 'male'
            : user.profile?.characteristics?.gender === 'FEMALE'
              ? 'female'
              : 'other'
        }
      />
      <Grid gap={32} columns={2} alignItems='start'>
        <Grid gap={32}>
          <Grid gap={4}>
            <Title size='tiny' weight='bold'>
              Identity
            </Title>
            <List ordered gap={0}>
              <ListItemData label='UUID' value={user.uuid} line />
              <ListItemData
                label='Username'
                value={user.identity?.username || '-'}
                line
              />
              <ListItemData
                label='Tag'
                value={user.identity?.tag || '-'}
                line
              />
              <ListItemData
                label='User Number'
                value={
                  user.identity?.number === undefined
                    ? '-'
                    : `#${user.identity.number}`
                }
                line
              />
              <ListItemData
                label='Created at'
                value={toDateText(user.metadata?.createdAt)}
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
                value={toText(user.profile?.description)}
                line
              />
              <ListItemData
                label='Avatar'
                value={toText(user.profile?.avatar)}
                line
              />
              <ListItemData
                label='PRO User'
                active={user.access?.isSubscribed}
                line
              />
              <ListItemData label='Fullname' value={fullName} line />
              <ListItemData
                label='Birthdate'
                line
                value={toDateText(
                  user.profile?.characteristics?.birthdate ?? undefined,
                )}
              />
              <ListItemData
                label='Gender'
                line
                value={toText(user.profile?.characteristics?.gender)}
              />
              <ListItemData
                label='Weight'
                line
                value={toText(user.profile?.characteristics?.weight)}
              />
              <ListItemData
                label='Height'
                value={toText(user.profile?.characteristics?.height)}
              />
            </List>
          </Grid>
          {updatedDate && <LastUpdated date={updatedDate} />}
        </Grid>

        <Grid gap={32}>
          <Grid gap={4}>
            <Title size='tiny' weight='bold'>
              Access and Verification
            </Title>
            <List ordered gap={0}>
              <ListItemData
                label='Verified'
                active={user.verification?.isVerified}
                line
              />
              <ListItemData
                label='Phone Number'
                value={toText(phone?.number)}
                line
              />
              <ListItemData
                label='Phone Country'
                value={toText(phone?.country)}
                line
              />
              <ListItemData
                label='Phone Verified'
                active={phone?.verified}
                line
              />
              <ListItemData
                label='Primary Phone'
                active={phone?.primary}
                line
              />
              <ListItemData
                label='Status'
                active={user.access?.isActive}
                line
              />
              <ListItemData
                label='Banned'
                active={user.access?.isBanned}
                line
              />
              <ListItemData
                label='Disabled'
                active={user.access?.isDisabled}
                line
              />
              <ListItemData
                label='Superadmin'
                active={user.access?.isAdmin}
                line
              />
              <ListItemData
                label='Accepted Terms'
                active={user.legal?.acceptedTerms}
                line
              />
              <ListItemData
                label='First-Time User'
                active={user.legal?.firstTimer}
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
                line
                value={toText(location?.continent)}
              />
              <ListItemData
                label='Localized Name'
                line
                value={toText(location?.localizedName)}
              />
              <ListItemData
                label='Country'
                line
                value={toText(location?.country)}
              />
              <ListItemData
                label='Province'
                line
                value={toText(location?.province)}
              />
              <ListItemData label='City' line value={toText(location?.city)} />
              <ListItemData
                label='Coordinates'
                value={toCoordsText(location?.coords)}
                line
              />
              <ListItemData label='Address' value={userPostalAddress} />
            </List>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}
