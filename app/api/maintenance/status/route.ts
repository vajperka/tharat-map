import { NextResponse } from "next/server";
import { getMaintenanceStatus } from "@/lib/maintenance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public, read-only endpoint. Do not expose user or administrator information.
export async function GET() {
  try {
    const status = await getMaintenanceStatus();
    return NextResponse.json({ enabled: status.enabled }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache" },
    });
  } catch {
    return NextResponse.json({ error: "Status unavailable" }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
