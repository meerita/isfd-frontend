/** @format */

enum Difficulties {
  ANY = 'ANY',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

// create an array from the enums values and export just as it is.
export const DifficultiesList = Object.values(Difficulties);

export default Difficulties;
