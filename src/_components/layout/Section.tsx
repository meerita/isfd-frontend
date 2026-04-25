/** @format */
import type { JSX } from 'react';
import { GAPS, PADDING_VALUES, MARGIN_VALUES } from '@/_constants/box';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  gap?: keyof typeof GAPS;
  padding?: keyof typeof PADDING_VALUES;
  margin?: keyof typeof MARGIN_VALUES;
  className?: string;
  aside?: boolean;
  article?: boolean;
  border?: boolean;
}

export default function Section({
  children,
  gap = 16,
  padding,
  margin,
  className = '',
  aside = false,
  article = false,
  border = false,
  ...rest
}: Readonly<SectionProps>) {
  const Component: keyof JSX.IntrinsicElements = aside
    ? 'aside'
    : article
    ? 'article'
    : 'section';

  const classList = [
    'display--grid',
    'align-items--start',
    GAPS[gap],
    padding && PADDING_VALUES[padding],
    margin && MARGIN_VALUES[margin],
    border && 'border-dp',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classList} {...rest}>
      {children}
    </Component>
  );
}
