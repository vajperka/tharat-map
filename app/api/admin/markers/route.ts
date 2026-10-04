import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = sql();
  const rows = await db`
    SELECT m.id, m.type, m.name, m.lat::float8 AS lat, m.lon::float8 AS lon,
           m.note, m.image_url, m.status, m.approval_status, m.submitted_by, m.created_at,
           u.name AS submitter_name, u.email AS submitter_email
    FROM markers m
    LEFT JOIN users u ON u.id=m.submitted_by
    ORDER BY
      CASE m.approval_status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
      m.created_at DESC
  `;
  return NextResponse.json(rows);
}
