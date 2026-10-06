import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["admin","moderator"].includes(session.user.role)) redirect("/");
  return <AdminDashboard />;
}
