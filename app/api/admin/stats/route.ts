import {ensureVisitorAnalyticsTable} from '@/lib/visitor-analytics';
import{NextResponse}from'next/server';import{sql}from'@/lib/db';import{requireStaff}from'@/lib/admin';
export async function GET(){const a=await requireStaff();if('error'in a)return a.error;const db=sql();const[s]=await db`SELECT (SELECT COUNT(*)::int FROM users) users,(SELECT COUNT(*)::int FROM users WHERE created_at>=now()-interval '7 days') new_users_7d,(SELECT COUNT(*)::int FROM markers) markers,(SELECT COUNT(*)::int FROM markers WHERE approval_status='pending') pending,(SELECT COUNT(*)::int FROM markers WHERE approval_status='approved') approved,(SELECT COUNT(*)::int FROM markers WHERE created_at>=now()-interval '7 days') new_markers_7d,(SELECT COUNT(*)::int FROM marker_reports) reports,(SELECT COUNT(*)::int FROM markers WHERE image_url IS NOT NULL) photos`;const activity=await db`SELECT aa.*,u.name admin_name FROM admin_actions aa LEFT JOIN users u ON u.id=aa.admin_id ORDER BY aa.created_at DESC LIMIT 12`;const top=await db`SELECT u.id,u.name,COUNT(m.id)::int count FROM users u JOIN markers m ON m.submitted_by=u.id AND m.approval_status='approved' GROUP BY u.id,u.name ORDER BY count DESC LIMIT 5`;const types=await db`SELECT type,COUNT(*)::int count FROM markers WHERE approval_status='approved' GROUP BY type ORDER BY count DESC LIMIT 6`;let visits:any={today:0,yesterday:0,last7:0,last30:0,unique7:0,unique30:0};
let daily:any[]=[];let analyticsError:string|null=null;
try{
 await ensureVisitorAnalyticsTable();
 const [totals]=await db`SELECT
 COUNT(*) FILTER (WHERE visited_at>=date_trunc('day',now()))::int today,
 COUNT(*) FILTER (WHERE visited_at>=date_trunc('day',now())-interval '1 day' AND visited_at<date_trunc('day',now()))::int yesterday,
 COUNT(*) FILTER (WHERE visited_at>=now()-interval '7 days')::int last7,
 COUNT(*) FILTER (WHERE visited_at>=now()-interval '30 days')::int last30,
 COUNT(DISTINCT session_hash) FILTER (WHERE visited_at>=now()-interval '7 days')::int unique7,
 COUNT(DISTINCT session_hash) FILTER (WHERE visited_at>=now()-interval '30 days')::int unique30
 FROM visitor_pageviews`;
 visits=totals;
 daily=await db`SELECT to_char(day,'YYYY-MM-DD') day, COALESCE(count(v.id),0)::int visits,
 COUNT(DISTINCT v.session_hash)::int unique_visitors
 FROM generate_series(current_date-13,current_date,interval '1 day') day
 LEFT JOIN visitor_pageviews v ON v.visited_at>=day AND v.visited_at<day+interval '1 day'
 GROUP BY day ORDER BY day`;
}catch(e:any){console.error("Visitor analytics stats failed",e);analyticsError="Návštěvnost není dostupná: "+(e?.message||"Database error");}
return NextResponse.json({stats:s,activity,top,types,visits,daily,analyticsError})}
