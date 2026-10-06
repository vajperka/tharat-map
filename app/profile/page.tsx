import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const db = sql();
  const rows = await db`SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id=${session.user.id} LIMIT 1`;
  if (!rows[0]) redirect("/login");
  return <ProfileClient user={rows[0] as any} />;
}
