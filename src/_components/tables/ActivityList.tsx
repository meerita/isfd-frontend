/** @format */

import Activity from '@/_types/Activity';
import Section from '../layout/Section';
import Thead from './Thead';
import Table from './Table';
import Row from './Row';
import Cell from './Cell';
import Tbody from './Tbody';
import NAVIGATION from '@/_constants/navigation';
import Link from 'next/link';
import Avatar from '../Avatar';
import Dot from '../Dot';
import Text from '../typography/Text';

export default function ActivityList({
  activities,
}: Readonly<{
  activities: Activity[];
}>) {
  return (
    <Section className='display--grid gap--32'>
      {activities.length > 0 ? (
        <Table>
          <Thead>
            <Row>
              <Cell header>Issuer</Cell>
              <Cell header>Method</Cell>
              <Cell header>Action</Cell>
              <Cell header align='center'>
                Admin
              </Cell>
              <Cell header align='right'>
                Time
              </Cell>
              <Cell header align='right'>
                Date
              </Cell>
            </Row>
          </Thead>
          <Tbody>
            {activities.map((activity: Activity) => (
              <Row
                key={activity.uuid}
                href={NAVIGATION.ACTIVITY_BY_UUID(activity.uuid)}
              >
                <Cell>
                  <Link
                    href={NAVIGATION.USER_BY_UUID(activity.issuer.uuid)}
                    className='display--flex gap--16 align-items--center text-decoration-line--none color--black'
                  >
                    <Avatar
                      uri={activity.issuer.avatar}
                      alt={activity.issuer.username}
                    />
                    <span className='display--grid gap--0 flex-grow--1'>
                      <Text size='medium' className='margin--0'>
                        {activity.issuer.username}
                      </Text>
                      <Text size='small' className='margin--0 color--gray'>
                        {activity.issuer.tag ? activity.issuer.tag : 'Noob'}
                      </Text>
                    </span>
                  </Link>
                </Cell>
                <Cell>{activity.method}</Cell>
                <Cell>{activity.action}</Cell>
                <Cell align='center'>
                  {activity.admin ? <Dot active inline /> : <Dot inline />}
                </Cell>
                <Cell align='right'>
                  {new Date(activity.createdAt).toLocaleTimeString('es')}
                </Cell>
                <Cell align='right'>
                  {new Date(activity.createdAt).toLocaleDateString('es')}
                </Cell>
              </Row>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text size='medium' className='color--gray'>
          No events found.
        </Text>
      )}
    </Section>
  );
}
