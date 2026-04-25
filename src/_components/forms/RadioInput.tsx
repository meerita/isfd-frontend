/** @format
 * @File: src/_components/forms/RadioInput.tsx
 * @Purpose: Radio Input Component
 * @author: Diego Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';
import React, { InputHTMLAttributes } from 'react';
import Text from '../typography/Text';
import Icon from '../Icon';

interface RadioInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  line?: boolean;
  errors?: boolean;
  className?: string;
}

const RadioInput = React.forwardRef<HTMLInputElement, RadioInputProps>(
  function RadioInput({ label, line, ...inputProps }, ref) {
    const checked = Boolean(
      (inputProps as InputHTMLAttributes<HTMLInputElement>).checked ??
        (inputProps as InputHTMLAttributes<HTMLInputElement>).defaultChecked
    );

    return (
      <label
        className={`display--flex gap--8 align-items--center cursor--pointer ${
          line
            ? 'border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
            : ''
        }`}
      >
        <input
          {...inputProps}
          type='radio'
          ref={ref}
          className='display--none'
          hidden
        />
        <Icon
          size={24}
          name={checked ? 'radioOn' : 'radioOff'}
          fill={checked ? 'green' : 'gray'}
        />
        <Text
          size='small'
          color={checked ? 'darkGray' : 'lighterGray'}
          weight='semibold'
        >
          {label}
        </Text>
      </label>
    );
  }
);

export default RadioInput;
