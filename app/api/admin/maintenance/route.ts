import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";
import { getMaintenanceMode } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  return NextResponse.json({ enabled: await getMaintenanceMode() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let data: unknown;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!data || typeof data !== "object" || typeof (data as any).enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid maintenance state" }, { status: 400 });
  }
  const enabled = (data as { enabled: boolean }).enabled;
  const db = sql();
  await db`CREATE TABLE IF NOT EXISTS site_settings (key text PRIMARY KEY, enabled boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now())`;
  await db`INSERT INTO site_settings(key,enabled,updated_at) VALUES('maintenance',${enabled},now())
    ON CONFLICT (key) DO UPDATE SET enabled=EXCLUDED.enabled, updated_at=now()`;
  return NextResponse.json({ enabled }, { headers: { "Cache-Control": "no-store" } });
}
