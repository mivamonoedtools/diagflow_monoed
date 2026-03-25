import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Buy Diagflow credits to keep generating flowcharts and diagrams from plain language. Simple packs for occasional or heavy use.",
};

export default function PricingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
