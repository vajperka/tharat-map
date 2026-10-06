import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

const allowedTypes = [
  "metal","richmetal","crystal","obsidian","oil","oilvein","sulfur",
  "silica","blackpearls","element","redingot","diamondingot","goldingot","cave","artifact","boss","loot","base","creature"
] as const;

const markerSchema = z.object({
  type: z.enum(allowedTypes),
  name: z.string().trim().min(1).max(100),
  lat: z.number().min(0).max(100),
  lon: z.number().min(0).max(100),
  note: z.string().trim().max(1000).default(""),
  imageUrl: z.string().url().max(2048).refine((url) => /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(url), "Neplatná Blob URL").nullable().optional().default(null),
  creatureSlug: z.string().trim().max(80).nullable().optional().default(null),
  publishImmediately: z.boolean().optional().default(false),
});

export async function GET() {
  const db = sql();
  const rows = await db`
    SELECT m.id, m.type, m.name, m.lat::float8 AS lat, m.lon::float8 AS lon,
           m.note, m.image_url, m.creature_slug, c.name AS creature_name, m.status, m.approval_status, m.submitted_by, u.name AS submitter_name, u.avatar_url AS submitter_avatar_url, m.created_at
    FROM markers m
    LEFT JOIN creatures c ON c.slug=m.creature_slug
    LEFT JOIN users u ON u.id=m.submitted_by
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
    const creatureSlug = body.type === "creature" ? body.creatureSlug : null;
    if (body.type === "creature" && !creatureSlug) return NextResponse.json({ error: "Vyber tvora." }, { status: 400 });
    if (creatureSlug) { const exists=await db`SELECT 1 FROM creatures WHERE slug=${creatureSlug} AND active=true`; if(!exists.length) return NextResponse.json({error:"Neplatný tvor."},{status:400}); }
    const rows = publishNow
      ? await db`
          INSERT INTO markers (type, name, lat, lon, note, image_url, creature_slug, status, approval_status, submitted_by, reviewed_by, reviewed_at)
          VALUES (${body.type}, ${body.name}, ${body.lat}, ${body.lon}, ${body.note}, ${body.imageUrl}, ${creatureSlug}, 'verified', 'approved', ${session.user.id}, ${session.user.id}, now())
          RETURNING id, type, name, lat::float8 AS lat, lon::float8 AS lon, note, image_url, creature_slug, status, approval_status, submitted_by, created_at
        `
      : await db`
          INSERT INTO markers (type, name, lat, lon, note, image_url, creature_slug, status, approval_status, submitted_by)
          VALUES (${body.type}, ${body.name}, ${body.lat}, ${body.lon}, ${body.note}, ${body.imageUrl}, ${creatureSlug}, 'unverified', 'pending', ${session.user.id})
          RETURNING id, type, name, lat::float8 AS lat, lon::float8 AS lon, note, image_url, creature_slug, status, approval_status, submitted_by, created_at
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
