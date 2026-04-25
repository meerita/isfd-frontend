/** @format */

// TEXT SIZES
export const TEXT_SIZES = {
  large: 'font-size--24',
  medium: 'font-size--16',
  small: 'font-size--14',
  tiny: 'font-size--12',
  xlarge: 'font-size--32 letter-spacing--0',
  xxlarge: 'font-size--48 letter-spacing--0',
  xxxlarge: 'font-size--64 letter-spacing--0',
} as const;

// TITLE SIZES
export const TITLE_SIZES = {
  large: 'font-size--48 letter-spacing--0',
  medium: 'font-size--32 letter-spacing--0',
  small: 'font-size--20 letter-spacing--0',
  normal: 'font-size--24 letter-spacing--0',
  tiny: 'font-size--16 letter-spacing--0',
  xsmall: 'font-size--14 letter-spacing--0',
  xlarge: 'font-size--64 letter-spacing--0',
  xxlarge: 'font-size--72 letter-spacing--0',
  xxxlarge: 'font-size--96 letter-spacing--0',
} as const;

// FONT WEIGHTS
export const FONT_WEIGHTS = {
  bold: 'font-weight--600',
  extraHeavy: 'font-weight--800',
  heavy: 'font-weight--700',
  inherit: 'font-weight--inherit',
  light: 'font-weight--200',
  medium: 'font-weight--400',
  normal: 'font-weight--normal',
  regular: 'font-weight--300',
  semibold: 'font-weight--500',
  ultraHeavy: 'font-weight--900',
  ultraLight: 'font-weight--100',
} as const;

// LINE HEIGHTS
export const LINE_HEIGHTS = {
  noLineHeight: 'line-height--0',
  normal: 'line-height--130',
  relaxed: 'line-height--150',
  tight: 'line-height--100',
} as const;

// TEXT COLORS
export const TEXT_COLORS = {
  almostWhite: 'color--almost-white',
  almostWhiteBrown: 'color--almost-white-brown',
  almostWhiteGreen: 'color--almost-white-green',
  black: 'color--black',
  darkestBlue: 'color--darkest-blue',
  darkerBlue: 'color--darker-blue',
  darkBlue: 'color--dark-blue',
  blue: 'color--blue',
  lighterBlue: 'color--lighter-blue',
  lightestBlue: 'color--lightest-blue',
  brown: 'color--brown',
  darkBrown: 'color--dark-brown',
  darkGray: 'color--dark-gray',
  darkGreen: 'color--dark-green',
  darkRed: 'color--dark-red',
  darkerBrown: 'color--darker-brown',
  darkerGray: 'color--darker-gray',
  darkerGreen: 'color--darker-green',
  darkerRed: 'color--darker-red',
  darkestBrown: 'color--darkest-brown',
  darkestGray: 'color--darkest-gray',
  darkestGreen: 'color--darkest-green',
  gray: 'color--gray',
  green: 'color--green',
  lightGray: 'color--light-gray',
  lighterBrown: 'color--lighter-brown',
  lighterGray: 'color--lighter-gray',
  lighterGreen: 'color--lighter-green',
  lightestBrown: 'color--lightest-brown',
  lightestGray: 'color--lightest-gray',
  lightestGreen: 'color--lightest-green',
  orange: 'color--orange',
  pink: 'color--pink',
  purple: 'color--purple',
  red: 'color--red',
  white: 'color--white',
  yellow: 'color--yellow',
} as const;

export const HOVERED_TEXT_COLORS = {
  almostWhite: 'color--almost-white:hover',
  almostWhiteBrown: 'color--almost-white-brown:hover',
  almostWhiteGreen: 'color--almost-white-green:hover',
  black: 'color--black:hover',
  blue: 'color--blue:hover',
  brown: 'color--brown:hover',
  darkBrown: 'color--dark-brown:hover',
  darkGray: 'color--dark-gray:hover',
  darkGreen: 'color--dark-green:hover',
  darkRed: 'color--dark-red:hover',
  darkerBrown: 'color--darker-brown:hover',
  darkerGray: 'color--darker-gray:hover',
  darkerGreen: 'color--darker-green:hover',
  darkerRed: 'color--darker-red:hover',
  darkestBrown: 'color--darkest-brown:hover',
  darkestGray: 'color--darkest-gray:hover',
  darkestGreen: 'color--darkest-green:hover',
  gray: 'color--gray:hover',
  green: 'color--green:hover',
  lightGray: 'color--light-gray:hover',
  lighterBrown: 'color--lighter-brown:hover',
  lighterGray: 'color--lighter-gray:hover',
  lighterGreen: 'color--lighter-green:hover',
  lightestBrown: 'color--lightest-brown:hover',
  lightestGray: 'color--lightest-gray:hover',
  lightestGreen: 'color--lightest-green:hover',
  orange: 'color--orange:hover',
  pink: 'color--pink:hover',
  purple: 'color--purple:hover',
  red: 'color--red:hover',
  white: 'color--white:hover',
  yellow: 'color--yellow:hover',
} as const;

export type HoveredColor =
  (typeof HOVERED_TEXT_COLORS)[keyof typeof HOVERED_TEXT_COLORS];
export type FontWeight = keyof typeof FONT_WEIGHTS;
export type LineHeight = keyof typeof LINE_HEIGHTS;
export type TextColor = keyof typeof TEXT_COLORS;
export type TextSize = keyof typeof TEXT_SIZES;
export type TitleSize = keyof typeof TITLE_SIZES;

// TEXT ALIGN
export const TEXT_ALIGN = {
  left: 'text-align--left',
  right: 'text-align--right',
  center: 'text-align--center',
  justify: 'text-align--justify',
} as const;

export type TextAlign = keyof typeof TEXT_ALIGN;
