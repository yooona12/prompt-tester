import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function runPrompt(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function improvePrompt(originalPrompt) {
  const metaPrompt = `당신은 프롬프트 엔지니어링 전문가입니다. 아래 프롬프트를 더 효과적이고 구체적으로 개선하여 AI가 더 좋은 결과를 생성할 수 있도록 만들어 주세요.

원본 프롬프트:
"""
${originalPrompt}
"""

개선된 프롬프트 텍스트만 반환하세요. 설명이나 서두 없이, 개선된 프롬프트 내용만 출력하세요. 원본과 동일한 언어를 사용하세요.`;

  const result = await model.generateContent(metaPrompt);
  return result.response.text().trim();
}

export async function analyzeResults(promptA, outputA, promptB, outputB) {
  const analysisPrompt = `당신은 AI 출력 평가 전문가입니다. 아래 두 프롬프트-응답 쌍을 비교하여 어떤 프롬프트가 더 효과적인지 판단하세요.

--- 프롬프트 A ---
${promptA}

--- 출력 A ---
${outputA}

--- 프롬프트 B ---
${promptB}

--- 출력 B ---
${outputB}

두 프롬프트와 출력을 분석하세요. 모든 텍스트 필드는 반드시 한국어로 작성하세요. 아래 JSON 형식으로만 응답하세요 (마크다운 없이 유효한 JSON만 출력):
{
  "winner": "A" 또는 "B" 또는 "TIE",
  "score_a": <1~10 숫자>,
  "score_b": <1~10 숫자>,
  "summary": "<한 문장으로 된 최종 판정>",
  "strengths_a": ["<강점 1>", "<강점 2>"],
  "strengths_b": ["<강점 1>", "<강점 2>"],
  "weaknesses_a": ["<약점 1>"],
  "weaknesses_b": ["<약점 1>"],
  "recommendation": "<어떤 프롬프트가 더 좋고 그 이유는 무엇인지 2~3문장으로 상세히 설명>"
}`;

  const result = await model.generateContent(analysisPrompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse analysis response');
  return JSON.parse(jsonMatch[0]);
}
