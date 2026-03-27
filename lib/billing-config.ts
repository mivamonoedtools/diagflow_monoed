export type CreditPackage = {
  id: "starter-5" | "value-10";
  label: string;
  amountNaira: number;
  credits: number;
  /** One line shown under the plan name */
  description?: string;
  /** Short bullets for the pricing card */
  highlights?: string[];
  /** Highlight as recommended tier (border + badge) */
  popular?: boolean;
};

export const FREE_STARTER_CREDITS = 3;

/** Short slug used in Paystack payment references (e.g. diagflow-basic-…). */
export const CREDIT_PACKAGE_PAYMENT_SLUG: Record<CreditPackage["id"], string> = {
  "starter-5": "basic",
  "value-10": "pro",
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter-5",
    label: "Basic",
    amountNaira: 500,
    credits: 5,
    description: "Try the tool on a few real diagrams.",
    highlights: [
      "5 diagram generations",
      "Flowcharts, sequences, Gantt, and more",
      "SVG & PNG export",
    ],
  },
  {
    id: "value-10",
    label: "Pro",
    amountNaira: 900,
    credits: 10,
    popular: true,
    description: "Best per-credit price for regular use.",
    highlights: [
      "10 diagram generations",
      "Same exports and diagram kinds",
      "Lower cost per credit than Basic",
    ],
  },
];

export function getCreditPackageById(id: string): CreditPackage | null {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id) ?? null;
}
