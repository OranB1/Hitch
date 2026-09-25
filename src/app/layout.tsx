import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { GlobalToastRegion } from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const TITLE = "Hitch — Get your QIP, audit, or research project done.";
const DESCRIPTION =
  "A structured marketplace matching hospitals and consultants with medical students and foundation doctors for QIPs, audits, research, and presentations.";

export const metadata: Metadata = {
  metadataBase: new URL("https://hitch.health"),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/brand/og-image-1200x630.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/og-image-1200x630.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-void text-mist">
        <NavBar />
        {children}
        <Footer />
        <GlobalToastRegion />
      </body>
    </html>
  );
}
