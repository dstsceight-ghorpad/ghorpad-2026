import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";
import SecurityShield from "@/components/SecurityShield";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GHORPAD 2026 | MILIT - DSTSC 08",
  description:
    "The official college magazine of MILIT - DSTSC 08. Where campus speaks to the world.",
  keywords: ["college magazine", "GHORPAD", "MILIT", "DSTSC 08", "campus"],
};

// Inline script to prevent flash of wrong theme on page load
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('ghorpad_theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        <SecurityShield />
        <ThemeProvider>
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
