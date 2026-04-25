/** @format */

// File: Breadcrumb.tsx
// Purpose: Flexible breadcrumb supporting unlimited levels
// Author: Diego M. Lafuente
// Email: diego.lafuente@cognativinc.com

import Link from 'next/link';
import Icon from '../Icon';
import Text from '../typography/Text';
import Box from './Box';
import Grid from './Grid';
import { ICON_NAME } from '@/_constants/icons';

interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string; // optional → last item is not link
}

interface BreadcrumbProps {
  readonly icon?: keyof typeof ICON_NAME;
  readonly items: BreadcrumbItem[];
  readonly border?: boolean;
}

export default function Breadcrumb({
  icon = 'account',
  items,
  border = false,
}: Readonly<BreadcrumbProps>) {
  return (
    <Grid
      display='inlineFlex'
      gap={8}
      className={`margin-bottom--16${border ? ' border-dp' : ''}`}
      alignItems='center'
    >
      {/* ICON */}
      <Icon name={icon} size={24} fill='green' />

      {/* ITEMS */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Box key={item.label} display='flex' alignItems='center' gap={8}>
            {/* Chevron except before the first label */}
            {index !== 0 && (
              <Icon name='chevronRight' size={20} fill='lightestGray' />
            )}

            {item.href && !isLast ? (
              <Link href={item.href} className='text-decoration-line--none'>
                <Text
                  size='small'
                  weight='bold'
                  color='darkerGreen'
                  className='margin--0'
                >
                  {item.label}
                </Text>
              </Link>
            ) : (
              <Text
                size='small'
                weight={isLast ? 'semibold' : 'regular'}
                color={isLast ? 'green' : 'darkGray'}
                className='margin--0'
              >
                {item.label}
              </Text>
            )}
          </Box>
        );
      })}
    </Grid>
  );
}
