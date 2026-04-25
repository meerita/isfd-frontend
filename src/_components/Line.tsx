/** @format */

export default function Line(
  props: Readonly<{
    className?: string;
    margin?: string;
  }>
) {
  const baseStyles = [
    props.margin ? `margin-block--${props.margin}` : 'margin--0',
    'display--block',
    'border-top-width--1',
    'border-bottom-width--0',
    'border-left-width--0',
    'border-right-width--0',
    'border-top-style--solid',
    'border-top-color--lightest-gray',
  ];

  return <hr className={baseStyles.join(' ')} />;
}
