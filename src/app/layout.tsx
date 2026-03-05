import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "שקדול - המילון שאנחנו בונים יחד!",
  description: "בואו להמציא מילים חדשות ולבנות שפה חדשה ומיוחדת יחד!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#d97706" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] focus:bg-amber-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          דלגו לתוכן הראשי
        </a>
        <Providers>
          <Navbar />
          <main id="main-content" role="main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
