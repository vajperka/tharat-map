import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
export async function GET(){const db=sql();const rows=await db`SELECT c.id,c.slug,c.name,COUNT(m.id)::int AS marker_count FROM creatures c LEFT JOIN markers m ON m.creature_slug=c.slug AND m.approval_status='approved' WHERE c.active=true GROUP BY c.id,c.slug,c.name ORDER BY c.name`;return NextResponse.json(rows)}
