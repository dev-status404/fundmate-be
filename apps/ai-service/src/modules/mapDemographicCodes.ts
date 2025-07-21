export const mapGender = (gender: string): number => {
  switch (gender.trim()) {
    case '남성':
      return 1;
    case '여성':
      return 2;
    default:
      return 0;
  }
};

export const mapAge = (age: string): string => {
  const ageMap: { [key: string]: string } = {
    '10대': '31',
    '20대': '32',
    '30대': '33',
    '40대': '34',
    '50대': '35',
    '60대': '36',
    '70대 이상': '40',
  };
  return ageMap[age.trim()] || '0';
};
// export const mapAge = (age: string): number => {
//   const ageMap: { [key: string]: number } = {
//     '10대': 10,
//     '20대': 20,
//     '30대': 30,
//     '40대': 40,
//     '50대': 50,
//     '60대': 60,
//     '70대 이상': 70,
//   };
//   return ageMap[age.trim()] || 0;
// };
