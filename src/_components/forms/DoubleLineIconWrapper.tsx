/** @format */

'use client';
import Icon from '../Icon';
import React from 'react';
import Text from '../typography/Text';
import Grid from '../layout/Grid';
import Title from '../typography/Title';
import Box from '../layout/Box';

type Props = {
  label: string;
  description: string;
  icon?: string;
  line?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function DoubleLineIconWrapper({
  label,
  description,
  icon = 'device',
  line = false,
  className = '',
  children,
}: Readonly<Props>) {
  return (
    <div
      className={`cursor--pointer padding-block--16 display--flex gap--16 align-items--center ${
        line
          ? 'border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
          : ''
      } ${className}`}
    >
      <Icon name={icon} fill='green' size={28} />
      <Grid className='flex-grow--2' gap={4}>
        <Title color='darkerGreen' size='xsmall' weight='bold'>
          {label}
        </Title>
        <Text size='small' color='gray' className='margin--0'>
          {description}
        </Text>
      </Grid>
      {children && <Box>{children}</Box>}
    </div>
  );
}
