/** @format */

import Card from '@/_components/Card';
import SectionHeader from '@/_components/layout/SectionHeader';
import type { Sport } from '@/_types/sport';
import type { User } from '@/_types/user';
import SkillsForm from './forms/Skills';

export default function Skills({
  user,
  sports,
}: Readonly<{
  user: User;
  sports: ReadonlyArray<Sport>;
}>) {
  return (
    <Card className='display--grid gap--16'>
      <SectionHeader title='Skills' icon='skills' />
      <SkillsForm user={user} sports={sports} />
    </Card>
  );
}
