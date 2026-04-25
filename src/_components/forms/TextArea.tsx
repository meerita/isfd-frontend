/** @format */

import type { Ref, TextareaHTMLAttributes } from 'react';

import Label from './Label';

interface TextInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
  label?: string;
  error?: boolean;
  errors?: boolean;
  helperText?: string;
  className?: string;
}

export default function TextArea(props: Readonly<TextInputProps>) {
  const {
    ref,
    label,
    className,
    error = false,
    errors,
    helperText,
    ...inputProps
  } = props;
  const hasError = error || errors;

  return (
    <Label
      className={className}
      label={label}
      error={error}
      errors={errors}
      helperText={helperText}
    >
      <textarea
        {...inputProps}
        name={props.name}
        className={` c-input border-width--0 ${hasError ? 'color--red' : ''}`}
        ref={ref}
        placeholder={props.placeholder}
        autoFocus={props.autoFocus}
      />
    </Label>
  );
}
