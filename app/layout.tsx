import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SurfContext - The Open Standard for Agent-Ready Project Documentation",
  description:
    "One format. Every AI coding agent. Define your project context once — all major AI coding agents understand it automatically.",
  keywords: [
    "AI",
    "documentation",
    "standard",
    "AI coding agents",
    "project context",
    "developer tools",
    "agent-ready",
    "ARDS",
  ],
  openGraph: {
    title: "SurfContext - The Open Standard for Agent-Ready Project Documentation",
    description:
      "One format. Every AI coding agent. Define your project context once — all major AI coding agents understand it automatically.",
    url: "https://surfcontext.org",
    siteName: "SurfContext",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SurfContext",
    description: "The open standard for agent-ready project documentation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('surfcontext-theme');
                if (theme) {
                  document.documentElement.setAttribute('data-theme', theme);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Nav />
          <main className="pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
