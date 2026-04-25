/** @format */

import Cell from './Cell';
import Row from './Row';

export default function DataRow(
  props: Readonly<{
    label: string;
    value: string | number | React.ReactNode;
    monospace?: boolean;
    url?: string;
  }>
) {
  return (
    <Row
      href={props.url && props.url}
      className={`${props.url ? 'cursor--pointer' : ''}`}
    >
      <Cell header>{props.label}</Cell>
      <Cell
        align='right'
        className={`color--gray ${props.monospace && 'font-family--monospace'}`}
      >
        {props.value}
      </Cell>
    </Row>
  );
}
