import { createHmac, timingSafeEqual } from "node:crypto";

export async function verifyTurnstile(token: unknown, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: form, cache: "no-store", signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean; hostname?: string };
    if (!result.success) return false;
    const expected = process.env.TURNSTILE_EXPECTED_HOSTNAME;
    return !expected || result.hostname === expected;
  } catch { return false; }
}

const cookieName = "tharat_discord_human";
export { cookieName };
export function makeDiscordProof(): string | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const ts = String(Date.now());
  const signature = createHmac("sha256", secret).update(ts).digest("hex");
  return `${ts}.${signature}`;
}
export function validDiscordProof(proof?: string): boolean {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !proof) return false;
  const [ts, signature, ...extra] = proof.split(".");
  if (extra.length || !/^\\d{13}$/.test(ts || "") || !/^[a-f0-9]{64}$/.test(signature || "")) return false;
  const age = Date.now() - Number(ts);
  if (age < 0 || age > 5 * 60_000) return false;
  const expected = createHmac("sha256", secret).update(ts).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
