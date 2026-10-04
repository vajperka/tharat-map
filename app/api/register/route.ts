import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2).max(40),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const db = sql();

    const existing = await db`SELECT id FROM users WHERE lower(email)=lower(${body.email}) LIMIT 1`;
    if (existing.length) {
      return NextResponse.json({ error: "Účet s tímto e-mailem už existuje." }, { status: 409 });
    }

    const hash = await bcrypt.hash(body.password, 12);
    const rows = await db`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${body.name}, ${body.email.toLowerCase()}, ${hash}, 'user')
      RETURNING id, name, email, role
    `;

    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Zkontroluj jméno, e-mail a heslo (min. 8 znaků)." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Registrace se nepovedla." }, { status: 500 });
  }
}
