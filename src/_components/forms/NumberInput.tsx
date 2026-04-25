/** @format */

import type { InputHTMLAttributes, Ref } from 'react';

import Label from './Label';

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  label?: string;
  errors?: boolean;
  className?: string;
  line?: boolean;
}

export default function NumberInput(props: Readonly<NumberInputProps>) {
  const {
    ref,
    label,
    className = 'width--100 display--inline-block',
    errors,
    ...inputProps
  } = props;

  return (
    <Label className={className} label={label} errors={errors}>
      <input
        {...inputProps}
        ref={ref}
        name={inputProps.name}
        placeholder={inputProps.placeholder}
        autoFocus={inputProps.autoFocus}
        type={inputProps.type ?? 'text'}
        hidden={inputProps.hidden}
        data-1p-ignore
        className={`c-smallbutton c-input ${className}`}
      />
    </Label>
  );
}
