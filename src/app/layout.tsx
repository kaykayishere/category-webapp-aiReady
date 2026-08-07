import type { Metadata } from "next";
import { TopBar } from "@/components/TopBar";
import { CATEGORY } from "@/config/category";
import "./globals.css";

export const metadata: Metadata = {
  title: CATEGORY.title,
  description: CATEGORY.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
