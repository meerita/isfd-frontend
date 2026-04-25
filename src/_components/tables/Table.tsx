/** @format */

import React from 'react';

export default function Table(
  props: Readonly<{
    children: React.ReactNode;
    className?: string;
  }>
) {
  return (
    <table
      className={`width--100 border-collapse--collapse ${props.className}`}
      role='table'
    >
      {props.children}
    </table>
  );
}
