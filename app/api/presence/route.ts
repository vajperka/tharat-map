import {NextResponse} from 'next/server';
import {auth} from '@/auth';
import {sql} from '@/lib/db';
export const dynamic='force-dynamic';
export async function POST(){const s=await auth();if(!s?.user)return NextResponse.json({ok:false},{status:401});const db=sql();try{await db`UPDATE users SET last_seen=now() WHERE id=${s.user.id}`;return NextResponse.json({ok:true})}catch{return NextResponse.json({ok:false,migration:true},{status:503})}}
export async function GET(){const db=sql();try{const rows=await db`SELECT id,name,role,avatar_url,last_seen FROM users WHERE role IN ('admin','moderator') AND banned=false AND last_seen > now()-interval '2 minutes' ORDER BY CASE WHEN role='admin' THEN 0 ELSE 1 END,name ASC`;return NextResponse.json({staff:rows},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({staff:[]},{headers:{'Cache-Control':'no-store'}})}}
