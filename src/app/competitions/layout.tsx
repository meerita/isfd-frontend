/** @format */

import Grid from '@/_components/layout/Grid';
import SubBar from '@/_components/layout/SubBar';
import TopBar from '@/_components/layout/TopBar';
import NAVIGATION from '@/_constants/navigation';
import { getDictionary } from '@/_i18n/getDictionary';
import { resolveRequestLocale } from '@/_i18n/resolveRequestLocale';

export default async function CompetitionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <>
      <TopBar username='Diego' />
      <SubBar
        items={[
          {
            href: NAVIGATION.COMPETITIONS,
            label: dictionary.competitions.sidebar.overview,
          },
          {
            href: NAVIGATION.COMPETITION_TYPES,
            label: dictionary.competitions.sidebar.types,
          },
          {
            href: NAVIGATION.COMPETITIONS_LIST,
            label: dictionary.competitions.sidebar.competitions,
          },
          {
            href: NAVIGATION.COMPETITION_PYRAMIDS,
            label: dictionary.competitions.sidebar.pyramids,
          },
          {
            href: NAVIGATION.COMPETITION_TIERS,
            label: dictionary.competitions.sidebar.tiers,
          },
          {
            href: NAVIGATION.COMPETITION_EDITIONS,
            label: dictionary.competitions.sidebar.editions,
          },
        ]}
      />
      <Grid padding={32} justifyItems='center'>
        <Grid gap={16} className='width--100 max-width--75'>
          {children}
        </Grid>
      </Grid>
    </>
  );
}
