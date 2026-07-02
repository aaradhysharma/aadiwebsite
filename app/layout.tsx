import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Aaradhy Sharma — AI Engineer",
  description:
    "AI agents in production. Infrastructure that survives them. The journey from Indore to Northeastern to ChenMed, mapped in 3D.",
  openGraph: {
    title: "Aaradhy Sharma — AI Engineer",
    description:
      "AI agents in production. Infrastructure that survives them. Six years, six cities, mapped in 3D.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} grain antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
