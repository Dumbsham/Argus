import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";
import { GlobalAlerts } from "@/components/alerts/GlobalAlerts";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Argus | See Everything",
  description: "Internal fraud and risk operations terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-primary overflow-hidden`}>
        <Shell>
          {children}
        </Shell>
        <GlobalAlerts />
      </body>
    </html>
  );
}
