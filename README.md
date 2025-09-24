# AI Career Counselor

A beautiful, AI-powered chat application designed to provide personalized career guidance.  
Built with **Next.js**, **TypeScript**, and **tRPC**, it delivers a seamless experience with a clean, minimal UI powered by **shadcn/ui**.

<img width="1429" height="776" alt="Screenshot 2025-09-24 at 3 37 49 PM" src="https://github.com/user-attachments/assets/e575f3f4-9d95-4d4f-b762-f894e57bf018" />
<img width="1440" height="777" alt="Screenshot 2025-09-24 at 3 38 58 PM" src="https://github.com/user-attachments/assets/d3beaa9d-416c-4444-a030-bb281fd9d1e7" />


## Features

- **AI-Powered Career Guidance**: Get personalized advice on resumes, interviews, career transitions, and professional development
- **Session Management**: Create and manage multiple chat sessions without authentication
- **Beautiful Modern UI**: Modern purple theme design with smooth animations and responsive layout
- **Real-time Chat Experience**: Typing indicators, message bubbles, and smooth interactions
- **Persistent Storage**: Chat history saved securely on PostgreSQL DB.
- **Mobile Responsive**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, tRPC, TanStack Query
- **UI Components**: shadcn/ui with custom variants
- **Animations**: motion.dev
- **Database Ready**: Drizzle ORM with PostgreSQL schema (Neon.tech compatible)
- **AI Integration**: Google Gemini API ready 
- **Session Management**: UUID-based anonymous sessions

## Design System

The app features a professionally crafted design system with:
- **Purple color scheme** for a modern, professional look
- **Semantic color tokens** for consistent theming
- **Custom component variants** for buttons, cards, and chat elements
- **Smooth animations** and micro-interactions

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```

## Environment Setup

For full functionality, set up these environment variables:

```env
# Gemini API Key (for AI responses)
GEMINI_API_KEY=your_gemini_api_key

# Database URL (for Neon.tech PostgreSQL)
DATABASE_URL=your_neon_database_url
```

## Database Schema

The app is ready for PostgreSQL with Drizzle ORM:

- **chat_sessions**: Manages chat sessions with titles and metadata.
- **chat_messages**: Stores all messages with role (user/assistant) and timestamps

To run migrations:
```bash
# Use this quick command to push without generating migrations locally
npx drizzle-kit push
```

## AI Integration

Generates personalized career guidance in real-time using a large language model (LLM).

1. Add your Gemini API key to environment variables
2. Manage the AI integration code in `src/trpc/gemini.ts`
3. The system prompt is optimized for career counseling use cases

## Career Counseling Features

The AI assistant provides guidance on:
- Resume writing and optimization
- Interview preparation strategies
- Career transition planning
- Skill development recommendations
- Salary negotiation tactics
- Professional networking advice
- Leadership development
- Work-life balance strategies

## Responsive Design

- **Desktop**: Full sidebar with session management and expanded chat interface
- **Mobile**: Collapsible sidebar with optimized touch interactions

## Session Management

- **Anonymous sessions** using UUID-based identification
- **Local storage persistence** for chat history
- **Multiple concurrent sessions** with easy switching
- **Session titles** auto-generated from conversation topics

## Deployment

The app is ready for deployment on:
- **Vercel** (recommended for Next.js apps)
- **Netlify**
- **Any static hosting service**

For database integration, connect to:
- **Neon.tech** (recommended PostgreSQL hosting)
- **Supabase**
- **PlanetScale**
- **Railway**

Built with ❤️ using Next.js for an exceptional user experience.
