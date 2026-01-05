import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuestionType } from "../types";

const SYSTEM_INSTRUCTION = `
你是一位台灣國小高年級（五、六年級）的專業國語老師。
你的任務是生成適合這個年齡層的國語測驗題目，難度適中，符合台灣教育部課綱。
使用繁體中文（Traditional Chinese, Taiwan standard）。
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      type: { type: Type.STRING },
      prompt: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      correctAnswer: { type: Type.STRING },
      keyword: { type: Type.STRING },
      explanation: { type: Type.STRING },
    },
    required: ["id", "type", "prompt", "correctAnswer", "explanation"]
  }
};

export const generateQuizQuestions = async (apiKey: string, type: QuestionType, count: number = 3): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  let specificPrompt = "";
  switch (type) {
    case QuestionType.PHONETIC:
      specificPrompt = `請生成 ${count} 題「字音字形」測驗。重點在於容易混淆的字詞（如：燥/躁、卷/券）或破音字。
      Prompt格式範例：「請選出『強迫』的正確注音」。
      Options放4個選項。`;
      break;
    case QuestionType.FIX_TYPO:
      specificPrompt = `請生成 ${count} 題「改錯別字」測驗。給一個包含1個錯別字的句子。
      Prompt格式範例：「找出句子中的錯別字：他今天穿了一件很帥氣的西裝，看起來異氣風發。」
      Options放4個詞語選項，其中一個是錯字改正後的正確詞（或指出哪個是錯字）。
      或者直接讓CorrectAnswer是正確的字。為了方便作答，請設計成選擇題形式，選出正確的用字。`;
      break;
    case QuestionType.FILL_BLANK:
      specificPrompt = `請生成 ${count} 題「成語填空」或「詞語填空」。
      Prompt格式範例：「這件事情非常重要，我們必須（ ）對待。」
      Options放4個成語或詞語。`;
      break;
    case QuestionType.CHOICE:
      specificPrompt = `請生成 ${count} 題「綜合選擇題」，包含修辭辨析、詞義辨析。`;
      break;
    case QuestionType.SENTENCE:
      // Sentence making is handled differently, usually just 1 prompt to the user
      specificPrompt = `請生成 ${count} 個「造句」題目。
      每個題目提供一個成語或詞彙（Keyword）。
      Prompt: "請用『(keyword)』造一個句子"。
      CorrectAnswer 留空，因為需要AI評分。`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `請生成 ${count} 題 ${type}。${specificPrompt}
      請確保輸出為JSON格式，不需要Markdown標記。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const text = response.text || "[]";
    const data = JSON.parse(text);
    return data.map((q: any) => ({ ...q, type }));
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
};

export const evaluateSentence = async (apiKey: string, keyword: string, userSentence: string): Promise<{ score: number; feedback: string }> => {
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `關鍵詞：${keyword}
      學生造句：${userSentence}
      
      請評分（0-100）並給予簡短評語。如果是亂打的或完全無關，給0分。
      請回傳 JSON: { "score": number, "feedback": string }`,
      config: {
        systemInstruction: "你是一位親切的國語老師。請用鼓勵的語氣給出評語。",
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                score: {type: Type.NUMBER},
                feedback: {type: Type.STRING}
            }
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Evaluation error", error);
    return { score: 80, feedback: "系統忙碌中，雖然無法詳細評分，但你的練習精神值得嘉許！" };
  }
};

export const testApiConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Test connection",
    });
    return true;
  } catch (error) {
    console.error("API Test Failed", error);
    return false;
  }
};