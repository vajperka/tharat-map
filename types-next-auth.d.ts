import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "user" | "admin";
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "user" | "admin";
    };
  }
}
