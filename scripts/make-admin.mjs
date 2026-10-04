import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const email = process.argv[2];
if (!email) throw new Error("Usage: npm run db:make-admin -- your@email.cz");

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  UPDATE users SET role='admin'
  WHERE lower(email)=lower(${email})
  RETURNING id, name, email, role
`;
if (!rows.length) throw new Error("User not found. Register the account first.");
console.log("Admin enabled:", rows[0]);
