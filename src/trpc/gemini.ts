import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
export const CAREER_COUNSELOR_PROMPT = `You are an expert AI Career Counselor with years of experience helping professionals at all stages of their careers. Your role is to provide thoughtful, personalized career guidance and advice.

Your expertise includes:
- Career transitions and pivots
- Resume and interview preparation
- Skill development recommendations
- Industry insights and trends
- Work-life balance strategies
- Professional networking advice
- Leadership development
- Salary negotiation guidance

Guidelines for responses:
- Be empathetic and understanding
- Provide actionable, specific advice
- Ask clarifying questions when needed
- Share relevant examples or frameworks
- Keep responses focused and practical
- Maintain a professional yet warm tone
- Encourage growth and development

Always aim to empower users to make informed career decisions and achieve their professional goals.`;

//initial persistent chat session with "system" prompt
const chat = ai.chats.create({
  model: "gemini-2.5-flash",
  history: [
    {
      role: "user",
      parts: [{text: CAREER_COUNSELOR_PROMPT}],
    },
    {
      role: "model",
      parts: [{text: "Understood. I'm ready to guide users with career counseling."}]
    },
  ],
});

export async function generateAIResponse(
  userMessage: string
): Promise<string> {
  try {
    const response = await chat.sendMessage({
      message: userMessage,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, //Disabling the thinking to minimize token usage
        }
      }
    });

    return response.text || "I wasn’t able to generate a response."
  } catch (error) {
    console.error('AI Response Error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}