import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
export async function GET(){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=sql(); const rows=await db`SELECT id,name,email,role,avatar_url,created_at FROM users WHERE id=${session.user.id} LIMIT 1`;
 return NextResponse.json({user:rows[0]||null});
}
