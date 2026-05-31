import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "QUELVES | AI-Driven Business Transformation",
    template: "%s | QUELVES",
  },
  description: "Transforming organizations through AI, Digital Platforms and Enterprise Architecture. Technology leadership, research and innovation for the autonomous enterprise era.",
  keywords: ["AI", "Digital Transformation", "Enterprise Architecture", "Autonomous Systems", "Technology Executive", "LATAM"],
  authors: [{ name: "Luiz Quelves Da Silva" }],
  openGraph: {
    title: "QUELVES | AI-Driven Business Transformation",
    description: "Transforming organizations through AI, Digital Platforms and Enterprise Architecture.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
