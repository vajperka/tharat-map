import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
const schema=z.object({name:z.string().trim().min(2).max(80),active:z.boolean()});
export async function PATCH(req:Request,ctx:{params:Promise<{id:string}>}){const s=await auth();if(!s?.user||s.user.role!=="admin")return NextResponse.json({error:"Forbidden"},{status:403});const {id}=await ctx.params;const b=schema.parse(await req.json());const db=sql();await db`UPDATE creatures SET name=${b.name},active=${b.active} WHERE id=${Number(id)}`;return NextResponse.json({ok:true})}
