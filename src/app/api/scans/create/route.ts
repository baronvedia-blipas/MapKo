import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeAddress, geocodePlaceId } from "@/lib/google/places-client";
import { PLAN_LIMITS, type PlanTier } from "@/types";
import { z } from "zod";

const createScanSchema = z.object({
  queryText: z.string().min(2).max(200),
  placeId: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radiusKm: z.number().min(0.5).max(50).default(2),
  categories: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body = await req.json();
    const parsed = createScanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { queryText, placeId, radiusKm, categories } = parsed.data;
    let { lat, lng } = parsed.data;

    // Check plan limits
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("plan, scans_this_month")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const plan = profile.plan as PlanTier;
    const limits = PLAN_LIMITS[plan];

    if (
      limits.scansPerMonth !== -1 &&
      profile.scans_this_month >= limits.scansPerMonth
    ) {
      return NextResponse.json(
        {
          error: "Scan limit reached",
          message: `Your ${plan} plan allows ${limits.scansPerMonth} scan(s) per month. Upgrade to Pro for unlimited scans.`,
        },
        { status: 403 }
      );
    }

    // Geocode if coordinates not provided
    if (lat === undefined || lng === undefined) {
      // Prefer placeId geocoding (from autocomplete) — more precise
      const geo = placeId
        ? await geocodePlaceId(placeId)
        : await geocodeAddress(queryText);
      if (!geo) {
        return NextResponse.json(
          { error: "Could not geocode location. Try a more specific address." },
          { status: 400 }
        );
      }
      lat = geo.lat;
      lng = geo.lng;
    }

    // Create scan record
    const { data: scan, error: scanError } = await admin
      .from("scans")
      .insert({
        user_id: user.id,
        query_text: queryText,
        lat,
        lng,
        radius_km: radiusKm,
        categories,
        status: "queued",
      })
      .select()
      .single();

    if (scanError) {
      console.error("Failed to create scan:", scanError);
      return NextResponse.json(
        { error: "Failed to create scan" },
        { status: 500 }
      );
    }

    // Increment scan count
    await admin
      .from("profiles")
      .update({ scans_this_month: profile.scans_this_month + 1 })
      .eq("user_id", user.id);

    // Trigger async processing (fire-and-forget)
    // Use AbortController with 10 min timeout for large scans
    const processingUrl = new URL("/api/scans/process", req.url);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600_000); // 10 min

      const processRes = fetch(processingUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({ scanId: scan.id }),
        signal: controller.signal,
      });

      processRes
        .then(() => clearTimeout(timeout))
        .catch(async (err) => {
          clearTimeout(timeout);
          if (err.name === "AbortError") return; // timeout — scan may still complete via admin
          console.error("Fire-and-forget scan processing failed:", err);
          const failAdmin = createAdminClient();
          await failAdmin
            .from("scans")
            .update({
              status: "failed",
              error_message: `Processing request failed: ${err instanceof Error ? err.message : "Unknown error"}`,
            })
            .eq("id", scan.id);
        });
    } catch (err) {
      console.error("Failed to initiate scan processing:", err);
    }

    return NextResponse.json({ scan }, { status: 201 });
  } catch (error) {
    console.error("Scan creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
