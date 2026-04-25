/** @format */

import React from 'react';
import {
  DISPLAY_TYPES,
  GAPS,
  PADDING_VALUES,
  MARGIN_VALUES,
} from '@/_constants/box';

type NativeFormProps = React.FormHTMLAttributes<HTMLFormElement>;
type ServerAction = (formData: FormData) => void | Promise<void>;

export interface FormProps extends Omit<NativeFormProps, 'action'> {
  children: React.ReactNode;
  display?: keyof typeof DISPLAY_TYPES;
  gap?: keyof typeof GAPS;
  padding?: keyof typeof PADDING_VALUES;
  margin?: keyof typeof MARGIN_VALUES;
  className?: string;
  action?: string | ServerAction;
}

export default function Form({
  children,
  action,
  onSubmit,
  method,
  display = 'grid',
  gap = 16,
  padding,
  margin,
  className = '',
  ...rest
}: Readonly<FormProps>) {
  const classList: string[] = [DISPLAY_TYPES[display], GAPS[gap]];

  if (padding !== undefined) {
    classList.push(PADDING_VALUES[padding]);
  }

  if (margin !== undefined) {
    classList.push(MARGIN_VALUES[margin]);
  }

  if (className) {
    classList.push(className);
  }

  const composedClassName = classList.filter(Boolean).join(' ');

  return (
    <form
      action={action}
      onSubmit={onSubmit}
      method={method}
      className={composedClassName}
      {...rest}
    >
      {children}
    </form>
  );
}
