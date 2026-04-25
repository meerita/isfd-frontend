/** @format */

const DURATION = {
  SECOND: 1,
  TEN_SECONDS: 10,
  THIRTY_SECONDS: 30,
  FOURTY_SECONDS: 40,
  FIFTY_SECONDS: 50,
  MINUTE: 60,
  FIVE_MINUTES: 60 * 5,
  TEN_MINUTES: 60 * 10,
  HOUR: 60 * 60,
  DAY: 60 * 60 * 24,
  WEEK: 60 * 60 * 24 * 7,
  MONTH: 60 * 60 * 24 * 30,
} as const;

export default DURATION;
