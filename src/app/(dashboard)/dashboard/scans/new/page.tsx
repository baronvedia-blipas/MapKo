"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Radar, MapPin, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LocationAutocomplete } from "@/components/scan/location-autocomplete";
import { ScanPreviewMap } from "@/components/scan/scan-preview-map";
import { Spinner } from "@/components/ui/spinner";
import { useProfile } from "@/components/providers/profile-provider";
import { BUSINESS_CATEGORIES, PLAN_LIMITS, type PlanTier } from "@/types";
import { cn } from "@/lib/utils";

export default function NewScanPage() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(2);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile, loading } = useProfile();

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!queryText.trim()) {
      setError("Please enter a location to scan.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/scans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryText: queryText.trim(),
          placeId: selectedPlaceId,
          radiusKm,
          categories: selectedCategories,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to create scan");
      router.push(`/dashboard/scans/${data.scan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const plan = (profile?.plan || "free") as PlanTier;
  const limits = PLAN_LIMITS[plan];
  const scansUsed = profile?.scans_this_month || 0;
  const scansLimit = limits.scansPerMonth === -1 ? "Unlimited" : limits.scansPerMonth;
  const atLimit = limits.scansPerMonth !== -1 && scansUsed >= limits.scansPerMonth;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">New Scan</h1>
        <p className="text-muted-foreground mt-1">
          Discover businesses in a target area and analyze their digital presence.
        </p>
      </div>

      {/* Plan usage */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-xl px-4 py-3 bg-card/60 border border-border/60">
        <Info className="h-4 w-4 shrink-0 text-blue-400" />
        <span>
          {scansUsed} of {scansLimit} scans used this month
          {atLimit && (
            <span className="text-amber-400 ml-1">— Upgrade your plan for more scans.</span>
          )}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Location */}
        <div className="relative z-20">
          <div className="rounded-xl bg-card/60 border border-border/60 p-5 overflow-visible">
            <label className="text-sm font-medium flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-blue-400" />
              Location
            </label>
            <LocationAutocomplete
              value={queryText}
              onChange={async (value, placeId) => {
                setQueryText(value);
                setSelectedPlaceId(placeId);
                if (placeId) {
                  try {
                    const res = await fetch(`/api/places/geocode?placeId=${encodeURIComponent(placeId)}`);
                    const data = await res.json();
                    if (data.lat != null && data.lng != null) setCenterCoords({ lat: data.lat, lng: data.lng });
                  } catch { /* silent */ }
                } else {
                  setCenterCoords(null);
                }
              }}
              placeholder="Search city or neighborhood in LATAM..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              Bolivia, Peru, Argentina, Chile, Colombia, Mexico, Paraguay, Uruguay
            </p>
          </div>
        </div>

        {/* Map preview */}
        {centerCoords ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl overflow-hidden border border-border/60"
          >
            <ScanPreviewMap center={centerCoords} radiusKm={radiusKm} />
          </motion.div>
        ) : (
          <div className="h-[200px] rounded-xl bg-card/40 border border-dashed border-border/60 flex flex-col items-center justify-center gap-2">
            <MapPin className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground/60">Select a location to preview the scan area</p>
          </div>
        )}

        {/* Radius */}
        <div className="rounded-xl bg-card/60 border border-border/60 p-5">
          <label className="text-sm font-medium mb-3 block">Search Radius</label>
          <Slider
            min={0.5}
            max={10}
            step={0.5}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            label="Radius"
            showValue
            unit=" km"
          />
        </div>

        {/* Categories */}
        <div className="rounded-xl bg-card/60 border border-border/60 p-5">
          <label className="text-sm font-medium mb-1 block">Business Categories</label>
          <p className="text-xs text-muted-foreground mb-4">
            Select types to scan, or leave empty for all categories.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.keys(BUSINESS_CATEGORIES).map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 border",
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "bg-card/40 border-border/40 text-muted-foreground hover:bg-card/80 hover:border-border hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all",
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          size="xl"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 glow-blue"
          disabled={submitting || atLimit}
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="text-white" />
              Creating Scan...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Start Scan
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
