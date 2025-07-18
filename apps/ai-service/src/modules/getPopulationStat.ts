import { getDataByUrl } from '../modules/GetDataByUrl';
import { mapGender, mapAge } from './mapDemographicCodes';
const years = [2019, 2020, 2021, 2022, 2023];

export const getPopulationStat = async (
  gender: string,
  ageType: string,
  area = '11000' // 서울
) => {
  try {
    const genderCode = mapGender(gender); // "여성" -> 2
    const ageCode = mapAge(ageType); // "20대" -> "32"

    const result = await Promise.all(
      years.map((year) =>
        getDataByUrl('https://sgisapi.kostat.go.kr/OpenAPI3/stats/searchpopulation.json', {
          year,
          gender: genderCode,
          age_type: ageCode,
          adm_cd: area,
        })
      )
    );

    return result;
  } catch (err) {
    console.error('❌ 인구 통계 데이터 요청 실패:', err);
    return null;
  }
};
