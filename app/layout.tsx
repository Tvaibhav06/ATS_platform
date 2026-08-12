import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "TalentFlow — AI Recruitment OS",
  description: "AI-powered applicant tracking system with explainable candidate matching.",
};

import { AuthProvider } from "@/components/auth-provider";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
