import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

const allowedTypes = [
  "metal","richmetal","crystal","obsidian","oil","oilvein","sulfur",
  "silica","blackpearls","element","cave","artifact","boss","loot","base","creature"
] as const;

const markerSchema = z.object({
  type: z.enum(allowedTypes),
  name: z.string().trim().min(1).max(100),
  lat: z.number().min(0).max(100),
  lon: z.number().min(0).max(100),
  note: z.string().trim().max(1000).default(""),
  publishImmediately: z.boolean().optional().default(false),
});

export async function GET() {
  const db = sql();
  const rows = await db`
    SELECT m.id, m.type, m.name, m.lat::float8 AS lat, m.lon::float8 AS lon,
           m.note, m.status, m.approval_status, m.submitted_by, m.created_at
    FROM markers m
    WHERE m.approval_status='approved'
    ORDER BY m.created_at ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Pro přidání lokace se musíš přihlásit." }, { status: 401 });
  }

  try {
    const body = markerSchema.parse(await req.json());
    const db = sql();
    const publishNow = session.user.role === "admin" && body.publishImmediately === true;
    const rows = publishNow
      ? await db`
          INSERT INTO markers (type, name, lat, lon, note, status, approval_status, submitted_by, reviewed_by, reviewed_at)
          VALUES (${body.type}, ${body.name}, ${body.lat}, ${body.lon}, ${body.note}, 'verified', 'approved', ${session.user.id}, ${session.user.id}, now())
          RETURNING id, type, name, lat::float8 AS lat, lon::float8 AS lon, note, status, approval_status, submitted_by, created_at
        `
      : await db`
          INSERT INTO markers (type, name, lat, lon, note, status, approval_status, submitted_by)
          VALUES (${body.type}, ${body.name}, ${body.lat}, ${body.lon}, ${body.note}, 'unverified', 'pending', ${session.user.id})
          RETURNING id, type, name, lat::float8 AS lat, lon::float8 AS lon, note, status, approval_status, submitted_by, created_at
        `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Neplatná data markeru." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Marker se nepodařilo uložit." }, { status: 500 });
  }
}
