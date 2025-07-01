import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

export const summarize = async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  const fixedPrefix =
    "아래 내용에 대해 40자 이내로 요약해 주세요! 꼭 40자 이내여야해요:\n";


  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "메시지를 올바르게 입력해 주세요." });
  }

  const userContent = fixedPrefix + message;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "당신은 한국어만 사용하여 답변하는 AI입니다. 모든 답변은 반드시 완벽한 한국어로 작성하세요. 또한 당신은 특정 아이디어 내용 또는 기획내용을 40자 이내로 요약하기 위해 만들어진 AI입니다. 꼭 완변한 문장으로 끝나야합니다. 질문이 내용으로 들어올 경우 '아이디어를 제대로 입력해주세요'라고 답변합니다. '?'가 마지막으로 들어올시 '아이디어를 제대로 입력해주세요'라고 답변합니다.",
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result: string = response.data.choices[0].message.content;
    return res.json({ result });
  } catch (error: any) {
    console.error("Groq API 오류:", error.response?.data || error.message);
    return res.status(500).json({ error: "AI 호출 실패" });
  }
};

export default router;