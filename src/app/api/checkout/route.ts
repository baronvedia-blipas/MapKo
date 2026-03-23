import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, PLAN_PRICE_IDS, type StripePlanId } from "@/lib/stripe/client";

/**
 * POST /api/checkout — Create a Stripe Checkout Session for plan upgrade.
 *
 * Body: { planId: "pro" | "agency" }
 * Returns: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    // ── Authenticate ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Validate body ─────────────────────────────────────────────
    const body = await req.json();
    const { planId } = body as { planId: string };

    if (!planId || !(planId in PLAN_PRICE_IDS)) {
      return NextResponse.json(
        { error: "Invalid planId. Must be one of: pro, agency" },
        { status: 400 }
      );
    }

    // ── Create Stripe Checkout Session ────────────────────────────
    const url = await createCheckoutSession(user.id, planId as StripePlanId);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[checkout] Error creating session:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
