/** @format */

export const BOX_SHADOWS_COLORS = {
  transparent: 'box-shadow--transparent',
  black: 'box-shadow--black',
  darkestGray: 'box-shadow--darkest-gray',
  darkGray: 'box-shadow--dark-gray',
  gray: 'box-shadow--gray',
  lightGray: 'box-shadow--light-gray',
  lighterGray: 'box-shadow--lighter-gray',
  lightestGray: 'box-shadow--lightest-gray',
  almostWhite: 'box-shadow--almost-white',
  white: 'box-shadow--white',

  darkestGreen: 'box-shadow--darkest-green',
  darkerGreen: 'box-shadow--darker-green',
  green: 'box-shadow--green',
  lighterGreen: 'box-shadow--lighter-green',
  lightestGreen: 'box-shadow--lightest-green',
  almostWhiteGreen: 'box-shadow--almost-white-green',

  darkestBrown: 'box-shadow--darkest-brown',
  darkerBrown: 'box-shadow--darker-brown',
  brown: 'box-shadow--brown',
  lighterBrown: 'box-shadow--lighter-brown',
  lightestBrown: 'box-shadow--lightest-brown',
  almostWhiteBrown: 'box-shadow--almost-white-brown',
};

export type ButtonVariant = 'solid' | 'borderless';

export type ButtonKind = 'primary' | 'secondary' | 'normal';

export type boxShadowColor =
  (typeof BOX_SHADOWS_COLORS)[keyof typeof BOX_SHADOWS_COLORS];
