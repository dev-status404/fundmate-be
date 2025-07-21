const regionMap: { [key: string]: string } = {
  서울: '11',
  부산: '21',
  대구: '22',
  인천: '23',
  광주: '24',
  대전: '25',
  울산: '26',
  세종: '29',
  경기: '31',
  강원: '32',
  충북: '33',
  충남: '34',
  전북: '35',
  전남: '36',
  경북: '37',
  경남: '38',
  제주: '39',
};

export const mapRegion = (region: string): string => {
  return regionMap[region.trim()] || '11';
};

// export const reverseMapRegion = (code: string): string => {
//   return Object.entries(regionMap).find(([, v]) => v === code)?.[0] || '서울';
// };
