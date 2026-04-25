/** @format */

'use client';

import Icon from '../Icon';
import { useId, useState, type ChangeEvent } from 'react';
import Text from '../typography/Text';
import Grid from '../layout/Grid';
import Title from '../typography/Title';

type Props = Readonly<{
  name?: string;
  label: string;
  description: string;
  icon?: string;
  line?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (checked: boolean) => void;
}>;

export default function DoubleLineIconCheckbox({
  name,
  label,
  description,
  icon = 'device',
  line = false,
  checked,
  defaultChecked = false,
  className = '',
  onChange,
  onCheckedChange,
}: Props) {
  const generatedId = useId();
  const inputId = name && name.trim().length > 0 ? name : generatedId;
  const isControlled = typeof checked === 'boolean';
  const [uncontrolledChecked, setUncontrolledChecked] =
    useState<boolean>(defaultChecked);
  const isChecked = isControlled ? checked : uncontrolledChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextChecked = event.target.checked;

    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }

    onCheckedChange?.(nextChecked);
    onChange?.(event);
  };

  return (
    <label
      htmlFor={inputId}
      className={`cursor--pointer padding-block--16 display--flex gap--16 align-items--center ${
        line
          ? 'border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
          : ''
      } ${className}`}
    >
      <input
        id={inputId}
        type='checkbox'
        name={name}
        checked={isChecked}
        onChange={handleChange}
        className='display--none'
      />
      <Icon name={icon} fill='black' size={24} />
      <Grid className='flex-grow--1' gap={4}>
        <Title color='black' size='xsmall' weight='bold'>
          {label}
        </Title>
        <Text size='tiny' color='gray' className='margin--0'>
          {description}
        </Text>
      </Grid>
      <div>
        {isChecked ? (
          <Icon name='checkboxOn' size={24} fill='black' />
        ) : (
          <Icon name='checkboxOff' fill='lighterGray' size={24} />
        )}
      </div>
    </label>
  );
}
