import { GoogleGenAI } from "@google/genai";

interface FilePart {
  data: string; // base64 encoded string
  mimeType: string;
}

export const getJobMarketPrediction = async (
  userInput: string,
  files: FilePart[]
): Promise<string> => {
  // API key is obtained exclusively from the environment variable process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const promptIntro = userInput
    ? "제공된 파일들과 텍스트는"
    : "제공된 파일들은";
  
  const contextSection = userInput
    ? `\n\n분석 컨텍스트: "${userInput}"`
    : "";

  const textPart = {
    text: `${promptIntro} 특정 전공 분야 또는 기술에 대한 데이터입니다. 이 정보들을 심층적으로 분석하여, 향후 10년 후의 시나리오를 예측해주세요.

예측에 다음 두 가지 핵심 지표를 반드시 포함하여 구체적인 수치와 함께 핵심 내용을 간결하게 요약하여 한국어로 제공해주세요:
1. **예상 취업률:** 10년 후 해당 분야의 전반적인 고용 상태를 백분율로 예측합니다.
2. **AI로 인한 직업 대체율:** AI 기술 발전으로 인해 해당 분야의 직업이 자동화되거나 대체될 가능성을 백분율로 예측합니다.${contextSection}`,
  };

  const fileParts = files.map(file => ({
    inlineData: {
      data: file.data,
      mimeType: file.mimeType,
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, ...fileParts] },
    });
    
    if (!response.text) {
        throw new Error("AI로부터 유효한 응답을 받지 못했습니다.");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
    throw new Error("AI 예측을 가져오는 데 실패했습니다. 자세한 내용은 콘솔을 확인해주세요.");
  }
};