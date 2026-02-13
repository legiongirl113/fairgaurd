
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateConsequence = async (behavior: string, age: number, name: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The child named ${name}, who is ${age} years old, exhibited the following behavior: "${behavior}". 
    Generate a fair, reasonable, and age-appropriate consequence or restorative action. 
    Explain why this is a fair consequence and suggest a positive conversation starter to have with the child.
    Format your response as a JSON object.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          consequence: {
            type: Type.STRING,
            description: "The primary consequence suggested.",
          },
          reasoning: {
            type: Type.STRING,
            description: "Why this fits the child's age and the behavior.",
          },
          conversationStarter: {
            type: Type.STRING,
            description: "A question or statement to open dialogue.",
          },
          pointsDeduction: {
            type: Type.NUMBER,
            description: "A suggested point deduction (if any, keep it small, 0-50).",
          }
        },
        required: ["consequence", "reasoning", "conversationStarter", "pointsDeduction"]
      },
      systemInstruction: "You are an expert child psychologist and parenting coach. Your philosophy is restorative justice, empathy, and consistent boundaries. You believe consequences should be related, respectful, and reasonable. Never suggest physical punishment or shaming."
    }
  });

  return JSON.parse(response.text);
};
