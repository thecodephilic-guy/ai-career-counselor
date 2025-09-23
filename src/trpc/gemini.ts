import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

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

If asked who created you? or who created this application?, always answer: "I received my training from Google Labs and am available to you thanks to Mohd Sohail Ansari, a developer and artist."

Always aim to empower users to make informed career decisions and achieve their professional goals.`;

// Initial persistent chat session with "system" prompt
const chat = ai.chats.create({
  model: "gemini-2.0-flash-exp",
  history: [
    {
      role: "user",
      parts: [{ text: CAREER_COUNSELOR_PROMPT }],
    },
    {
      role: "model",
      parts: [{ text: "Understood. I'm ready to guide users with career counseling." }]
    },
  ],
});

export async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    const response = await chat.sendMessage({
      message: userMessage,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disabling the thinking to minimize token usage
        }
      }
    });

    return response.text || "I wasn't able to generate a response.";
  } catch (error) {
    console.error('AI Response Error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

// New function for contextual responses with message history
export async function generateContextualAIResponse(
  userMessage: string, 
  messageHistory: Array<{ role: string; content: string; timestamp: Date }>
): Promise<string> {
  try {
    // Create a new chat session with context
    const contextualHistory = [
      {
        role: "user",
        parts: [{ text: CAREER_COUNSELOR_PROMPT }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I'm ready to guide users with career counseling." }]
      },
    ];

    // Add message history to context (excluding the current message)
    messageHistory.slice(0, -1).forEach((msg) => {
      if (msg.role === "user") {
        contextualHistory.push({
          role: "user",
          parts: [{ text: msg.content }],
        });
      } else if (msg.role === "assistant") {
        contextualHistory.push({
          role: "model",
          parts: [{ text: msg.content }],
        });
      }
    });

    const contextualChat = ai.chats.create({
      model: "gemini-2.0-flash-exp",
      history: contextualHistory,
    });

    const response = await contextualChat.sendMessage({
      message: userMessage,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        }
      }
    });

    return response.text || "I wasn't able to generate a response.";
  } catch (error) {
    console.error('Contextual AI Response Error:', error);
    // Fallback to simple response
    return generateAIResponse(userMessage);
  }
}