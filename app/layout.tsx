import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SupportWhatsAppBubble } from "@/components/support-whatsapp-bubble";
import { Toaster } from "sonner";
import { getMetadataBase, getSiteOrigin, SITE_DESCRIPTION } from "@/lib/site-url";

const circularBook = localFont({
  src: "./fonts/Circular_Std_Book.ttf",
  variable: "--font-circular-book", // Define variable for Tailwind
});

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
  "https://diagflow.monoed.africa";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Diagflow — AI flowchart & diagram generator",
    template: "%s · Diagflow by MonoEd",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "MonoEd Africa", url: `${BASE_URL}/about` }],
  creator: "MonoEd Africa",
  applicationName: "MonoEd Africa",
  publisher: "MonoEd Africa",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Diagflow",
    title: "Diagflow — AI flowchart & diagram generator",
    description: SITE_DESCRIPTION,
    url: getSiteOrigin(),
  },
  twitter: {
    card: "summary",
    title: "Diagflow — AI flowchart & diagram generator",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/favicon.ico", sizes: "180x180", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className={`${circularBook.variable} font-sans antialiased min-h-full flex flex-col`}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <SupportWhatsAppBubble />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
