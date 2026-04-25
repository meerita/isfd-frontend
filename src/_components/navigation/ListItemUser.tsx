/** @format */

import Link from 'next/link';
import Text from '../typography/Text';
import ShortUserProfile from '@/_types/ShortUserProfile';
import Avatar from '../Avatar';
import Box from '../layout/Box';

export default function ListItemUser({
  href,
  userData,
  info,
  line = false,
  ...rest
}: Readonly<{
  href: string;
  userData: ShortUserProfile;
  active?: boolean;
  info?: string;
  line: boolean;
}>) {
  const listStyles = [
    'list-style-type--none',
    'font-size--14',
    'text-decoration-line--none',
    'padding-block--8',
    'display--flex',
    'gap--16',
    'align-items--center',
    line && 'border-bottom-width--1',
    line && 'border-bottom-style--dotted',
    line && 'border-bottom-color--lightest-gray',
  ];

  return (
    <li {...rest}>
      <Link href={href} className={listStyles.join(' ')}>
        <Avatar uri={userData.avatar} alt={userData.username} />
        <Box display='grid' className='flex-grow--1'>
          <Text weight='bold'>{userData.username}</Text>
          <Text color='gray' size='small'>
            {userData.tag ? userData.tag : ''}
          </Text>
        </Box>
        <span>
          <span className='color--gray'>{info}</span>
        </span>
      </Link>
    </li>
  );
}
