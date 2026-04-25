/** @format */

import Icon from '../Icon';
import Cell from './Cell';
import Row from './Row';

export default function DataCheckbox(
  props: Readonly<{
    label: string;
    checked: boolean;
  }>
) {
  return (
    <Row>
      <Cell
        header
        className={`${props.checked ? 'color--black' : 'color--gray'}`}
      >
        {props.label}
      </Cell>
      <Cell align='right'>
        <Icon size={24} name={props.checked ? 'checkboxOn' : 'checkboxOff'} />
      </Cell>
    </Row>
  );
}
