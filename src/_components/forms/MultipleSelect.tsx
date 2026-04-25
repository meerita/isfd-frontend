/** @format */

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import Text from '../typography/Text';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  errors?: boolean;
  line?: boolean;
  children: React.ReactNode;
}

function MultipleSelect(
  props: Readonly<SelectProps>,
  ref: React.Ref<HTMLSelectElement>
) {
  const {
    label,
    value,
    line = false,
    autoFocus,
    children,
    errors,
    name,
  } = props;

  return (
    <label
      className={`display--grid gap--16 ${
        line
          ? 'border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
          : ''
      }`}
    >
      <Text className='margin--0 font-weight--500 white-space--nowrap'>
        {label}
      </Text>
      <select
        name={name}
        className={`${
          errors ? 'color--red' : ''
        } overflow-y--auto text-transform--capitalize border-width--0`}
        ref={ref}
        autoFocus={autoFocus}
        defaultValue={value}
        multiple
      >
        {children}
      </select>
    </label>
  );
}

MultipleSelect.displayName = 'Select';

export default forwardRef(MultipleSelect);
