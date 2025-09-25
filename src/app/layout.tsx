import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  themeColor: "#8e51ff",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-career-counselor-liard.vercel.app"),
  title: "AI Career Counselor - Your Personal Career Development Assistant",
  description:
    "AI Career Counselor is an interactive chat app that provides personalized career guidance using AI. Save sessions, revisit past conversations, and get actionable advice to shape your future.",
  keywords: [
    "AI",
    "AI Career Counselor",
    "Career",
    "Career Counseling",
    "Career Guidance",
    "Career Help",
    "Career Assistant",
    "Career Coach",
    "AI Career Assistant",
    "Personal Career Guidance",
    "AI Career Advice",
    "AI Counselor",
    "Student Career Counseling",
    "Job Guidance",
    "AI Job Assistant",
    "Career Development",
    "Future Career Planning",
    "Professional Growth Assistant",
    "Career Chatbot",
    "AI Mentor",
  ],
  authors: [
    {
      name: "Mohd Sohail Ansari",
      url: "https://sohail-portfolio-ruby.vercel.app/",
    },
  ],
  openGraph: {
    title: "AI Career Counselor - Your Personal Career Development Assistant",
    description:
      "AI Career Counselor is an interactive chat app that provides personalized career guidance using AI. Save sessions, revisit past conversations, and get actionable advice to shape your future.",
    url: "https://ai-career-counselor-liard.vercel.app",
    siteName: "AI Career Counselor",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "AI Career Counselor - Preview Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career Counselor - Your Personal Career Development Assistant",
    description:
      "AI Career Counselor is an interactive chat app that provides personalized career guidance using AI. Save sessions, revisit past conversations, and get actionable advice to shape your future.",
    images: ["/og-banner.png"],
    creator: "@codephilic_guy",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Analytics />
          <Toaster position="top-center" duration={2000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
