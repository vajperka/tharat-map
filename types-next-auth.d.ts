import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "user" | "moderator" | "admin";
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "user" | "moderator" | "admin";
    };
  }
}
