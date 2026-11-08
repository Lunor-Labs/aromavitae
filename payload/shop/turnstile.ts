/**
 * Cloudflare Turnstile: proof that a checkout came from a real browser, so a
 * script can't place order after order to hold the shop's stock. Checked here
 * on the CMS, because the checkout endpoint can be called without the storefront.
 *
 * Without TURNSTILE_SECRET_KEY (local dev) checkout isn't checked. The admin
 * refuses to go live without it.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { ok: true } | { ok: false; reason: string };

export async function checkTurnstile(token: string | undefined): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (!token) return { ok: false, reason: "no token" };

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(10_000),
    });
    const json = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    return json.success === true ? { ok: true } : { ok: false, reason: (json["error-codes"] ?? []).join(", ") || "rejected" };
  } catch (error) {
    // Closed, not open: if Cloudflare can't be asked, a script mustn't get through.
    return { ok: false, reason: `couldn't reach Cloudflare: ${String(error)}` };
  }
}
