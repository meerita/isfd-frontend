/** @format */

'use client';

import Link from 'next/link';

import { ICON_NAME } from '@/_constants/icons';
import { MARGIN_VALUES } from '@/_constants/box';

import Icon from '../Icon';
import Nav from '../navigation/Nav';
import Title from '../typography/Title';
import Box from './Box';
import Grid from './Grid';
import Header from './Header';

/**
 * Cada item representa un paso del breadcrumb.
 * - Si tiene href → se renderiza como link
 * - Si no → se renderiza como texto (último nodo normalmente)
 */
export type NavigationItem = {
  label: string;
  href?: string;
};

type SectionHeaderProps = Readonly<{
  children?: React.ReactNode;

  /**
   * Fallback si NO se pasa navigation
   */
  title?: string;

  /**
   * Breadcrumb explícito
   */
  navigation?: NavigationItem[];

  iconPosition?: 'left' | 'right';
  margin?: keyof typeof MARGIN_VALUES;
  className?: string;
  icon?: keyof typeof ICON_NAME;
  border?: boolean;

  /**
   * Separador entre items
   */
  separator?: React.ReactNode;
}>;

export default function SectionHeader({
  children,
  title,
  navigation,
  icon,
  margin = 0,
  iconPosition = 'left',
  className,
  border = false,
  separator = '/',
}: SectionHeaderProps) {
  const hasNavigation = navigation && navigation.length > 0;

  return (
    <Header
      className={`${MARGIN_VALUES[margin]} ${className || ''}${
        border ? ' border-dp' : ''
      }`}
    >
      <Grid columns={2} gap={8} alignItems='center'>
        {/* LEFT */}
        <Grid>
          <Box
            display='flex'
            gap={8}
            alignItems='center'
            flexDirection={iconPosition === 'left' ? 'row' : 'rowReverse'}
            className='justify-self--start grid-column--3'
          >
            {icon && <Icon name={icon} size={24} display='block' fill='gray' />}

            {/* BREADCRUMB o TITLE */}
            {hasNavigation ? (
              <Box display='flex' gap={4} alignItems='center'>
                {navigation.map((item, index) => {
                  const isLast = index === navigation.length - 1;

                  return (
                    <Box
                      key={`${item.label}-${index}`}
                      display='flex'
                      gap={4}
                      alignItems='center'
                    >
                      {item.href && !isLast ? (
                        <Link href={item.href}>
                          <Title size='small' color='black' weight='bold'>
                            {item.label}
                          </Title>
                        </Link>
                      ) : (
                        <Title
                          size='small'
                          color='black'
                          weight='bold'
                          aria-current={isLast ? 'page' : undefined}
                        >
                          {item.label}
                        </Title>
                      )}

                      {!isLast && <span>{separator}</span>}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              title && (
                <Title size='small' color='black' weight='bold'>
                  {title}
                </Title>
              )
            )}
          </Box>
        </Grid>

        {/* RIGHT */}
        <Grid>
          {children && <Nav className='justify-self--end'>{children}</Nav>}
        </Grid>
      </Grid>
    </Header>
  );
}
