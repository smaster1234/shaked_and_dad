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
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
