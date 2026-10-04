import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject", "delete"]),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const markerId = Number(id);
  if (!Number.isInteger(markerId)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const { action } = schema.parse(await req.json());
  const db = sql();

  if (action === "delete") {
    await db`DELETE FROM markers WHERE id=${markerId}`;
    return NextResponse.json({ ok: true });
  }

  const approval = action === "approve" ? "approved" : "rejected";
  const status = action === "approve" ? "verified" : "unverified";
  await db`
    UPDATE markers
    SET approval_status=${approval}, status=${status}, reviewed_by=${session.user.id}, reviewed_at=now()
    WHERE id=${markerId}
  `;
  return NextResponse.json({ ok: true });
}
