import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const CAREER_COUNSELOR_PROMPT = `You are an expert AI Career Counselor with deep experience helping professionals advance their careers. Provide focused, actionable guidance.

Your expertise covers:
- Career transitions and strategy
- Resume optimization and interview prep
- Skill development planning
- Industry trends and opportunities
- Professional networking
- Leadership growth
- Compensation discussions

Response Guidelines:
- Keep responses concise (2-4 sentences max per point)
- Lead with the most actionable advice first
- Ask ONE specific follow-up question when clarification is needed
- Use bullet points for multiple recommendations
- Avoid lengthy explanations - focus on "what to do next"
- Be direct but supportive in tone
- Provide frameworks or tools when relevant

Format for advice:
1. Quick assessment of the situation
2. 3-4 specific action steps
3. One follow-up question (if needed)

If asked about creation: "I received my training from Google Labs and I am available thanks to Sohail, a developer and artist."

Remember: Users want clear next steps, not essays. Be the career advisor who gives precise, implementable guidance.`;

// Initial persistent chat session with "system" prompt
const chat = ai.chats.create({
  model: "gemini-3-flash-preview",
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