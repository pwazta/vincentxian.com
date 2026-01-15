import "~/styles/globals.css";

import { type Metadata } from "next";
import { Albert_Sans, Aleo, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "vx.dev",
  description: "Vincent's stuff ^^",
  icons: [{ rel: "icon", url: "/logo.svg" }],
};

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const aleo = Aleo({
  subsets: ["latin"],
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${aleo.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
