import axios from 'axios';
import { getAccessToken, resetAccessToken } from './GetAccessToken';

export const getDataByUrl = async (
  url: string,
  params: Record<string, string | number>,
  tryCnt = 0
): Promise<Record<string, string | number>> => {
  if (tryCnt > 3) {
    console.error('❌ [SGIS] 재시도 초과!');
    throw new Error('SGIS API 호출 시도 3회 초과 - accessToken 오류');
  }

  const token = await getAccessToken();

  // 요청 URL & 파라미터 출력
  console.log('\n📡 [SGIS 요청 시도]', tryCnt + 1);
  console.log('🔗 URL:', url);
  console.log('🧾 Params:', { ...params, accessToken: token });

  try {
    const res = await axios.get(url, {
      timeout: 5000,
      params: { ...params, accessToken: token },
    });

    // 응답 확인
    console.log('📥 [SGIS 응답 결과]:', JSON.stringify(res.data, null, 2));

    if (res.data.errCd === -401 || res.data.errCd === '-401') {
      console.warn('⚠️ [SGIS] 토큰 만료, 재발급 후 재시도');
      resetAccessToken();
      return await getDataByUrl(url, params, tryCnt + 1);
    }

    const result = {
      year: params.year,
      result: res.data.result,
    };

    return result;
  } catch (error: any) {
    console.error('❌ [SGIS API 호출 실패]:', error.response?.data || error.message);
    throw error;
  }
};
