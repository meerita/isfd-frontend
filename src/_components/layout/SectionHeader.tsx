/** @format */

import { ICON_NAME } from '@/_constants/icons';
import { MARGIN_VALUES } from '@/_constants/box';
import Icon from '../Icon';
import Nav from '../navigation/Nav';
import Title from '../typography/Title';
import Box from './Box';
import Grid from './Grid';
import Header from './Header';

export default function SectionHeader({
  children,
  title,
  icon,
  margin = 0,
  iconPosition = 'left',
  className,
  border = false,
}: Readonly<{
  children?: React.ReactNode;
  title: string;
  iconPosition?: 'left' | 'right';
  margin?: keyof typeof MARGIN_VALUES;
  className?: string;
  icon?: keyof typeof ICON_NAME;
  border?: boolean;
}>) {
  return (
    <Header
      className={`${MARGIN_VALUES[margin]} ${className || ''}${
        border ? ' border-dp' : ''
      }`}
    >
      <Grid columns={2} gap={8} alignItems='center'>
        <Grid>
          <Box
            display='flex'
            gap={8}
            alignItems='center'
            flexDirection={iconPosition === 'left' ? 'row' : 'rowReverse'}
            className='justify-self--start grid-column--3'
          >
            {icon && <Icon name={icon} size={24} display='block' fill='gray' />}
            <Title size='small' color='black' weight='bold'>
              {title}
            </Title>
          </Box>
        </Grid>
        <Grid>
          {children && <Nav className='justify-self--end'>{children}</Nav>}
        </Grid>
      </Grid>
    </Header>
  );
}
