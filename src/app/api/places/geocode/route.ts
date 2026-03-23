import { NextRequest, NextResponse } from "next/server";
import { geocodePlaceId } from "@/lib/google/places-client";

/**
 * GET /api/places/geocode?placeId=ChIJ...
 * Returns lat/lng coordinates for a Google Place ID.
 */
export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "placeId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await geocodePlaceId(placeId);

    if (!result) {
      return NextResponse.json(
        { error: "Could not geocode the given place ID" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lat: result.lat,
      lng: result.lng,
      formattedAddress: result.formattedAddress,
    });
  } catch (e) {
    console.error("Geocode error:", e);
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 500 }
    );
  }
}
