/** @format */
export const IMAGE_SIZES = {
  0: 'width--0 height--0',
  2: 'width--2 height--2',
  4: 'width--4 height--4',
  8: 'width--8 height--8',
  10: 'width--10 height--10',
  12: 'width--12 height--12',
  14: 'width--14 height--14',
  16: 'width--16 height--16',
  18: 'width--18 height--18',
  20: 'width--20 height--20',
  22: 'width--22 height--22',
  24: 'width--24 height--24',
  26: 'width--26 height--26',
  28: 'width--28 height--28',
  32: 'width--32 height--32',
  36: 'width--36 height--36',
  40: 'width--40 height--40',
  44: 'width--44 height--44',
  48: 'width--48 height--48',
  52: 'width--52 height--52',
  64: 'width--64 height--64',
  128: 'width--128 height--128',
};

export const GRID_TYPES = {
  flex: 'display--flex',
  grid: 'display--grid',
  inlineFlex: 'display--inline-flex',
  inlineGrid: 'display--inline-grid',
};

export const DISPLAY_TYPES = {
  ...GRID_TYPES,
  block: 'display--block',
  inlineBlock: 'display--inline-block',
  inline: 'display--inline',
  listItem: 'display--list-item',
  table: 'display--table',
  none: 'display--none',
  initial: 'display--initial',
  inherit: 'display--inherit',
};

export const GRID_ALIGNMENTS = {
  start: 'align-items--start',
  end: 'align-items--end',
  center: 'align-items--center',
  stretch: 'align-items--stretch',
};

export const GRID_JUSTIFY_ITEMS = {
  start: 'justify-items--start',
  end: 'justify-items--end',
  center: 'justify-items--center',
};

export const CONTENT_DIRECTIONS = {
  row: 'flex-direction--row',
  rowReverse: 'flex-direction--row-reverse',
  column: 'flex-direction--column',
  columnReverse: 'flex-direction--column-reverse',
};

export const MARGIN_BLOCK = {
  0: 'margin-block--0',
  2: 'margin-block--2',
  4: 'margin-block--4',
  8: 'margin-block--8',
  12: 'margin-block--12',
  16: 'margin-block--16',
  24: 'margin-block--24',
  32: 'margin-block--32',
  40: 'margin-block--40',
  48: 'margin-block--48',
  64: 'margin-block--64',
};

export const BORDER_RADIUS = {
  0: 'border-radius--0',
  2: 'border-radius--2',
  4: 'border-radius--4',
  5: 'border-radius--5',
  6: 'border-radius--6',
  8: 'border-radius--8',
  10: 'border-radius--10',
  512: 'border-radius--512',
};

export const MARGIN_VALUES = {
  0: 'margin--0',
  2: 'margin-bottom--2',
  4: 'margin-bottom--4',
  8: 'margin-bottom--8',
  12: 'margin-bottom--12',
  16: 'margin-bottom--16',
  24: 'margin-bottom--24',
  32: 'margin-bottom--32',
  40: 'margin-bottom--40',
  48: 'margin-bottom--48',
  64: 'margin-bottom--64',
} as const;

export const PADDING_VALUES = {
  0: 'padding--0',
  4: 'padding--4',
  8: 'padding--8',
  16: 'padding--16',
  24: 'padding--24',
  32: 'padding--32',
  48: 'padding--48',
  64: 'padding--64',
  96: 'padding--96',
} as const;

export const COLUMNS = {
  2: 'columns--2',
  3: 'columns--3',
  4: 'columns--4',
  5: 'columns--5',
  6: 'columns--6',
  7: 'columns--7',
  8: 'columns--8',
  9: 'columns--9',
  10: 'columns--10',
};

export const ELEVATION_LEVELS = {
  0: 'elevation--0',
  1: 'elevation--1',
  2: 'elevation--2',
  3: 'elevation--3',
  4: 'elevation--4',
  5: 'elevation--5',
  6: 'elevation--6',
  7: 'elevation--7',
  8: 'elevation--8',
  9: 'elevation--9',
  10: 'elevation--10',
} as const;

export const GAPS = {
  0: 'gap--0',
  2: 'gap--2',
  4: 'gap--4',
  6: 'gap--6',
  8: 'gap--8',
  16: 'gap--16',
  24: 'gap--24',
  28: 'gap--28',
  32: 'gap--32',
  36: 'gap--36',
  40: 'gap--40',
  42: 'gap--42',
  48: 'gap--48',
  64: 'gap--64',
  96: 'gap--96',
  128: 'gap--128',
} as const;

export const COLUMNS_NUMBER = {
  1: 'template-columns--1',
  2: 'template-columns--2',
  3: 'template-columns--3',
  4: 'template-columns--4',
  5: 'template-columns--5',
  6: 'template-columns--6',
  7: 'template-columns--7',
  8: 'template-columns--8',
  9: 'template-columns--9',
  10: 'template-columns--10',
  11: 'template-columns--11',
  12: 'template-columns--12',
} as const;

export const BACKGROUND_COLORS = {
  almostWhite: 'background-color--almost-white',
  almostWhiteBrown: 'background-color--almost-white-brown',
  almostWhiteGreen: 'background-color--almost-white-green',
  almostWhiteBlue: 'background-color--almost-white-blue',
  black: 'background-color--black',
  blue: 'background-color--blue',
  brown: 'background-color--brown',
  darkerBrown: 'background-color--darker-brown',
  darkerGreen: 'background-color--darker-green',
  darkestBrown: 'background-color--darkest-brown',
  darkestGray: 'background-color--darkest-gray',
  darkestGreen: 'background-color--darkest-green',
  darkGray: 'background-color--dark-gray',
  gray: 'background-color--gray',
  green: 'background-color--green',
  lighterBrown: 'background-color--lighter-brown',
  lighterGray: 'background-color--lighter-gray',
  lighterGreen: 'background-color--lighter-green',
  lightestBrown: 'background-color--lightest-brown',
  lightestGray: 'background-color--lightest-gray',
  lightestGreen: 'background-color--lightest-green',
  lighterBlue: 'background-color--lighter-blue',
  lightestBlue: 'background-color--lightest-blue',
  lightGray: 'background-color--light-gray',
  orange: 'background-color--orange',
  pink: 'background-color--pink',
  purple: 'background-color--purple',
  red: 'background-color--red',
  transparent: 'background-color--transparent',
  white: 'background-color--white',
  yellow: 'background-color--yellow',
} as const;

export const HOVERED_BACKGROUND_COLORS = {
  transparent: 'background-color--transparent:hover',
  black: 'background-color--black:hover',
  darkestGray: 'background-color--darkest-gray:hover',
  darkGray: 'background-color--dark-gray:hover',
  gray: 'background-color--gray:hover',
  lightGray: 'background-color--light-gray:hover',
  lighterGray: 'background-color--lighter-gray:hover',
  lightestGray: 'background-color--lightest-gray:hover',
  almostWhite: 'background-color--almost-white:hover',
  white: 'background-color--white:hover',

  darkestGreen: 'background-color--darkest-green:hover',
  darkerGreen: 'background-color--darker-green:hover',
  green: 'background-color--green:hover',
  lightGreen: 'background-color--light-green:hover',
  lighterGreen: 'background-color--lighter-green:hover',
  lightestGreen: 'background-color--lightest-green:hover',
  almostWhiteGreen: 'background-color--almost-white-green:hover',

  darkestBrown: 'background-color--darkest-brown:hover',
  darkerBrown: 'background-color--darker-brown:hover',
  brown: 'background-color--brown:hover',
  lighterBrown: 'background-color--lighter-brown:hover',
  lightestBrown: 'background-color--lightest-brown:hover',
  almostWhiteBrown: 'background-color--almost-white-brown:hover',

  blue: 'background-color--blue:hover',
  yellow: 'background-color--yellow:hover',
  orange: 'background-color--orange:hover',
  pink: 'background-color--pink:hover',
  purple: 'background-color--purple:hover',
} as const;

export const FILL_COLORS = {
  black: 'fill--black',
  darkestGray: 'fill--darkest-gray',
  darkerGray: 'fill--darker-gray',
  darkGray: 'fill--dark-gray',
  gray: 'fill--gray',
  lightGray: 'fill--light-gray',
  lighterGray: 'fill--lighter-gray',
  lightestGray: 'fill--lightest-gray',
  almostWhite: 'fill--almost-white',
  white: 'fill--white',

  darkestGreen: 'fill--darkest-green',
  darkerGreen: 'fill--darker-green',
  green: 'fill--green',
  lighterGreen: 'fill--lighter-green',
  lightestGreen: 'fill--lightest-green',
  almostWhiteGreen: 'fill--almost-white-green',

  darkestBrown: 'fill--darkest-brown',
  darkerBrown: 'fill--darker-brown',
  brown: 'fill--brown',
  lighterBrown: 'fill--lighter-brown',
  lightestBrown: 'fill--lightest-brown',
  almostWhiteBrown: 'fill--almost-white-brown',
  red: 'fill--red',

  blue: 'fill--blue',
  yellow: 'fill--yellow',
  orange: 'fill--orange',
  pink: 'fill--pink',
  purple: 'fill--purple',
} as const;

export const HOVERED_FILL_COLORS = {
  black: 'fill--black:hover',
  darkestGray: 'fill--darkest-gray:hover',
  darkGray: 'fill--dark-gray:hover',
  gray: 'fill--gray:hover',
  lightGray: 'fill--light-gray:hover',
  lighterGray: 'fill--lighter-gray:hover',
  lightestGray: 'fill--lightest-gray:hover',
  almostWhite: 'fill--almost-white:hover',
  white: 'fill--white:hover',

  darkestGreen: 'fill--darkest-green:hover',
  darkerGreen: 'fill--darker-green:hover',
  green: 'fill--green:hover',
  lighterGreen: 'fill--lighter-green:hover',
  lightestGreen: 'fill--lightest-green:hover',
  almostWhiteGreen: 'fill--almost-white-green:hover',

  darkestBrown: 'fill--darkest-brown:hover',
  darkerBrown: 'fill--darker-brown:hover',
  brown: 'fill--brown:hover',
  lighterBrown: 'fill--lighter-brown:hover',
  lightestBrown: 'fill--lightest-brown:hover',
  almostWhiteBrown: 'fill--almost-white-brown:hover',

  blue: 'fill--blue:hover',
  yellow: 'fill--yellow:hover',
  orange: 'fill--orange:hover',
  pink: 'fill--pink:hover',
  purple: 'fill--purple:hover',
} as const;

export type justifyItems =
  (typeof GRID_JUSTIFY_ITEMS)[keyof typeof GRID_JUSTIFY_ITEMS];
export type gridDirection =
  (typeof CONTENT_DIRECTIONS)[keyof typeof CONTENT_DIRECTIONS];
export type hoveredFillColor =
  (typeof HOVERED_FILL_COLORS)[keyof typeof HOVERED_FILL_COLORS];
export type hoveredBackgroundColor =
  (typeof HOVERED_BACKGROUND_COLORS)[keyof typeof HOVERED_BACKGROUND_COLORS];
export type imageSizes = (typeof IMAGE_SIZES)[keyof typeof IMAGE_SIZES];
export type FillColor = (typeof FILL_COLORS)[keyof typeof FILL_COLORS];
export type GridAlignment =
  (typeof GRID_ALIGNMENTS)[keyof typeof GRID_ALIGNMENTS];
export type BorderRadius = (typeof BORDER_RADIUS)[keyof typeof BORDER_RADIUS];
export type BackgroundColor =
  (typeof BACKGROUND_COLORS)[keyof typeof BACKGROUND_COLORS];
export type DisplayType = (typeof DISPLAY_TYPES)[keyof typeof DISPLAY_TYPES];
export type GridDisplayType = (typeof GRID_TYPES)[keyof typeof GRID_TYPES];
export type ColumnNumber = (typeof COLUMNS_NUMBER)[keyof typeof COLUMNS_NUMBER];
export type GapSize = (typeof GAPS)[keyof typeof GAPS];
export type PaddingValue = (typeof PADDING_VALUES)[keyof typeof PADDING_VALUES];
export type MarginValue = (typeof MARGIN_VALUES)[keyof typeof MARGIN_VALUES];
export type ElevationLevel =
  (typeof ELEVATION_LEVELS)[keyof typeof ELEVATION_LEVELS];
export type MarginBlockValue = (typeof MARGIN_BLOCK)[keyof typeof MARGIN_BLOCK];
