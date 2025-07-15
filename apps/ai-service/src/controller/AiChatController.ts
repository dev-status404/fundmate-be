import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { getDataByUrl } from '../modules/GetDataByUrl';
dotenv.config();
dotenv.config({ path: '.env.apikey' });

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
            모든 답변은 반드시 한국어 문장으로 작성하세요. 
            당신은 특정 아이디어 내용 또는 기획내용을 40자 이내로 요약하기 위해 만들어진 AI입니다. 
  
            반드시 아래 조건을 지켜야 합니다:
            1. 40자를 절대로 넘기지 마세요 (37~40자 권장)
            2. 문장은 완결된 형태가 아니여도 되지만 어색함이 없어야합니다.
            3. '?'로 끝나면 "아이디어를 제대로 입력해주세요"라고 답변하세요.
            4. 질문 형태거나 불명확한 요청에도 "아이디어를 제대로 입력해주세요"라고 하세요.
            5. 답변은 최대한 짧게 작성합니다.

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

const years = [2019, 2020, 2021, 2022, 2023];

// 공공데이터 분석 함수
const getAdditionalData = async (
  category: string,
  gender: string,
  age: string,
  housing: string,
  area = '11000' // 기본: 서울
) => {
  try {
    // 인구 데이터
    const populationData = await Promise.all(
      years.map((year) =>
        getDataByUrl('https://sgisapi.kostat.go.kr/OpenAPI3/stats/searchpopulation.json', {
          year,
          gender,
          adm_cd: area,
          age_type: age,
        })
      )
    );

    // 가구 데이터
    const householdData = await Promise.all(
      years.map((year) =>
        getDataByUrl('https://sgisapi.kostat.go.kr/OpenAPI3/stats/household.json', {
          year,
        })
      )
    );

    // 주택 데이터
    const houseData = await Promise.all(
      years.map((year) =>
        getDataByUrl('https://sgisapi.kostat.go.kr/OpenAPI3/stats/house.json', {
          year,
        })
      )
    );

    // 가공 예시
    const lastPop = populationData.at(-1)?.[0]?.data || [];
    const lastHousehold = householdData.at(-1)?.[0]?.data || [];
    const lastHouse = houseData.at(-1)?.[0]?.data || [];

    const totalPop = lastPop.reduce((sum: number, d: any) => sum + Number(d.dataval || 0), 0);
    const onePersonRate =
      lastHousehold[0]?.one_person_household && lastHousehold[0]?.total_household
        ? Math.round((Number(lastHousehold[0]?.one_person_household) / Number(lastHousehold[0]?.total_household)) * 100)
        : null;

    const trend = `최근 ${years.at(-1)}년 기준 인구는 약 ${totalPop.toLocaleString()}명입니다.`;
    const stat = onePersonRate
      ? `1인 가구 비율은 전체 가구 중 약 ${onePersonRate}%로 추정됩니다.`
      : `1인 가구 비율 정보를 불러오지 못했습니다.`;
    const interest = '해당 연령대는 자기계발, 반려동물, 홈인테리어에 대한 관심이 높은 것으로 조사됩니다.';

    return { trend, stat, interest };
  } catch (err) {
    console.error('getAdditionalData 오류:', err);
    return {
      trend: '트렌드 정보를 불러오는 데 실패했습니다.',
      stat: '통계 정보를 불러오는 데 실패했습니다.',
      interest: '관심사 정보를 불러오는 데 실패했습니다.',
    };
  }
};
const sanitizeOutput = (text: string): string => {
  return text
    .replace(/interactive/gi, '상호작용형')
    .replace(/survey/gi, '설문조사')
    .replace(/结合/g, '결합')
    .replace(/競合/g, '경쟁')
    .replace(/市場/g, '시장')
    .replace(/製品/g, '제품')
    .replace(/分析/g, '분석')
    .replace(/概要/g, '개요')
    .replace(/提案/g, '제안')
    .replace(/顧客/g, '고객');
};
export const requests = async (req: Request, res: Response) => {
  const { input_text, category, gender, age_ground, household_type } = req.body;

  if (!input_text || !category || !gender || !age_ground || !household_type) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
  }

  try {
    const data = await getAdditionalData(category, gender, age_ground, household_type);

    const aiPrompt = `
아래는 사용자가 제시한 아이디어와 타겟 정보입니다.
이 정보를 바탕으로 아이디어를 구체적이고 창의적으로 확장하고, 반드시 아래 출력 구조에 맞춰 마크다운으로 출력해 주세요.

[아이디어]
${input_text}

[타겟 정보]
- 카테고리: ${category}
- 성별: ${gender}
- 나이대: ${age_ground}
- 주거 형태: ${household_type}

[참고 데이터]
- 트렌드: ${data.trend}
- 통계: ${data.stat}
- 관심사: ${data.interest}

[마크다운 출력 포맷 예시]
# 🐶 ${age_ground} ${household_type} ${gender}을 위한 펀딩 아이디어  
### ${input_text}에서 핵심 키워드 추출하여 제목으로

---

## 📈 1. 시장 동향 및 성장성  
- 시장 규모와 CAGR
- 관련 트렌드

## 🧪 2. 관련 특허 아이디어  
- 유사 특허 예시 및 특허번호

## 🌟 3. 세부 펀딩 아이디어  
### A. 제품 아이디어 A  
- 핵심 기능 요약  
### B. 제품 아이디어 B  
- 핵심 기능 요약

## 🎯 4. 타깃 전략  
- 디자인, 사용 편의성 등 타깃 맞춤 전략

## 📊 5. 통계 기반 타당성  
- 통계 수치 기반으로 설득력 있게 설명

## ✅ 6. 추진 일정  
| 단계 | 주요 내용 |
|------|----------|
| 리서치 | 시장 조사 등 |
| 디자인 | 프로토타입 설계 등 |
| 테스트 | 사용자 피드백 등 |
| 캠페인 | SNS, 마케팅 |

---

## 💡 요약  
- 시장성 + 제품성 + 실행가능성 간단히 정리

[작성 규칙]
- 반드시 100% 한국어로만 작성
- 영어, 한자, 일본어, 중국어, 아랍어, 이모지, 특수기호(예: %, &, @ 등) 절대 사용 금지
- 로마자, 외래어도 포함하지 마세요 (예: survey → 설문조사, interactive → 상호작용형 등)
- 结合 -> 결합으로 변환 필수
- 競合 -> 경쟁으로 변환 필수
- 문장은 완결된 서술형으로 작성
- ${category}의 내용이 '관계없음', '관계 없음' 일때 해당 내용을 포함하지 않음
- ${gender}의 내용이 '관계없음', '관계 없음' 일때 해당 내용을 포함하지 않음
- ${age_ground}의 내용이 '관계없음', '관계 없음' 일때 해당 내용을 포함하지 않음
- ${household_type}의 내용이 '관계없음', '관계 없음' 일때 해당 내용을 포함하지 않음
- ${input_text}의 내용이 질문 형태거나 불명확한 요청에도 "아이디어를 제대로 입력해주세요"라고 하세요.
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

    const expandedRaw: string = response.data.choices?.[0]?.message?.content || '';
    const expanded_Idea = sanitizeOutput(expandedRaw);
    return res.json({ expanded_Idea });
  } catch (error: any) {
    console.error('AI 확장 오류:', error.response?.data || error.message);
    return res.status(500).json({ error: '아이디어 확장 실패' });
  }
};
