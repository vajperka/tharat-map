import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
const ALLOWED=new Set(["image/jpeg","image/png","image/webp","image/gif"]); const MAX=4*1024*1024;
export const runtime="nodejs";
export async function POST(req:Request){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Nejdřív se přihlas."},{status:401});
 const form=await req.formData(); const file=form.get("file");
 if(!(file instanceof File)) return NextResponse.json({error:"Vyber obrázek nebo GIF."},{status:400});
 if(!ALLOWED.has(file.type)) return NextResponse.json({error:"Povolené jsou JPG, PNG, WebP a GIF."},{status:415});
 if(file.size<=0||file.size>MAX) return NextResponse.json({error:"Profilový obrázek může mít maximálně 4 MB."},{status:413});
 const ext=file.type==="image/gif"?"gif":file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
 const db=sql(); const old=await db`SELECT avatar_url FROM users WHERE id=${session.user.id} LIMIT 1`;
 const blob=await put(`avatars/${session.user.id}/${Date.now()}.${ext}`,file,{access:"public",addRandomSuffix:true,contentType:file.type});
 await db`UPDATE users SET avatar_url=${blob.url} WHERE id=${session.user.id}`;
 const oldUrl=(old[0] as any)?.avatar_url; if(oldUrl&&oldUrl!==blob.url){ try{await del(oldUrl)}catch{} }
 return NextResponse.json({url:blob.url});
}
export async function DELETE(){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=sql(); const rows=await db`SELECT avatar_url FROM users WHERE id=${session.user.id} LIMIT 1`; const url=(rows[0] as any)?.avatar_url;
 await db`UPDATE users SET avatar_url=NULL WHERE id=${session.user.id}`; if(url){try{await del(url)}catch{}}
 return NextResponse.json({ok:true});
}
