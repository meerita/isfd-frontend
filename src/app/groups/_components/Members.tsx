/** @format */

// File: src/app/groups/_components/Members.tsx
// Purpose: Render the current group members list in the detail view
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import Card from '@/_components/Card';
import Dot from '@/_components/Dot';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { ICON_NAME } from '@/_constants/icons';
import NAVIGATION from '@/_constants/navigation';
import type {
  Group,
  GroupMember,
  GroupMemberCharacteristics,
} from '@/_types/group';
import buildFullName from '@/_helpers/buildFullName';

const EMPTY_VALUE = '-';
const GROUP_SECTION_TITLES = {
  superadmins: 'Superadmins',
  admins: 'Admins',
  members: 'Members',
  noobs: 'Noobs',
} as const;

function toLocalizedDate(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return EMPTY_VALUE;
  }

  return parsedDate.toLocaleDateString('es-ES');
}

function toBirthdayText(birthdate?: string): string {
  if (!birthdate) {
    return EMPTY_VALUE;
  }

  return toLocalizedDate(birthdate);
}

function toAgeText(birthdate?: string): string {
  if (!birthdate) {
    return EMPTY_VALUE;
  }

  const parsedBirthdate = new Date(birthdate);

  if (Number.isNaN(parsedBirthdate.getTime())) {
    return EMPTY_VALUE;
  }

  const currentDate = new Date();
  let age = currentDate.getFullYear() - parsedBirthdate.getFullYear();
  const monthDifference = currentDate.getMonth() - parsedBirthdate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && currentDate.getDate() < parsedBirthdate.getDate())
  ) {
    age -= 1;
  }

  if (age < 0) {
    return EMPTY_VALUE;
  }

  return `${age} years old`;
}

function toWeightText(weight?: number): string {
  if (!weight || weight <= 0) {
    return EMPTY_VALUE;
  }

  return `${weight} kg`;
}

function toHeightText(height?: number): string {
  if (!height || height <= 0) {
    return EMPTY_VALUE;
  }

  return `${(height / 100).toFixed(2)} m`;
}

function toGenderText(gender?: GroupMemberCharacteristics['gender']): string {
  if (!gender) {
    return EMPTY_VALUE;
  }

  return gender.charAt(0) + gender.slice(1).toLowerCase();
}

function getMemberSectionKey(
  member: GroupMember,
): keyof typeof GROUP_SECTION_TITLES {
  if (member.role === 'SUPERADMIN') {
    return 'superadmins';
  }

  if (member.role === 'ADMIN') {
    return 'admins';
  }

  if (member.stage === 'NOOB') {
    return 'noobs';
  }

  return 'members';
}

function getMemberIcon(member: GroupMember): keyof typeof ICON_NAME {
  if (member.characteristics?.gender === 'MALE') {
    return 'male';
  }

  if (member.characteristics?.gender === 'FEMALE') {
    return 'female';
  }

  if (member.characteristics?.gender === 'OTHER') {
    return 'other';
  }

  return 'user';
}

function buildGroupedMembers(
  members: ReadonlyArray<GroupMember>,
): Readonly<
  Record<keyof typeof GROUP_SECTION_TITLES, ReadonlyArray<GroupMember>>
> {
  return members.reduce<
    Record<keyof typeof GROUP_SECTION_TITLES, Array<GroupMember>>
  >(
    function groupMembers(accumulator, member) {
      const sectionKey = getMemberSectionKey(member);

      accumulator[sectionKey].push(member);

      return accumulator;
    },
    {
      superadmins: [],
      admins: [],
      members: [],
      noobs: [],
    },
  );
}

function renderMemberList(
  title: string,
  members: ReadonlyArray<GroupMember>,
): React.ReactNode {
  if (members.length === 0) {
    return null;
  }

  return (
    <Grid gap={8}>
      <Title size='tiny' weight='bold'>
        {title}
      </Title>
      <Table>
        <Thead>
          <Row>
            <Cell header>Member</Cell>
            <Cell header>Tag</Cell>
            <Cell header>Name</Cell>
            <Cell header>Age</Cell>
            <Cell header>Gender</Cell>
            <Cell header>Weight</Cell>
            <Cell header>Height</Cell>
            <Cell header>Birthday</Cell>
            <Cell header align='center'>
              Active
            </Cell>
            <Cell header align='center'>
              Noob?
            </Cell>
            <Cell header align='right'>
              Joined
            </Cell>
          </Row>
        </Thead>
        <Tbody>
          {members.map(function renderMember(member) {
            return (
              <Row
                href={NAVIGATION.USER_BY_USERNAME(member.identity.username)}
                key={member.id}
              >
                <Cell icon={getMemberIcon(member)}>
                  {member.identity.username}
                </Cell>
                <Cell>{member.identity.tag || EMPTY_VALUE}</Cell>
                <Cell>{buildFullName(member.profile)}</Cell>
                <Cell>{toAgeText(member.characteristics?.birthdate)}</Cell>
                <Cell>{toGenderText(member.characteristics?.gender)}</Cell>
                <Cell>{toWeightText(member.characteristics?.weight)}</Cell>
                <Cell>{toHeightText(member.characteristics?.height)}</Cell>
                <Cell>{toBirthdayText(member.characteristics?.birthdate)}</Cell>
                <Cell align='center'>
                  {member.status === 'ACTIVE' ? (
                    <Dot active inline />
                  ) : (
                    <Dot inline />
                  )}
                </Cell>
                <Cell align='center'>
                  {member.stage === 'NOOB' ? (
                    <Dot active inline />
                  ) : (
                    <Dot inline />
                  )}
                </Cell>
                <Cell align='right'>{toLocalizedDate(member.createdAt)}</Cell>
              </Row>
            );
          })}
        </Tbody>
      </Table>
    </Grid>
  );
}

export default function Members({ group }: Readonly<{ group: Group }>) {
  const members = group.members ?? [];
  const groupedMembers = buildGroupedMembers(members);

  return (
    <Card>
      <Grid gap={16}>
        <SectionHeader title='Members' icon='participants'>
          <Text color='gray' size='small'>
            {`${members.length} member${members.length === 1 ? '' : 's'}`}
          </Text>
        </SectionHeader>

        {members.length === 0 ? (
          <Text color='gray'>No members available for this group yet.</Text>
        ) : (
          <Grid gap={16}>
            {renderMemberList(
              GROUP_SECTION_TITLES.superadmins,
              groupedMembers.superadmins,
            )}
            {renderMemberList(
              GROUP_SECTION_TITLES.admins,
              groupedMembers.admins,
            )}
            {renderMemberList(
              GROUP_SECTION_TITLES.members,
              groupedMembers.members,
            )}
            {renderMemberList(GROUP_SECTION_TITLES.noobs, groupedMembers.noobs)}
          </Grid>
        )}
      </Grid>
    </Card>
  );
}
