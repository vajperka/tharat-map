import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";
import { getMaintenanceStatus } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  return NextResponse.json(await getMaintenanceStatus(), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host")) return NextResponse.json({error:"Invalid origin"},{status:403});
    } catch { return NextResponse.json({error:"Invalid origin"},{status:403}); }
  }
  let data: unknown;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!data || typeof data !== "object" || typeof (data as {enabled?:unknown}).enabled !== "boolean")
    return NextResponse.json({ error: "Invalid maintenance state" }, { status: 400 });
  const body = data as { enabled: boolean; endsAt?: unknown };
  let endsAt: string | null = null;
  if (body.enabled && body.endsAt != null && body.endsAt !== "") {
    if (typeof body.endsAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(body.endsAt))
      return NextResponse.json({error:"Invalid end date"},{status:400});
    const ms = Date.parse(body.endsAt);
    if (!Number.isFinite(ms) || ms <= Date.now() + 60_000 || ms > Date.now() + 90*24*60*60_000)
      return NextResponse.json({error:"End time must be between 1 minute and 90 days in the future"},{status:400});
    endsAt = new Date(ms).toISOString();
  }
  const db = sql();
  await db`CREATE TABLE IF NOT EXISTS site_settings (key text PRIMARY KEY, enabled boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now())`;
  await db`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ends_at timestamptz`;
  await db`INSERT INTO site_settings(key,enabled,ends_at,updated_at) VALUES('maintenance',${body.enabled},${endsAt},now())
    ON CONFLICT (key) DO UPDATE SET enabled=EXCLUDED.enabled, ends_at=EXCLUDED.ends_at, updated_at=now()`;
  return NextResponse.json({enabled:body.enabled,endsAt}, { headers: { "Cache-Control": "no-store" } });
}
