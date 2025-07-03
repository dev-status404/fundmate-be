import { Request, Response } from 'express';
import axios from 'axios';

export const summarize = async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  const fixedPrefix = '아래 내용에 대해 40자 이내로 요약해 주세요! 꼭 40자 이내여야해요:\n';

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '메시지를 올바르게 입력해 주세요.' });
  }

  const userContent = fixedPrefix + message;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `당신은 한국어만 사용하여 답변하는 AI입니다.  
            모든 답변은 반드시 완전한 한국어 문장으로 작성하세요. 
            당신은 특정 아이디어 내용 또는 기획내용을 40자 이내로 요약하기 위해 만들어진 AI입니다. 
  
            반드시 아래 조건을 지켜야 합니다:
            1. 40자를 절대로 넘기지 마세요 (37~40자 권장)
            2. 문장은 완결된 형태여야 합니다 (예: '~입니다.', '~입니다')
            3. '?'로 끝나면 "아이디어를 제대로 입력해주세요"라고 답변하세요.
            4. 질문 형태거나 불명확한 요청에도 "아이디어를 제대로 입력해주세요"라고 하세요.

            예시:
            입력: 아래 내용에 대해 40자 이내로 요약해 주세요! 꼭 40자 이내여야해요:
            '이 서비스는 AI를 활용해 뉴스 요약을 제공합니다.'
            출력: AI 기반 뉴스 요약 제공 서비스입니다.
            `,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

const summary: string = response.data.choices?.[0]?.message?.content || '';
    return res.json({ summary });
  } catch (error: any) {
    console.error('Groq API 오류:', error.response?.data || error.message);
    return res.status(500).json({ error: 'AI 호출 실패' });
  }
};

const getAdditionalData = async (category: string, gender: string, age: string, housing: string) => {
  // 여기에 공공데이터 DB 조회 로직 추가
  // 아래는 예시
  return {
    trend: '최근 20세대의 자취 혼밥 문화가 확산 중입니다.',
    stat: '1인 가구 비중은 전체의 35%를 차지합니다.',
    interest: '해당 연령대는 자기계발, 반려동물, 홈인테리어에 관심이 많습니다.',
  };
};

export const requests = async (req: Request, res: Response) => {
  const { input_text, category, gender, age_ground, household_type } = req.body;

  if (!input_text || !category || !gender || !age_ground || !household_type) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
  }

  try {
    const data = await getAdditionalData(category, gender, age_ground, household_type);

    const aiPrompt = `
다음은 사용자가 제시한 아이디어와 타겟 정보입니다.
이 정보를 바탕으로 해당 아이디어를 구체적이고 창의적으로 확장해 주세요.

[사용자 입력 아이디어]
${input_text}

[타겟 정보]
- 카테고리: ${category}
- 성별: ${gender}
- 나이: ${age_ground}
- 주거 형태: ${household_type}

[관련 데이터]
- 트렌드: ${data.trend}
- 통계: ${data.stat}
- 관심사: ${data.interest}

[요청사항]
- 위 정보를 반영하여 아이디어를 보다 구체적이고 참신하게 확장해 주세요.
- 한국어로 완전한 문장으로 답변해 주세요.
`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `당신은 기획 아이디어를 참신하게 확장해주는 AI입니다. 모든 답변은 한국어로 작성하세요. '?'로 끝나면 "아이디어를 제대로 입력해주세요"라고 답변하세요. 질문 형태거나 불명확한 요청에도 "아이디어를 제대로 입력해주세요"라고 하세요.`,
          },
          {
            role: 'user',
            content: aiPrompt,
          },
        ],
        temperature: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

const expandedIdea: string = response.data.choices?.[0]?.message?.content || '';
    return res.json({ expandedIdea });
  } catch (error: any) {
    console.error('AI 확장 오류:', error.response?.data || error.message);
    return res.status(500).json({ error: '아이디어 확장 실패' });
  }
};
