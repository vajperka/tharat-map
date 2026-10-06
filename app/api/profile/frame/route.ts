import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
export async function PATCH(req: Request){
 const session=await auth(); if(!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(session.user.role!=="admin")return NextResponse.json({error:"Forbidden"},{status:403});
 const {enabled}=await req.json(); if(typeof enabled!=="boolean")return NextResponse.json({error:"Invalid value"},{status:400});
 const db=sql(); await db`UPDATE users SET admin_frame_enabled=${enabled} WHERE id=${session.user.id}`; return NextResponse.json({ok:true,enabled});
}
