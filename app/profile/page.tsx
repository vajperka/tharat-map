import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const db = sql();
  const rows = await db`SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.created_at, COUNT(m.id) FILTER (WHERE m.approval_status='approved')::int AS approved_count FROM users u LEFT JOIN markers m ON m.submitted_by=u.id WHERE u.id=${session.user.id} GROUP BY u.id LIMIT 1`;
  if (!rows[0]) redirect("/login");
  return <ProfileClient user={rows[0] as any} />;
}
