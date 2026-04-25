/** @format */

import MetricSystem from '@/_types/MetricSystem';

const DIMENSIONS: ReadonlyArray<{
  label: string;
  value: MetricSystem;
}> = [
  { label: 'Metric (cm)', value: 'METRIC' },
  { label: 'Imperial (inches)', value: 'IMPERIAL' },
];

export default DIMENSIONS;
