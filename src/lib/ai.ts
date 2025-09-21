// import OpenAI from 'openai';

// Initialize OpenAI client (in a real app, this would use environment variables)
// For demo purposes, we're using a placeholder key since we simulate AI responses
// const openai = new OpenAI({
  // apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key-not-used',
  // dangerouslyAllowBrowser: true, // Only for demo - never do this in production!
// });

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

export async function generateAIResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string
): Promise<string> {
  try {
    // For demo purposes, we'll simulate an AI response
    // In a real implementation, you'd use the OpenAI API or another AI service
    
    const response = await simulateAIResponse(userMessage);
    return response;
    
    // Real OpenAI implementation would be:
    /*
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: CAREER_COUNSELOR_PROMPT },
        ...messages,
        { role: "user", content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    */
  } catch (error) {
    console.error('AI Response Error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

// Simulate AI responses for demo
async function simulateAIResponse(userMessage: string): Promise<string> {
  // Add a small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
    return "📄 Great question about resumes! Here are my top recommendations:\n\n• **Tailor for each role**: Customize your resume for specific positions by highlighting relevant skills and experiences\n• **Use action verbs**: Start bullet points with strong verbs like 'led', 'implemented', 'optimized'\n• **Quantify achievements**: Include numbers, percentages, and concrete results whenever possible\n• **Keep it concise**: Aim for 1-2 pages maximum, focusing on your most relevant experience\n\nWould you like me to elaborate on any of these points or help with a specific section of your resume?";
  }

  if (lowerMessage.includes('interview') || lowerMessage.includes('interviewing')) {
    return "🎯 Interview preparation is crucial for success! Here's my strategic approach:\n\n• **Research thoroughly**: Study the company, role, and recent news. Know their values and culture\n• **Practice STAR method**: Structure responses using Situation, Task, Action, Result framework\n• **Prepare thoughtful questions**: Show genuine interest by asking about team dynamics, growth opportunities, challenges\n• **Mock interviews**: Practice with friends or record yourself to improve delivery\n\nWhat type of interview are you preparing for? I can provide more specific guidance based on the role and company.";
  }

  if (lowerMessage.includes('career change') || lowerMessage.includes('transition') || lowerMessage.includes('switch')) {
    return "🔄 Career transitions can be exciting opportunities! Let me guide you through this process:\n\n• **Assess transferable skills**: Identify skills from your current role that apply to your target field\n• **Bridge the gap**: Consider certifications, courses, or volunteer work to build relevant experience\n• **Network strategically**: Connect with professionals in your target industry through LinkedIn and events\n• **Craft your narrative**: Develop a compelling story explaining your career change motivation\n\nWhat industry or role are you considering transitioning to? I can provide more targeted advice based on your specific situation.";
  }

  if (lowerMessage.includes('salary') || lowerMessage.includes('negotiate') || lowerMessage.includes('raise')) {
    return "💰 Salary negotiation is a valuable skill! Here's my proven approach:\n\n• **Research market rates**: Use sites like Glassdoor, PayScale, and industry reports to understand your worth\n• **Document your value**: Prepare a list of your achievements, contributions, and impact on the company\n• **Time it right**: Initiate discussions after successful projects or during performance reviews\n• **Consider the full package**: Look beyond base salary - benefits, PTO, flexible work, professional development\n\nAre you negotiating a new offer or seeking a raise in your current role? The strategy varies slightly for each scenario.";
  }

  if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('development')) {
    return "🚀 Continuous learning is essential for career growth! Here's how to approach skill development:\n\n• **Identify gaps**: Compare your current skills with job requirements in roles you aspire to\n• **Mix learning methods**: Combine online courses, books, podcasts, and hands-on projects\n• **Focus on high-impact skills**: Prioritize skills that are in-demand in your industry\n• **Practice and apply**: Look for opportunities to use new skills in current projects or side work\n\nWhat skills are you most interested in developing? I can recommend specific learning resources and strategies.";
  }

  if (lowerMessage.includes('networking') || lowerMessage.includes('network')) {
    return "🤝 Strategic networking opens doors to amazing opportunities! Here's my networking framework:\n\n• **Give before you get**: Offer help, insights, or connections to others before asking for favors\n• **Quality over quantity**: Build meaningful relationships rather than collecting contacts\n• **Leverage LinkedIn**: Share industry insights, engage with posts, and reach out thoughtfully\n• **Attend events**: Join professional associations, conferences, and local meetups in your field\n\nWhat's your current networking challenge? Are you looking to expand in your current industry or explore new fields?";
  }

  // Default career counselor response
  return "👋 I'm here to help with your career journey! As your AI Career Counselor, I can assist with:\n\n• **Resume and interview preparation**\n• **Career transitions and planning**\n• **Skill development strategies**\n• **Salary negotiation tactics**\n• **Professional networking**\n• **Work-life balance**\n• **Leadership development**\n\nWhat specific career challenge or goal would you like to explore today? The more details you share, the more personalized advice I can provide.";
}