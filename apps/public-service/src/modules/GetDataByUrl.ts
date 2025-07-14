import axios from 'axios';
import { getAccessToken, resetAccessToken } from './GetAccessToken';

export const getDataByUrl = async (
  url: string,
  params: Record<string, string | number>,
  tryCnt = 0
): Promise<Record<string, string | number>> => {
  if (tryCnt > 3) {
    console.error('재시도 초과!');
    throw new Error('SGIS API 호출 시도 3회 초과 - accessToken 오류');
  }

  const token = await getAccessToken();

  try {
    const res = await axios.get(url, {
      timeout: 5000,
      params: { ...params, accessToken: token },
    });

    if (res.data.errCd === -401 || res.data.errCd === '-401') {
      resetAccessToken();
      return await getDataByUrl(url, params, tryCnt + 1);
    }

    const result = {
      year: params.year,
      result: res.data.result,
    };

    return result;
  } catch (error) {
    console.error('SGIS API 호출 실패:', error);
    throw error;
  }
};
