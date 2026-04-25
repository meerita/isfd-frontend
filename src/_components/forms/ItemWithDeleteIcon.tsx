/** @format */

'use client';
import Icon from '../Icon';
import Text from '../typography/Text';

export default function ItemWithRemoveIcon({
  label,
  onRemove,
}: Readonly<{
  label: string;
  onRemove: () => void;
}>) {
  return (
    <li className='display--flex gap--8 border-bottom-width--1 border-bottom-style--solid border-bottom-color--almost-white padding-block--12'>
      <Text className='flex-grow--1 margin--0'>{label}</Text>
      <div>
        <button
          type='button'
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className='margin--0 padding--0 border-width--0 background-color--transparent cursor--pointer display--block'
        >
          <Icon name='delete' size={24} className='display--block' />
        </button>
      </div>
    </li>
  );
}
