import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
export async function GET(){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=sql(); const rows=await db`SELECT id,name,email,role,avatar_url,admin_frame_enabled,base_lat,base_lon,created_at FROM users WHERE id=${session.user.id} LIMIT 1`;
 return NextResponse.json({user:rows[0]||null});
}

export async function PATCH(req:Request){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await req.json().catch(()=>({}));
 const lat=body.base_lat===null||body.base_lat===""?null:Number(body.base_lat);
 const lon=body.base_lon===null||body.base_lon===""?null:Number(body.base_lon);
 if((lat!==null&&(!Number.isFinite(lat)||lat<0||lat>100))||(lon!==null&&(!Number.isFinite(lon)||lon<0||lon>100))) return NextResponse.json({error:"Coordinates must be between 0 and 100."},{status:400});
 const db=sql(); await db`UPDATE users SET base_lat=${lat}, base_lon=${lon} WHERE id=${session.user.id}`;
 return NextResponse.json({ok:true,base_lat:lat,base_lon:lon});
}
