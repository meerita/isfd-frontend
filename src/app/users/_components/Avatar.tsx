/** @format */

import Card from '@/_components/Card';
import Section from '@/_components/layout/Section';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { User } from '@/_types/user';
import Image from 'next/image';

export default function Avatar({ user }: Readonly<{ user: User }>) {
  return (
    <Card className='display--grid gap--32'>
      <SectionHeader title='Avatar management' icon='avatar' />

      <div className='display--grid gap--32 template-columns--2 align-items--start'>
        <div className='display--grid gap--16'>
          <Section>
            <Text color='gray'>
              You can update your avatar here. The image should be square and at
              least 200x200 pixels. We support JPG, PNG, and GIF formats.
            </Text>
            <form action=''>
              <label>
                Avatar{' '}
                <input
                  type='file'
                  name='avatar'
                  accept='image/jpeg, image/png, image/gif'
                  required
                />
              </label>
              <button type='submit' className='btn btn--primary'>
                Update Avatar
              </button>
            </form>
          </Section>
        </div>
        <div className='display--grid gap--16'>
          <Section>
            {user.profile?.avatar ? (
              <>
                <Title size='small'>Your avatar</Title>
                <Image
                  src={user.profile.avatar}
                  alt={
                    user.identity?.username
                      ? `${user.identity.username}'s avatar`
                      : 'User avatar'
                  }
                  width={200}
                  height={200}
                  style={{ width: '100%', height: 'auto' }}
                  className='border-radius--5'
                />
              </>
            ) : (
              <Text className='margin--0 color--gray'>
                No avatar uploaded yet.
              </Text>
            )}
          </Section>
        </div>
      </div>
    </Card>
  );
}
