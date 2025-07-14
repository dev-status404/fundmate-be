import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../../../../.env' });

let accessToken: string | null = null;
const consumer_key = process.env.PUBLIC_CONSUMER_KEY;
const consumer_secret = process.env.PUBLIC_CONSUMER_SECRET;

export const getAccessToken = async (): Promise<string> => {
  if (!consumer_key || !consumer_secret) {
    console.error('.env 키 로딩 실패');
    throw new Error('SGIS API 키가 .env에 설정되지 않았습니다.');
  }

  if (accessToken) {
    return accessToken;
  }

  try {
    const res = await axios.get('https://sgisapi.kostat.go.kr/OpenAPI3/auth/authentication.json', {
      params: {
        consumer_key,
        consumer_secret,
      },
      timeout: 5000,
    });

    accessToken = res.data.result.accessToken as string;
    return accessToken;
  } catch (err) {
    console.error('accessToken 요청 실패:', err);
    throw err;
  }
};

export const resetAccessToken = () => {
  accessToken = null;
};
