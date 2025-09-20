# AI Career Counselor

A beautiful, modern AI-powered career counseling chat application built with React, TypeScript, and a stunning gradient-based design system.

## 🚀 Features

- **AI-Powered Career Guidance**: Get personalized advice on resumes, interviews, career transitions, and professional development
- **Session Management**: Create and manage multiple chat sessions without authentication
- **Beautiful Modern UI**: Gradient-based design with smooth animations and responsive layout
- **Real-time Chat Experience**: Typing indicators, message bubbles, and smooth interactions
- **Persistent Storage**: Chat history saved locally (ready for database integration)
- **Mobile Responsive**: Works perfectly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with custom variants
- **Animations**: Framer Motion
- **Database Ready**: Drizzle ORM with PostgreSQL schema (Neon.tech compatible)
- **AI Integration**: OpenAI API ready (currently using demo responses)
- **Session Management**: UUID-based anonymous sessions

## 🎨 Design System

The app features a professionally crafted design system with:
- **Purple-blue gradient color scheme** for a modern, professional look
- **Semantic color tokens** for consistent theming
- **Custom component variants** for buttons, cards, and chat elements
- **Smooth animations** and micro-interactions
- **Glass morphism effects** and glowing elements

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Environment Setup

For full functionality, set up these environment variables:

```env
# OpenAI API Key (for AI responses)
OPENAI_API_KEY=your_openai_api_key

# Database URL (for Neon.tech PostgreSQL)
DATABASE_URL=your_neon_database_url
```

## 🗄️ Database Schema

The app is ready for PostgreSQL with Drizzle ORM:

- **chat_sessions**: Manages chat sessions with titles and metadata
- **messages**: Stores all messages with role (user/assistant) and timestamps
- **Proper relations** and indexing for performance

To run migrations:
```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

## 🤖 AI Integration

Currently uses simulated AI responses for demo purposes. To integrate with real AI:

1. Add your OpenAI API key to environment variables
2. Uncomment the OpenAI integration code in `src/lib/ai.ts`
3. The system prompt is optimized for career counseling use cases

## 🎯 Career Counseling Features

The AI assistant provides guidance on:
- Resume writing and optimization
- Interview preparation strategies
- Career transition planning
- Skill development recommendations
- Salary negotiation tactics
- Professional networking advice
- Leadership development
- Work-life balance strategies

## 📱 Responsive Design

- **Desktop**: Full sidebar with session management and expanded chat interface
- **Mobile**: Collapsible sidebar with optimized touch interactions
- **Tablet**: Adaptive layout that works seamlessly across screen sizes

## 🔒 Session Management

- **Anonymous sessions** using UUID-based identification
- **Local storage persistence** for chat history
- **Multiple concurrent sessions** with easy switching
- **Session titles** auto-generated from conversation topics

## 🚀 Deployment

The app is ready for deployment on:
- **Vercel** (recommended for React apps)
- **Netlify**
- **Any static hosting service**

For database integration, connect to:
- **Neon.tech** (recommended PostgreSQL hosting)
- **Supabase**
- **PlanetScale**
- **Railway**

## 🔮 Future Enhancements

- Real database integration with Drizzle ORM
- User authentication system
- File upload for resume analysis
- Career assessment tools
- Industry-specific guidance
- Export chat transcripts
- Advanced analytics and insights

## 📄 License

MIT License - feel free to use this project as a foundation for your own career counseling applications.

---

Built with ❤️ using modern web technologies for an exceptional user experience.