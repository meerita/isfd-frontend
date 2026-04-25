/** @format */

import type { Ref, SelectHTMLAttributes } from 'react';

import Label from './Label';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
  label?: string; // Made label optional
  error?: boolean;
  errors?: boolean;
  helperText?: string;
  line?: boolean;
  children: React.ReactNode;
  className?: string; // Added className support for Label
  placeholder?: string; // Added placeholder support
}

export default function Select(props: Readonly<SelectProps>) {
  const {
    ref,
    label,
    className,
    children,
    placeholder,
    error = false,
    errors,
    helperText,
    ...inputProps
  } = props;
  const hasError = error || errors;

  return (
    <Label
      label={label}
      className={className}
      error={error}
      errors={errors}
      helperText={helperText}
    >
      <select
        {...inputProps}
        ref={ref}
        className={`c-smallbutton c-input c-select ${hasError ? 'color--red' : ''}`}
      >
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    </Label>
  );
}
