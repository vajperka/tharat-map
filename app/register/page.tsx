import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");
  return <main className="auth-page"><RegisterForm /></main>;
}
