/** @format */

'use client';

import { useId, useState } from 'react';

import Text from './typography/Text';
import type { FontWeight, TextSize } from '@/_constants/typography';

function maskValue(value: string): string {
  return '•'.repeat(Math.max(8, Math.min(value.length, 16)));
}

export default function SensitiveValue({
  value,
  placeholder = '--',
  size = 'small',
  weight = 'bold',
  inline = true,
  className = '',
}: Readonly<{
  value?: string | null;
  placeholder?: string;
  size?: TextSize;
  weight?: FontWeight;
  inline?: boolean;
  className?: string;
}>): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const descriptionId = useId();
  const normalizedValue = value?.trim() ?? '';

  if (!normalizedValue) {
    return (
      <Text inline={inline} size={size} weight={weight} className={className}>
        {placeholder}
      </Text>
    );
  }

  return (
    <button
      type='button'
      aria-pressed={isVisible}
      aria-describedby={descriptionId}
      aria-label={isVisible ? 'Hide sensitive value' : 'Show sensitive value'}
      title={isVisible ? 'Hide sensitive value' : 'Show sensitive value'}
      onClick={function handleToggleVisibility(): void {
        setIsVisible(previousState => !previousState);
      }}
      className='background-color--transparent border-width--0  text-align--left padding--0 cursor--pointer display--inline-flex align-items--center flex-wrap--wrap outline--none'
    >
      <Text
        id={descriptionId}
        inline={inline}
        size={size}
        weight={weight}
        className={`font-family--monospace word-break--break-all${className}`}
      >
        {isVisible ? normalizedValue : maskValue(normalizedValue)}
      </Text>
    </button>
  );
}
