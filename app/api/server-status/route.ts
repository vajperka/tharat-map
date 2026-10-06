import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SOURCE = "https://arksurvival.cz/";
const THARAT_STATUS_PAGES = [
  "https://arkstatus.com/server-details/arksurvival-cz-sk-genesis-mise-neherni-server/11305931934",
  "https://arkstatus.com/server-details/arksurvival-cz-sk-genesis-mise-neherni-server/10363848137?lang=en",
];

function decodeText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#8226;|&bull;/gi, "•")
    .replace(/&#8211;|&ndash;/gi, "–")
    .replace(/&#8212;|&mdash;/gi, "—")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tharatPlayersFromArkSurvival(html: string): number | null {
  const text = decodeText(html);
  // Match the THARAT card regardless of whether the separator is a bullet,
  // dash or just whitespace. Stop at the next ARKSURVIVAL.CZ card.
  const start = text.search(/ARKSURVIVAL\.CZ\s*(?:[•·|\-–—]\s*)?THARAT\b/i);
  if (start < 0) return null;
  const rest = text.slice(start);
  const next = rest.slice(20).search(/ARKSURVIVAL\.CZ\s*(?:[•·|\-–—]\s*)?[A-Z0-9]/i);
  const card = next >= 0 ? rest.slice(0, next + 20) : rest.slice(0, 2500);
  const m = card.match(/Hráči\s*online\s*:?\s*(\d+)/i) || card.match(/Players\s*online\s*:?\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function tharatPlayersFromStatus(html: string): number | null {
  const text = decodeText(html);
  if (!/\bTHARAT\b/i.test(text)) return null;
  const patterns = [
    /Survivors\s*online\s*(\d+)\s*\/\s*\d+/i,
    /Players\s*(\d+)\s*\/\s*\d+/i,
    /Players[^0-9]{0,20}(\d+)\s*\/\s*\d+/i,
    /Online[^0-9]{0,40}(\d+)\s*\/\s*\d+/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return Number(m[1]);
  }
  return null;
}

async function getText(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const r = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
        "accept-language": "cs-CZ,cs;q=0.9,en;q=0.8",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  let players: number | null = null;
  let source = "unavailable";

  // Primary source: the exact THARAT card shown on ARKSurvival.cz.
  try {
    players = tharatPlayersFromArkSurvival(await getText(SOURCE));
    if (players !== null) source = "arksurvival.cz";
  } catch {}

  // The ARKSurvival list is rendered client-side. If its HTML does not contain
  // the card, read both public THARAT instances tracked by ARK Status and sum
  // them. This also survives one tracker page being temporarily unavailable.
  if (players === null) {
    const values = await Promise.all(
      THARAT_STATUS_PAGES.map(async url => {
        try { return tharatPlayersFromStatus(await getText(url)); }
        catch { return null; }
      })
    );
    const valid = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (valid.length) {
      players = valid.reduce((sum, value) => sum + value, 0);
      source = "arkstatus-tharat";
    }
  }

  return NextResponse.json(
    { server: "Tharat", game: "Ascended", players, available: players !== null, source },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
