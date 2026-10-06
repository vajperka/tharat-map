import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
const schema=z.object({currentPassword:z.string().min(8).max(128),newPassword:z.string().min(8).max(128)});
export async function POST(req:Request){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 const parsed=schema.safeParse(await req.json()); if(!parsed.success) return NextResponse.json({error:"Nové heslo musí mít alespoň 8 znaků."},{status:400});
 if(parsed.data.currentPassword===parsed.data.newPassword) return NextResponse.json({error:"Nové heslo musí být jiné než současné."},{status:400});
 const db=sql(); const rows=await db`SELECT password_hash FROM users WHERE id=${session.user.id} LIMIT 1`; const user=rows[0] as any;
 if(!user||!(await bcrypt.compare(parsed.data.currentPassword,user.password_hash))) return NextResponse.json({error:"Současné heslo není správné."},{status:403});
 const hash=await bcrypt.hash(parsed.data.newPassword,12); await db`UPDATE users SET password_hash=${hash} WHERE id=${session.user.id}`;
 return NextResponse.json({ok:true});
}
