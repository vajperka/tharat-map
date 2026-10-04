import { auth } from '@/auth';
import { NextResponse } from 'next/server';
export async function requireAdmin(){const s=await auth();if(!s?.user||s.user.role!=='admin')return {error:NextResponse.json({error:'Forbidden'},{status:403})};return {session:s};}
