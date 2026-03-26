"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CREDIT_PACKAGES, FREE_STARTER_CREDITS } from "@/lib/billing-config";
import { useCreditsStore } from "@/lib/credits-store";
import { useSession } from "@/lib/auth-client";
import { signInWithGoogle } from "@/lib/google-sign-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Check, CreditCard, Loader2, Star, Zap } from "lucide-react";

type InitPaymentResponse = {
  publicKey: string;
  reference: string;
  email: string;
  amountKobo: number;
  packageId: string;
  credits: number;
  amountNaira: number;
};

type VerifyPaymentResponse = {
  success: boolean;
  credits: number;
  credited: number;
};

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const credits = useCreditsStore((state) => state.credits);
  const loadingCredits = useCreditsStore((state) => state.loading);
  const clearCredits = useCreditsStore((state) => state.clearCredits);
  const refreshCredits = useCreditsStore((state) => state.refreshCredits);
  const setCredits = useCreditsStore((state) => state.setCredits);
  const [busyPackage, setBusyPackage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      clearCredits();
      return;
    }
    void refreshCredits(session.user.id);
  }, [clearCredits, refreshCredits, session?.user?.id]);

  const plans = useMemo(
    () =>
      CREDIT_PACKAGES.map((pkg) => ({
        ...pkg,
        perCredit: Math.ceil(pkg.amountNaira / pkg.credits),
      })),
    [],
  );

  async function startCheckout(packageId: string) {
    if (!session?.user?.id) {
      signInWithGoogle("/pricing");
      return;
    }
    const userId = session.user.id;

    setBusyPackage(packageId);
    toast.message("Starting payment...");

    try {
      const initRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const initData = (await initRes.json()) as
        | InitPaymentResponse
        | { error: string };
      if (!initRes.ok || !("reference" in initData)) {
        toast.error(
          "Could not initialize payment. Try again.",
        );
        return;
      }

      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();

      popup.newTransaction({
        key: initData.publicKey,
        email: initData.email,
        amount: initData.amountKobo,
        reference: initData.reference,
        ref: initData.reference,
        onSuccess: async () => {
          toast.message("Verifying payment...");
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: initData.reference }),
          });
          const verifyData = (await verifyRes.json()) as
            | VerifyPaymentResponse
            | { error: string };

          if (!verifyRes.ok || !("success" in verifyData)) {
            toast.error("Payment received but verification failed. Contact support.");
            return;
          }

          setCredits(verifyData.credits);
          await refreshCredits(userId);
          toast.success(`Payment successful. Added ${verifyData.credited} credits.`);
          router.push("/");
        },
        onCancel: () => {
          toast.info("Payment cancelled.");
        },
      });
    } catch {
      toast.error("Payment failed to start. Please retry.");
    } finally {
      setBusyPackage(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-3 py-8 sm:px-4 sm:py-10">
      <div className="mb-2">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Back to app
          </Link>
        </Button>
      </div>

      <header className="space-y-4 text-center sm:text-left">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pricing
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Buy credits when you need more diagrams
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:mx-0 sm:text-base">
            New accounts get {FREE_STARTER_CREDITS} free credits. Signed-in users only pay for
            successful generations—no subscription.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm">
            <CreditCard className="size-4 shrink-0 text-primary" aria-hidden />
            {session?.user?.id ? (
              <span>
                Balance:{" "}
                <span className="font-medium text-foreground">
                  {loadingCredits ? (
                    <span className="inline-flex items-center gap-1 align-middle">
                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
                      Loading credits
                    </span>
                  ) : (
                    `${credits === null ? "…" : credits} credits`
                  )}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Sign in to see your balance</span>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        {plans.map((pkg) => (
          <Card
            key={pkg.id}
            className={
              pkg.popular
                ? "relative overflow-visible border-primary/40 ring-1 ring-primary/25"
                : undefined
            }
          >
            {pkg.popular ? (
              <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                <Badge className="gap-1 border-primary/20 px-2.5 py-0.5 shadow-none">
                  <Star className="size-3" aria-hidden />
                  Best value
                </Badge>
              </div>
            ) : null}

            <CardHeader className="pb-2 text-center sm:pb-4 sm:text-left">
              <CardTitle className="text-xl">{pkg.label}</CardTitle>
              {pkg.description ? (
                <CardDescription>{pkg.description}</CardDescription>
              ) : null}
              <div className="mt-3 space-y-0.5">
                <p className="text-3xl font-semibold text-foreground">
                  ₦{pkg.amountNaira.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pkg.credits} credits · ~₦{pkg.perCredit} per credit
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {pkg.highlights?.length ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {pkg.highlights.map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>

            <CardFooter className="border-border border-t pt-6 pb-6">
              <Button
                type="button"
                variant={pkg.popular ? "default" : "outline"}
                size="lg"
                className="min-h-11 w-full gap-2"
                onClick={() => void startCheckout(pkg.id)}
                disabled={busyPackage === pkg.id}
              >
                {busyPackage === pkg.id ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Zap className="size-4" aria-hidden />
                    Pay ₦{pkg.amountNaira.toLocaleString()}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section
        aria-labelledby="credit-costs-heading"
        className="mx-auto max-w-2xl rounded-xl border border-border bg-muted/25 px-4 py-4 text-left sm:mx-0"
      >
        <h2 id="credit-costs-heading" className="mb-2 text-sm font-semibold text-foreground">
          How credits work
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-0.5 text-primary" aria-hidden>
              •
            </span>
            <span>
              <strong className="font-medium text-foreground">Generate</strong> — 1 credit per
              successful diagram response from the AI.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-primary" aria-hidden>
              •
            </span>
            <span>
              <strong className="font-medium text-foreground">Repair</strong> — fixing a broken
              Mermaid diagram with &quot;Fix with AI&quot; does not use credits.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-primary" aria-hidden>
              •
            </span>
            <span>
              <strong className="font-medium text-foreground">Exports</strong> — downloading
              SVG or PNG is included; only generation consumes credits.
            </span>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p>
          Need help? Reach us at{" "}
          <a
            href="mailto:monoedafrica@gmail.com"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            monoedafrica[at]gmail.com
          </a>{" "}
          or WhatsApp{" "}
          <a
            href="https://wa.me/234814069712"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            +234&nbsp;814&nbsp;069&nbsp;712
          </a>
          .
        </p>
      </section>
    </div>
  );
}
