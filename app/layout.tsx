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

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Diagflow — AI flowchart & diagram generator",
    template: "%s · Diagflow",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
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
