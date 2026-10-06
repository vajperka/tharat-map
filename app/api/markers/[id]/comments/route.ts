import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {sql} from "@/lib/db";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=sql();
 return NextResponse.json(await db`SELECT c.id,c.body,c.parent_id,c.user_id,c.created_at,c.updated_at,u.name,u.avatar_url FROM marker_comments c LEFT JOIN users u ON u.id=c.user_id WHERE c.marker_id=${id} ORDER BY c.created_at ASC LIMIT 150`)
}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Login required"},{status:401});
 const {id}=await params;const data=await req.json();const body=String(data.body||"").trim();const parentId=data.parentId?Number(data.parentId):null;
 if(!body||body.length>500)return NextResponse.json({error:"Comment must be 1–500 characters."},{status:400});
 const db=sql();let parent:any=null;if(parentId){parent=(await db`SELECT c.id,c.user_id,u.name FROM marker_comments c LEFT JOIN users u ON u.id=c.user_id WHERE c.id=${parentId} AND c.marker_id=${id}`)[0];if(!parent)return NextResponse.json({error:"Invalid reply"},{status:400})}
 await db`INSERT INTO marker_comments(marker_id,user_id,body,parent_id) VALUES(${id},${s.user.id},${body},${parentId})`;
 if(parent?.user_id&&parent.user_id!==s.user.id){try{await db`INSERT INTO notifications(user_id,text,href,notification_key,data_json) VALUES(${parent.user_id},${`New reply to your comment.`},${`/?marker=${id}`},'comment_reply',${JSON.stringify({name:s.user.name||'User'})}::jsonb)`}catch{}}
 return NextResponse.json({ok:true})
}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Login required"},{status:401});const {id}=await params;const data=await req.json();const commentId=Number(data.commentId),body=String(data.body||'').trim();if(!commentId||!body||body.length>500)return NextResponse.json({error:'Invalid comment'},{status:400});const db=sql();const c=(await db`SELECT user_id FROM marker_comments WHERE id=${commentId} AND marker_id=${id}`)[0] as any;if(!c)return NextResponse.json({error:'Not found'},{status:404});if(c.user_id!==s.user.id&&s.user.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403});await db`UPDATE marker_comments SET body=${body},updated_at=now() WHERE id=${commentId}`;return NextResponse.json({ok:true})
}
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Login required"},{status:401});const {id}=await params;const data=await req.json();const commentId=Number(data.commentId);const db=sql();const c=(await db`SELECT user_id FROM marker_comments WHERE id=${commentId} AND marker_id=${id}`)[0] as any;if(!c)return NextResponse.json({error:'Not found'},{status:404});if(c.user_id!==s.user.id&&s.user.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403});await db`DELETE FROM marker_comments WHERE id=${commentId}`;return NextResponse.json({ok:true})
}
