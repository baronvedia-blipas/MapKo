/**
 * Email notification service for scan completion.
 *
 * MVP: Logs the email to console. Replace with Resend, SendGrid, or
 * any transactional email API when ready for production.
 */

interface ScanEmailData {
  queryText: string;
  totalBusinesses: number;
  avgScore: number;
  highOpportunity: number;
  scanId: string;
}

/**
 * Send a "scan complete" email notification.
 * Async and non-blocking — failures are silently logged so they never
 * break the scan pipeline.
 */
export async function sendScanCompleteEmail(
  to: string,
  scanData: ScanEmailData
): Promise<void> {
  try {
    const subject = `MapKo Scan Complete: ${scanData.queryText}`;
    const body = [
      `Your MapKo scan has finished!`,
      ``,
      `Query: ${scanData.queryText}`,
      `Total businesses found: ${scanData.totalBusinesses}`,
      `Average opportunity score: ${scanData.avgScore}`,
      `High-opportunity leads (70+): ${scanData.highOpportunity}`,
      ``,
      `View full results: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/scans/${scanData.scanId}`,
    ].join("\n");

    // ── Production: uncomment to use Resend ────────────────────
    // const RESEND_API_KEY = process.env.RESEND_API_KEY;
    // if (RESEND_API_KEY) {
    //   await fetch("https://api.resend.com/emails", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${RESEND_API_KEY}`,
    //     },
    //     body: JSON.stringify({
    //       from: "MapKo <noreply@mapko.app>",
    //       to,
    //       subject,
    //       text: body,
    //     }),
    //   });
    //   return;
    // }

    // ── MVP: log to console ────────────────────────────────────
    console.log("────────────────────────────────────────");
    console.log("[EMAIL] Scan complete notification");
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${body}`);
    console.log("────────────────────────────────────────");
  } catch (error) {
    // Never let email failures propagate — the scan is already done.
    console.error("[EMAIL] Failed to send scan notification:", error);
  }
}
