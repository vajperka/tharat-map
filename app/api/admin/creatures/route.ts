import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

const createSchema=z.object({name:z.string().trim().min(2).max(80),slug:z.string().trim().regex(/^[a-z0-9-]+$/).max(80),active:z.boolean().default(true),iconUrl:z.string().url().nullable().optional()});
export async function GET(){const s=await auth();if(!s?.user||s.user.role!=="admin")return NextResponse.json({error:"Forbidden"},{status:403});const db=sql();return NextResponse.json(await db`SELECT c.id,c.slug,c.name,c.active,c.icon_url,COUNT(m.id)::int marker_count FROM creatures c LEFT JOIN markers m ON m.creature_slug=c.slug GROUP BY c.id ORDER BY c.name`)}
export async function POST(req:Request){const s=await auth();if(!s?.user||s.user.role!=="admin")return NextResponse.json({error:"Forbidden"},{status:403});try{const b=createSchema.parse(await req.json());const db=sql();const rows=await db`INSERT INTO creatures(slug,name,active,icon_url) VALUES(${b.slug},${b.name},${b.active},${b.iconUrl||null}) RETURNING *`;return NextResponse.json(rows[0],{status:201})}catch(e:any){return NextResponse.json({error:e?.name==='ZodError'?"Invalid data":"Creature already exists or could not be saved"},{status:400})}}
