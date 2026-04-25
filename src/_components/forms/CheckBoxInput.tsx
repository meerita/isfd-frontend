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
  const { label, line, ...inputProps } = props;
  const [checked, setChecked] = useState(inputProps.defaultChecked ?? false);

  // function to handle checkbox change event and pass it to parent component if provided.
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setChecked(event.target.checked);
    if (inputProps.onChange) inputProps.onChange(event);
  }

  return (
    <label
      className={`padding-block--4 display--flex gap--8 align-items--center cursor--pointer ${
        line
          ? 'border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
          : ''
      }`}
    >
      <input
        {...inputProps}
        type='checkbox'
        ref={ref}
        className='hidden'
        onChange={handleChange}
        hidden
      />
      <Icon
        size={24}
        name={checked ? 'checkboxOn' : 'checkboxOff'}
        fill={checked ? 'green' : 'lighterGray'}
      />
      <Text
        size='small'
        weight='semibold'
        lineHeight='noLineHeight'
        className={`${checked ? 'color--black' : 'color--gray'}`}
      >
        {label}
      </Text>
    </label>
  );
}

CheckBoxInput.displayName = 'CheckBoxInput';

export default forwardRef(CheckBoxInput);
