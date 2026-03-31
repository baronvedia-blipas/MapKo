import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/scans/[id] — Get scan details with businesses and analyses.
 * Used for polling status and loading scan results.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get scan — try with share fields first, fallback without them
  let scan;
  const { data: scanData, error } = await supabase
    .from("scans")
    .select("id, query_text, status, lat, lng, radius_km, categories, total_businesses, error_message, share_token, is_public, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error && error.message?.includes("share_token")) {
    // share columns not yet added — query without them
    const { data: fallback } = await supabase
      .from("scans")
      .select("id, query_text, status, lat, lng, radius_km, categories, total_businesses, error_message, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    scan = fallback ? { ...fallback, share_token: null, is_public: false } : null;
  } else {
    scan = scanData;
  }

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  // Get businesses with analyses — try with CRM fields, fallback without
  let businesses;
  const { data: bizData, error: bizError } = await supabase
    .from("businesses")
    .select(`id, scan_id, place_id, name, address, lat, lng, category, phone, website_url, rating, review_count, photo_count, business_status, lead_status, notes, last_contacted_at, google_data, created_at, analysis:analyses(id, business_id, has_website, website_ssl, website_responsive, website_load_time_ms, website_tech, has_social_media, social_links, review_response_rate, has_booking, has_whatsapp, profile_completeness, opportunity_score, recommendations, analyzed_at)`)
    .eq("scan_id", id)
    .order("created_at", { ascending: true });

  if (bizError && bizError.message?.includes("lead_status")) {
    const { data: fallbackBiz } = await supabase
      .from("businesses")
      .select(`id, scan_id, place_id, name, address, lat, lng, category, phone, website_url, rating, review_count, photo_count, business_status, google_data, created_at, analysis:analyses(id, business_id, has_website, website_ssl, website_responsive, website_load_time_ms, website_tech, has_social_media, social_links, review_response_rate, has_booking, has_whatsapp, profile_completeness, opportunity_score, recommendations, analyzed_at)`)
      .eq("scan_id", id)
      .order("created_at", { ascending: true });
    businesses = fallbackBiz?.map((b) => ({ ...b, lead_status: "new", notes: null, last_contacted_at: null }));
  } else {
    businesses = bizData;
  }

  const cacheHeader = scan.status === "completed"
    ? "private, max-age=60"
    : "no-store";

  return NextResponse.json({
    scan,
    businesses: businesses?.map((b) => ({
      ...b,
      analysis: Array.isArray(b.analysis) ? b.analysis[0] || null : b.analysis,
    })) || [],
  }, {
    headers: { "Cache-Control": cacheHeader },
  });
}
