/** @format */

import type { InputHTMLAttributes, Ref } from 'react';

import Label from './Label';

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  label?: string;
  error?: boolean;
  errors?: boolean;
  helperText?: string;
  className?: string;
  line?: boolean;
}

export default function NumberInput(props: Readonly<NumberInputProps>) {
  const {
    ref,
    label,
    className = 'width--100 display--inline-block',
    error = false,
    errors,
    helperText,
    ...inputProps
  } = props;

  return (
    <Label
      className={className}
      label={label}
      error={error}
      errors={errors}
      helperText={helperText}
    >
      <input
        {...inputProps}
        ref={ref}
        name={inputProps.name}
        placeholder={inputProps.placeholder}
        autoFocus={inputProps.autoFocus}
        type={inputProps.type ?? 'text'}
        hidden={inputProps.hidden}
        data-1p-ignore
        className={`c-smallbutton c-input ${error || errors ? 'color--red' : ''} ${className}`}
      />
    </Label>
  );
}
