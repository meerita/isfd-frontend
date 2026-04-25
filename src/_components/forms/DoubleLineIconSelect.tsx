/** @format */
'use client';
import Icon from '../Icon';
import Grid from '../layout/Grid';
import Text from '../typography/Text';
import Title from '../typography/Title';

export default function DoubleLineIconSelect<
  T extends { value: string; label: string },
>({
  label,
  description,
  line = false,
  data = [],
  icon = 'device',
  value,
  onChange,
  name,
  className = '',
  id,
}: Readonly<{
  line?: boolean;
  label: string;
  icon: string;
  data?: readonly T[];
  description: string;
  value: string;
  name?: string;
  className?: string;
  id?: string;
  onChange?: (value: string) => void;
}>) {
  return (
    <Grid
      display='flex'
      alignItems='center'
      gap={16}
      className={`padding-block--16 ${
        line
          ? 'border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
          : ''
      } ${className}`}
    >
      <Icon name={icon} fill='black' size={24} />
      <Grid className='flex-grow--1' gap={2}>
        <Title size='xsmall' weight='bold' color='black'>
          {label}
        </Title>
        <Text size='tiny' color='gray' className='margin--0'>
          {description}
        </Text>
      </Grid>
      <div>
        <select
          name={name}
          id={id}
          className='direction--rtl border-width--0 font-size--14 color--lighter-gray cursor--pointer outline-style--none:focus'
          value={value}
          onChange={e => onChange?.(e.target.value)}
        >
          {data?.map(item => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </Grid>
  );
}
