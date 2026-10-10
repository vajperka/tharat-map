import { sql } from "@/lib/db";

export async function getMaintenanceMode(): Promise<boolean> {
  const db = sql();
  try {
    const rows = await db`SELECT enabled FROM site_settings WHERE key='maintenance' LIMIT 1`;
    return rows[0]?.enabled === true;
  } catch (error: any) {
    // The feature is disabled until the admin creates the settings table.
    if (error?.code === "42P01") return false;
    throw error;
  }
}
