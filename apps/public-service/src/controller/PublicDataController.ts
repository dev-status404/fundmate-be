import { Request, Response } from 'express';
import { requestBodyValidation } from '../modules/RequestBodyValidation';
import { HttpStatusCode } from 'axios';
import { getDataByUrl } from '../modules/GetDataByUrl';

const years = [2019, 2020, 2021, 2022, 2023];

export const getDataByOption = async (req: Request, res: Response) => {
  const { age_group: ageGroup, gender, area } = req.body;

  if (!requestBodyValidation([ageGroup, gender])) {
    return res.status(HttpStatusCode.BadRequest).json({ message: '요청 값이 잘못되었습니다.' });
  }

  try {
    const result = await Promise.all(
      years.map((year) =>
        getDataByUrl('https://sgisapi.kostat.go.kr/OpenAPI3/stats/searchpopulation.json', {
          year: year,
          gender: gender,
          adm_cd: area == 0 ? null : area,
          age_type: ageGroup,
        })
      )
    );

    return res.status(HttpStatusCode.Ok).json(result);
  } catch (err) {
    console.error('getDataByOption 내부 오류:', err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 오류가 발생했습니다.' });
  }
};

export const getDataByKeyword = async (req: Request, res: Response) => {
  const { people, household, house } = req.body;

  if (!requestBodyValidation([people, household, house])) {
    return res.status(HttpStatusCode.BadRequest).json({ message: '키워드가 선택되지 않았습니다.' });
  }

  let result = {};

  try {
    if (people) {
      const peopleResult = await Promise.all(
        years.map((year) =>
          getDataByUrl('https://sgisapi.kostat.go.kr/OpenAPI3/stats/searchpopulation.json', {
            year: year,
          })
        )
      );

      result = {
        people: peopleResult,
      };
    }

    if (household) {
      const householdResult = await Promise.all(
        years.map((year) =>
          getDataByUrl('https://sgisapi.kostat.go.kr/OpenAPI3/stats/household.json', {
            year: year,
          })
        )
      );

      result = {
        ...result,
        household: householdResult,
      };
    }

    if (house) {
      const houseResult = await Promise.all(
        years.map((year) =>
          getDataByUrl('https://sgisapi.kostat.go.kr/OpenAPI3/stats/house.json', {
            year: year,
          })
        )
      );

      result = {
        ...result,
        house: houseResult,
      };
    }

    return res.status(HttpStatusCode.Ok).json(result);
  } catch (err) {
    console.error('getDataByKeyword 내부 오류:', err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 오류가 발생했습니다.' });
  }
};
