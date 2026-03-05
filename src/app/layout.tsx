import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "שקדול - השפה החדשה שהיא רק שלנו!",
  description: "שקדול, השפה החדשה שהיא רק שלנו! בואו להמציא מילים ולבנות שפה ביחד.",
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
        <meta name="theme-color" content="#e67e22" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen mesh-bg text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] focus:bg-orange-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
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
