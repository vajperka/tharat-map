import { sql } from "@/lib/db";

export type MaintenanceStatus = { enabled: boolean; endsAt: string | null };

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const db = sql();
  try {
    const rows = await db`SELECT enabled, ends_at FROM site_settings WHERE key='maintenance' LIMIT 1`;
    const row = rows[0];
    const endsAt = row?.ends_at ? new Date(String(row.ends_at)).toISOString() : null;
    return { enabled: row?.enabled === true && (!endsAt || Date.parse(endsAt) > Date.now()), endsAt };
  } catch (error: unknown) {
    const code = (error as {code?:string})?.code;
    if (code === '42P01') return { enabled: false, endsAt: null };
    if (code === '42703') {
      const rows = await db`SELECT enabled FROM site_settings WHERE key='maintenance' LIMIT 1`;
      return { enabled: rows[0]?.enabled === true, endsAt: null };
    }
    throw error;
  }
}
export async function getMaintenanceMode(): Promise<boolean> {
  return (await getMaintenanceStatus()).enabled;
}
