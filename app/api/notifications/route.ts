import {NextResponse} from "next/server";import {auth} from "@/auth";import {sql} from "@/lib/db";
export async function GET(){const s=await auth();if(!s?.user?.id)return NextResponse.json({items:[],unread:0});const db=sql();let items;
try {
  items=await db`SELECT id,text,href,read_at,created_at,notification_key,data_json FROM notifications WHERE user_id=${s.user.id} ORDER BY created_at DESC LIMIT 100`;
} catch (error: unknown) {
  // Older Neon databases may not yet have the community V5.12 columns.
  // Keep the notification inbox usable until the SQL migration is applied.
  const code=(error as {code?:string})?.code;
  if(code!=="42703") throw error;
  const legacy=await db`SELECT id,text,href,read_at,created_at FROM notifications WHERE user_id=${s.user.id} ORDER BY created_at DESC LIMIT 100`;
  items=legacy.map(item=>({...item,notification_key:null,data_json:{}}));
}return NextResponse.json({items,unread:items.filter((x:any)=>!x.read_at).length},{headers:{"Cache-Control":"no-store"}})}
export async function POST(req:Request){const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});const db=sql();let j:any={};try{j=await req.json()}catch{}if(j.id)await db`UPDATE notifications SET read_at=now() WHERE id=${j.id} AND user_id=${s.user.id}`;else await db`UPDATE notifications SET read_at=now() WHERE user_id=${s.user.id} AND read_at IS NULL`;return NextResponse.json({ok:true})}
export async function DELETE(req:Request){const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});const db=sql();const j=await req.json();if(j.all)await db`DELETE FROM notifications WHERE user_id=${s.user.id}`;else if(j.read)await db`DELETE FROM notifications WHERE user_id=${s.user.id} AND read_at IS NOT NULL`;else if(j.id)await db`DELETE FROM notifications WHERE id=${j.id} AND user_id=${s.user.id}`;return NextResponse.json({ok:true})}
