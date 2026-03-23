import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/scans/[id]/delete — Delete a scan and all related data.
 * CASCADE on foreign keys handles businesses and analyses.
 */
export async function DELETE(
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

  // Verify the scan belongs to the user
  const { data: scan, error: fetchError } = await supabase
    .from("scans")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  // Delete the scan (CASCADE will handle businesses and analyses)
  const { error: deleteError } = await supabase
    .from("scans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete scan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
