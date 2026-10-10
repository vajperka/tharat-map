import { isManagedBlobUrl } from "@/lib/blob-safety";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { del } from "@vercel/blob";
export async function POST(req:Request){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 const {password}=await req.json(); if(typeof password!=="string") return NextResponse.json({error:"Zadej heslo."},{status:400});
 const db=sql(); const rows=await db`SELECT password_hash,avatar_url FROM users WHERE id=${session.user.id} LIMIT 1`; const user=rows[0] as any;
 if(!user||!(await bcrypt.compare(password,user.password_hash))) return NextResponse.json({error:"Heslo není správné."},{status:403});
 if(isManagedBlobUrl(user.avatar_url)){try{await del(user.avatar_url)}catch{}}
 await db`DELETE FROM users WHERE id=${session.user.id}`;
 return NextResponse.json({ok:true});
}
