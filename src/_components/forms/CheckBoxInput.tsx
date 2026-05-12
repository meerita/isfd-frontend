/** @format */

'use client';

import React, { useState, forwardRef, InputHTMLAttributes } from 'react';

import Icon from '../Icon';
import Text from '../typography/Text';

interface CheckBoxInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  line?: boolean;
  errors?: boolean;
  className?: string;
}

function CheckBoxInput(
  props: Readonly<CheckBoxInputProps>,
  ref: React.Ref<HTMLInputElement>,
) {
  const { label, line, checked, defaultChecked, onChange, ...inputProps } = props;
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const resolvedChecked = isControlled ? checked : internalChecked;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) {
      setInternalChecked(event.target.checked);
    }

    onChange?.(event);
  }

  return (
    <label
      className={`padding-block--4 display--flex gap--8 align-items--center cursor--pointer ${
        line
          ? 'border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
          : ""
      }`}
    >
      <input
        {...inputProps}
        type='checkbox'
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        className='hidden'
        onChange={handleChange}
        hidden
      />
      <Icon
        size={24}
        name={resolvedChecked ? 'checkboxOn' : 'checkboxOff'}
        fill={resolvedChecked ? 'green' : 'lighterGray'}
      />
      <Text
        size='small'
        weight='semibold'
        lineHeight='noLineHeight'
        className={`${resolvedChecked ? 'color--black' : 'color--gray'}`}
      >
        {label}
      </Text>
    </label>
  );
}

CheckBoxInput.displayName = 'CheckBoxInput';

export default forwardRef(CheckBoxInput);
