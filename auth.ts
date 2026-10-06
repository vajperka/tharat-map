import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Discord({ clientId: process.env.DISCORD_CLIENT_ID!, clientSecret: process.env.DISCORD_CLIENT_SECRET! }),
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const db = sql();
        const rows = await db`
          SELECT id, name, email, password_hash, role, banned, banned_until
          FROM users
          WHERE lower(email) = lower(${parsed.data.email})
          LIMIT 1
        `;
        const user = rows[0] as any;
        if (!user || user.banned || (user.banned_until && new Date(user.banned_until)>new Date())) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.password_hash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "discord") return true;
      if (!user.email) return false;
      const db = sql();
      let rows = await db`SELECT id,name,email,role,banned,banned_until FROM users WHERE lower(email)=lower(${user.email}) LIMIT 1`;
      let local:any = rows[0];
      if (!local) {
        const hash = await bcrypt.hash(crypto.randomUUID()+crypto.randomUUID(), 12);
        rows = await db`INSERT INTO users(name,email,password_hash,role,discord_id,avatar_url) VALUES(${user.name||"Discord user"},${user.email.toLowerCase()},${hash},'user',${account.providerAccountId},${user.image||null}) RETURNING id,name,email,role,banned,banned_until`;
        local=rows[0];
      } else { await db`UPDATE users SET discord_id=${account.providerAccountId}, avatar_url=COALESCE(avatar_url,${user.image||null}) WHERE id=${local.id}`; }
      if(local.banned || (local.banned_until && new Date(local.banned_until)>new Date())) return false;
      (user as any).id=local.id;(user as any).role=local.role;(user as any).name=local.name;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || "user";
      }
      return session;
    },
  },
});
