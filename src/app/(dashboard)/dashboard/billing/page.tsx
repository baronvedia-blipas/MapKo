"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useProfile } from "@/components/providers/profile-provider";
import type { PlanTier } from "@/types";
import { cn } from "@/lib/utils";

interface PlanInfo {
  name: string;
  tier: PlanTier;
  price: number;
  icon: React.ReactNode;
  features: string[];
}

const PLANS: PlanInfo[] = [
  {
    name: "Free",
    tier: "free",
    price: 0,
    icon: <Zap className="h-6 w-6" />,
    features: [
      "1 scan per month",
      "25 results per scan",
      "CSV export",
    ],
  },
  {
    name: "Pro",
    tier: "pro",
    price: 49,
    icon: <Sparkles className="h-6 w-6" />,
    features: [
      "Unlimited scans",
      "Unlimited results",
      "CSV + XLSX export",
      "Website analysis",
      "Saved history",
    ],
  },
  {
    name: "Agency",
    tier: "agency",
    price: 99,
    icon: <Building2 className="h-6 w-6" />,
    features: [
      "Everything in Pro",
      "API access",
      "White-label reports",
      "Team collaboration",
      "Custom templates",
    ],
  },
];

export default function BillingPage() {
  const { profile, loading } = useProfile();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = useCallback(async (planId: "pro" | "agency") => {
    setCheckoutLoading(planId);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setCheckoutLoading(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentPlan = profile?.plan ?? "free";
  const currentPlanInfo = PLANS.find((p) => p.tier === currentPlan)!;
  const scansUsed = profile?.scans_this_month ?? 0;
  const scansLimit =
    currentPlan === "free" ? 1 : -1;
  const isUnlimited = scansLimit === -1;
  const usagePercent = isUnlimited ? 0 : Math.min((scansUsed / scansLimit) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plan</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and usage
        </p>
        {checkoutError && (
          <p className="text-red-400 text-sm mt-2">{checkoutError}</p>
        )}
      </div>

      {/* Current Plan Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-blue-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-400" />
                Current Plan
              </CardTitle>
              <Badge className="bg-blue-400/10 text-blue-400 border-blue-400/20">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold">{currentPlanInfo.name}</h2>
              <p className="text-muted-foreground">
                {currentPlanInfo.price === 0 ? (
                  "Free forever"
                ) : (
                  <>
                    <span className="text-2xl font-semibold text-foreground">
                      ${currentPlanInfo.price}
                    </span>
                    /month
                  </>
                )}
              </p>
            </div>
            {currentPlan !== "free" && (
              <Button
                variant="outline"
                className="mt-4"
                disabled={checkoutLoading === currentPlan}
                onClick={() =>
                  handleCheckout(currentPlan as "pro" | "agency")
                }
              >
                {checkoutLoading === currentPlan && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Manage Subscription
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>Scans used in the current billing period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold">{scansUsed}</span>
                <span className="text-muted-foreground ml-1">
                  / {isUnlimited ? "Unlimited" : scansLimit}
                </span>
              </div>
              {!isUnlimited && (
                <span className="text-sm text-muted-foreground">
                  {Math.round(usagePercent)}% used
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isUnlimited
                    ? "bg-blue-500 w-[5%]"
                    : usagePercent >= 90
                    ? "bg-red-500"
                    : usagePercent >= 60
                    ? "bg-amber-500"
                    : "bg-blue-500"
                )}
                style={isUnlimited ? undefined : { width: `${usagePercent}%` }}
              />
            </div>
            {isUnlimited && (
              <p className="text-sm text-muted-foreground">
                Unlimited scans on your {currentPlanInfo.name} plan
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Compare Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.tier === currentPlan;
            return (
              <Card
                key={plan.tier}
                className={cn(
                  "glass glass-hover relative",
                  isCurrent && "border-blue-500/50 shadow-blue-500/10 shadow-lg"
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white border-0">
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="mx-auto mb-2 text-blue-400">{plan.icon}</div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/mo</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="justify-center pb-6">
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.tier === "pro" ? "default" : "outline"}
                      disabled={checkoutLoading === plan.tier || plan.tier === "free"}
                      onClick={() =>
                        handleCheckout(plan.tier as "pro" | "agency")
                      }
                    >
                      {checkoutLoading === plan.tier && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {plan.tier === "free" ? "Downgrade" : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
