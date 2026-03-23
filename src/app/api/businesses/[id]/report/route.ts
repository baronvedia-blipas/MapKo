import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsPDF } from "jspdf";
import type { BusinessWithAnalysis } from "@/types";

// ─── Color palette ──────────────────────────────────────────
const DARK_BLUE = [15, 23, 42] as const;   // #0f172a
const WHITE = [255, 255, 255] as const;
const GOLD = [201, 168, 76] as const;       // #c9a84c
const LIGHT_GRAY = [241, 245, 249] as const;
const MID_GRAY = [148, 163, 184] as const;
const DARK_TEXT = [30, 41, 59] as const;
const GREEN = [34, 197, 94] as const;
const RED = [239, 68, 68] as const;
const AMBER = [245, 158, 11] as const;

type RGB = readonly [number, number, number];

function setColor(doc: jsPDF, rgb: RGB) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function setFillColor(doc: jsPDF, rgb: RGB) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setDrawColor(doc: jsPDF, rgb: RGB) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function getScoreColorRGB(score: number): RGB {
  if (score >= 70) return RED;
  if (score >= 40) return AMBER;
  return GREEN;
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "High Opportunity";
  if (score >= 40) return "Medium Opportunity";
  return "Low Opportunity";
}

function drawSectionHeader(doc: jsPDF, y: number, title: string, pageWidth: number): number {
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  setFillColor(doc, DARK_BLUE);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(doc, WHITE);
  doc.text(title, margin + 6, y + 7);

  return y + 16;
}

function drawBoolRow(doc: jsPDF, y: number, label: string, value: boolean, detail: string | null, margin: number, contentWidth: number): number {
  const rowHeight = detail ? 14 : 10;

  // Alternating background
  setFillColor(doc, LIGHT_GRAY);
  doc.roundedRect(margin, y, contentWidth, rowHeight, 1, 1, "F");

  // Indicator circle
  const circleColor = value ? GREEN : RED;
  setFillColor(doc, circleColor);
  doc.circle(margin + 8, y + 5, 3, "F");
  setColor(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(value ? "Y" : "N", margin + 8, y + 5.8, { align: "center" });

  // Label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setColor(doc, DARK_TEXT);
  doc.text(label, margin + 16, y + 6);

  // Value text
  doc.setFont("helvetica", "bold");
  setColor(doc, value ? GREEN : RED);
  doc.text(value ? "Yes" : "No", margin + contentWidth - 6, y + 6, { align: "right" });

  // Detail line
  if (detail) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(doc, MID_GRAY);
    const truncated = detail.length > 80 ? detail.slice(0, 77) + "..." : detail;
    doc.text(truncated, margin + 16, y + 12);
  }

  return y + rowHeight + 2;
}

function drawPercentRow(doc: jsPDF, y: number, label: string, value: number, margin: number, contentWidth: number): number {
  const pct = Math.round(value * 100);

  setFillColor(doc, LIGHT_GRAY);
  doc.roundedRect(margin, y, contentWidth, 14, 1, 1, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setColor(doc, DARK_TEXT);
  doc.text(label, margin + 6, y + 6);

  doc.setFont("helvetica", "bold");
  doc.text(`${pct}%`, margin + contentWidth - 6, y + 6, { align: "right" });

  // Progress bar
  const barX = margin + 6;
  const barY = y + 9;
  const barWidth = contentWidth - 12;
  const barHeight = 3;

  setFillColor(doc, [226, 232, 240]);
  doc.roundedRect(barX, barY, barWidth, barHeight, 1.5, 1.5, "F");

  const fillColor: RGB = pct >= 70 ? GREEN : pct >= 40 ? AMBER : RED;
  setFillColor(doc, fillColor);
  const fillWidth = (barWidth * pct) / 100;
  if (fillWidth > 0) {
    doc.roundedRect(barX, barY, Math.max(fillWidth, 3), barHeight, 1.5, 1.5, "F");
  }

  return y + 18;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return 20;
  }
  return y;
}

function generatePDF(business: BusinessWithAnalysis): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  const analysis = business.analysis;
  const score = analysis?.opportunity_score ?? 0;

  // ─── Header bar ────────────────────────────────────────────
  setFillColor(doc, DARK_BLUE);
  doc.rect(0, 0, pageWidth, 36, "F");

  // Gold accent line
  setFillColor(doc, GOLD);
  doc.rect(0, 36, pageWidth, 1.5, "F");

  // Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  setColor(doc, WHITE);
  doc.text("MapKo", margin, 16);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setColor(doc, [148, 163, 184]);
  doc.text("Digital Presence Report", margin, 23);

  // Date
  doc.setFontSize(9);
  setColor(doc, MID_GRAY);
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(dateStr, pageWidth - margin, 16, { align: "right" });

  let y = 46;

  // ─── Business Info ─────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setColor(doc, DARK_TEXT);
  doc.text(business.name, margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setColor(doc, MID_GRAY);
  doc.text(business.address, margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.text(`Category: ${business.category}`, margin, y);
  y += 5;

  if (business.rating !== null) {
    doc.text(
      `Rating: ${business.rating.toFixed(1)} / 5.0  (${business.review_count} reviews)`,
      margin,
      y
    );
    y += 5;
  }

  if (business.phone) {
    doc.text(`Phone: ${business.phone}`, margin, y);
    y += 5;
  }

  if (business.website_url) {
    doc.text(`Website: ${business.website_url}`, margin, y);
    y += 5;
  }

  y += 4;

  // ─── Opportunity Score ─────────────────────────────────────
  const scoreBoxHeight = 32;
  setFillColor(doc, LIGHT_GRAY);
  doc.roundedRect(margin, y, contentWidth, scoreBoxHeight, 3, 3, "F");

  // Score border accent
  const scoreRGB = getScoreColorRGB(score);
  setDrawColor(doc, scoreRGB);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, scoreBoxHeight, 3, 3, "S");

  // Score number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  setColor(doc, scoreRGB);
  doc.text(score.toString(), margin + 20, y + 22, { align: "center" });

  // Score label
  doc.setFontSize(14);
  doc.text(getScoreLabel(score), margin + 36, y + 16);

  // Explanation
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setColor(doc, MID_GRAY);
  doc.text(
    "Opportunity Score measures how much a business could benefit from improved digital presence.",
    margin + 36,
    y + 24
  );

  y += scoreBoxHeight + 10;

  // ─── Digital Presence Audit ────────────────────────────────
  if (analysis) {
    y = checkPageBreak(doc, y, 80);
    y = drawSectionHeader(doc, y, "Digital Presence Audit", pageWidth);

    y = drawBoolRow(doc, y, "Website", analysis.has_website, business.website_url, margin, contentWidth);
    if (analysis.has_website) {
      y = drawBoolRow(doc, y, "SSL Certificate (HTTPS)", analysis.website_ssl, null, margin, contentWidth);
      y = drawBoolRow(doc, y, "Mobile Responsive", analysis.website_responsive, null, margin, contentWidth);

      if (analysis.website_tech) {
        y = checkPageBreak(doc, y, 14);
        setFillColor(doc, LIGHT_GRAY);
        doc.roundedRect(margin, y, contentWidth, 10, 1, 1, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        setColor(doc, DARK_TEXT);
        doc.text("Technology", margin + 6, y + 6);
        doc.setFont("helvetica", "bold");
        setColor(doc, MID_GRAY);
        doc.text(analysis.website_tech, margin + contentWidth - 6, y + 6, { align: "right" });
        y += 12;
      }

      if (analysis.website_load_time_ms !== null) {
        y = checkPageBreak(doc, y, 14);
        setFillColor(doc, LIGHT_GRAY);
        doc.roundedRect(margin, y, contentWidth, 10, 1, 1, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        setColor(doc, DARK_TEXT);
        doc.text("Load Time", margin + 6, y + 6);
        doc.setFont("helvetica", "bold");
        const loadColor: RGB = analysis.website_load_time_ms < 2000 ? GREEN : analysis.website_load_time_ms < 4000 ? AMBER : RED;
        setColor(doc, loadColor);
        doc.text(`${analysis.website_load_time_ms}ms`, margin + contentWidth - 6, y + 6, { align: "right" });
        y += 12;
      }
    }

    y = checkPageBreak(doc, y, 14);

    // Social media
    const socialLinks = analysis.social_links ?? {};
    const socialPlatforms = Object.keys(socialLinks);
    const socialDetail = socialPlatforms.length > 0 ? socialPlatforms.join(", ") : null;
    y = drawBoolRow(doc, y, "Social Media", analysis.has_social_media, socialDetail, margin, contentWidth);

    y = drawBoolRow(doc, y, "Online Booking", analysis.has_booking, null, margin, contentWidth);
    y = drawBoolRow(doc, y, "WhatsApp", analysis.has_whatsapp, null, margin, contentWidth);

    y += 4;
    y = checkPageBreak(doc, y, 40);

    y = drawPercentRow(doc, y, "Review Response Rate", analysis.review_response_rate, margin, contentWidth);
    y = drawPercentRow(doc, y, "Profile Completeness", analysis.profile_completeness, margin, contentWidth);

    y += 6;

    // ─── Recommendations ──────────────────────────────────────
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      y = checkPageBreak(doc, y, 20 + analysis.recommendations.length * 10);
      y = drawSectionHeader(doc, y, "Recommendations", pageWidth);

      for (let i = 0; i < analysis.recommendations.length; i++) {
        y = checkPageBreak(doc, y, 14);
        const rec = analysis.recommendations[i];

        setFillColor(doc, LIGHT_GRAY);
        const lines = doc.splitTextToSize(rec, contentWidth - 20);
        const recHeight = Math.max(10, lines.length * 5 + 4);
        doc.roundedRect(margin, y, contentWidth, recHeight, 1, 1, "F");

        // Number badge
        setFillColor(doc, GOLD);
        doc.circle(margin + 6, y + 5, 3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        setColor(doc, WHITE);
        doc.text((i + 1).toString(), margin + 6, y + 5.8, { align: "center" });

        // Rec text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setColor(doc, DARK_TEXT);
        doc.text(lines, margin + 14, y + 5.5);

        y += recHeight + 2;
      }
    }
  }

  // ─── Footer ────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footY = doc.internal.pageSize.getHeight() - 10;

    setFillColor(doc, DARK_BLUE);
    doc.rect(0, footY - 4, pageWidth, 14, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(doc, MID_GRAY);
    doc.text("Generated by MapKo — mapko.app", margin, footY + 2);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, footY + 2, { align: "right" });
  }

  return doc.output("arraybuffer");
}

/**
 * GET /api/businesses/[id]/report — Generate and download a PDF report.
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

  // Fetch business with analysis
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select(`*, analysis:analyses(*)`)
    .eq("id", id)
    .single();

  if (bizError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Verify ownership through scan -> user_id
  const { data: scan } = await supabase
    .from("scans")
    .select("id")
    .eq("id", business.scan_id)
    .eq("user_id", user.id)
    .single();

  if (!scan) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Normalize analysis
  const normalized: BusinessWithAnalysis = {
    ...business,
    analysis: Array.isArray(business.analysis)
      ? business.analysis[0] || null
      : business.analysis,
  };

  // Generate PDF
  const pdfBuffer = generatePDF(normalized);

  // Sanitize filename
  const safeName = business.name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mapko-report-${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
