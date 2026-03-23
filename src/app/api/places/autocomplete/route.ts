import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

/**
 * GET /api/places/autocomplete?q=santa+cruz
 * Returns place suggestions restricted to LATAM countries.
 * Requires authentication. Rate limited to 10 requests/second per user.
 */

// ── In-memory rate limiter ───────────────────────────────────
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 1000; // 1 second
const RATE_LIMIT_MAX = 10; // max requests per window

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) ?? [];
  // Remove timestamps outside the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(userId, recent);
    return true;
  }
  recent.push(now);
  rateLimitMap.set(userId, recent);
  return false;
}

const ALLOWED_COUNTRIES = [
  "bo", // Bolivia (priority)
  "pe", // Peru
  "ar", // Argentina
  "cl", // Chile
  "co", // Colombia
  "mx", // Mexico
  "py", // Paraguay
  "uy", // Uruguay
];

export async function GET(req: NextRequest) {
  // ── Auth check ─────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Rate limiting ──────────────────────────────────────────
  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  // Google Places Autocomplete with country restrictions
  // Note: max 5 countries per request, so we split into batches and merge
  const predictions: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  // Batch 1: Bolivia + neighboring countries (priority)
  const batch1 = ALLOWED_COUNTRIES.slice(0, 5);
  // Batch 2: remaining countries
  const batch2 = ALLOWED_COUNTRIES.slice(5);

  for (const countries of [batch1, batch2]) {
    if (countries.length === 0) continue;

    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    );
    url.searchParams.set("input", query);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("types", "(regions)");
    url.searchParams.set(
      "components",
      countries.map((c) => `country:${c}`).join("|")
    );
    // Bias results toward Bolivia (Santa Cruz de la Sierra)
    url.searchParams.set("location", "-17.783,-63.182");
    url.searchParams.set("radius", "500000"); // 500km bias radius

    try {
      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.status === "OK" && data.predictions) {
        for (const p of data.predictions) {
          if (!seen.has(p.place_id)) {
            seen.add(p.place_id);
            predictions.push({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting?.main_text || p.description,
              secondaryText: p.structured_formatting?.secondary_text || "",
            });
          }
        }
      }
    } catch (e) {
      console.error("Autocomplete batch failed:", e);
    }
  }

  return NextResponse.json({ predictions: predictions.slice(0, 8) });
}
