export const processPopulationData = (statData: any[]) => {
  const mapData: { locale: string; count: number }[] = [];
  let maleTotal = 0;
  let femaleTotal = 0;

  const areaNameMap: Record<string, string> = {
    '11': '서울특별시',
    '26': '부산광역시',
    '27': '대구광역시',
    '28': '인천광역시',
    '29': '광주광역시',
    '30': '대전광역시',
    '31': '울산광역시',
    '36': '세종특별자치시',
    '41': '경기도',
    '42': '강원도',
    '43': '충청북도',
    '44': '충청남도',
    '45': '전라북도',
    '46': '전라남도',
    '47': '경상북도',
    '48': '경상남도',
    '49': '제주특별자치도',
  };

  statData.forEach((yearEntry) => {
    const entries = yearEntry?.data || [];
    entries.forEach((item: any) => {
      const code = item.adm_cd?.substring(0, 2);
      const region = areaNameMap[code] || '기타';
      const count = parseInt(item.tot_ppltn || '0', 10);

      const existing = mapData.find((d) => d.locale === region);
      if (existing) {
        existing.count += count;
      } else {
        mapData.push({ locale: region, count });
      }

      maleTotal += parseInt(item.male_ppltn || '0', 10);
      femaleTotal += parseInt(item.female_ppltn || '0', 10);
    });
  });

  const chartData = [
    { id: '남성', label: '남성', value: maleTotal, color: '#85CEFF' },
    { id: '여성', label: '여성', value: femaleTotal, color: '#5FBDFF' },
  ];

  return { mapData, chartData };
};
