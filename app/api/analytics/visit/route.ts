import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {sql} from "@/lib/db";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 try{
  const origin=request.headers.get("origin");
  if(origin && new URL(origin).host!==request.nextUrl.host)return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await request.json();
  const id=body?.session;
  if(typeof id!=="string"||!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid session"},{status:400});
  const hash=createHash("sha256").update(id).digest("hex");
  const db=sql();
  await db`INSERT INTO visitor_pageviews(session_hash,page_path) VALUES (${hash},'/')`;
  return new NextResponse(null,{status:204,headers:{"Cache-Control":"no-store"}});
 }catch(error:any){
  if(error?.code==="42P01")return NextResponse.json({error:"Analytics migration required"},{status:503});
  return NextResponse.json({error:"Unable to record visit"},{status:500});
 }
}
