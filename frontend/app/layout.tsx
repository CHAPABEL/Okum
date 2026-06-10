import type { Metadata } from "next";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLOW",
  description: "Единое рабочее пространство для разработки",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
