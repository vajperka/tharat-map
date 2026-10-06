import { NextResponse } from "next/server";

export const revalidate = 60;
const SOURCE = "https://arksurvival.cz/";
// Fallback for the same ARKSURVIVAL.CZ/SK server running the THARAT map.
// Used only when the ARKSurvival.cz HTML returned to server-side fetch does not
// contain its JS-rendered server cards.
const THARAT_STATUS = "https://arkstatus.com/server-details/arksurvival-cz-sk-genesis-mise-neherni-server/11305931934";

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
  // Anchor specifically to the THARAT card, then read its own player count.
  const heading = /ARKSURVIVAL\.CZ\s*[•·\-–—]\s*THARAT\b/i.exec(text);
  if (!heading) return null;
  const card = text.slice(heading.index, heading.index + 1400);
  const m = card.match(/Hráči\s*online\s*:?\s*(\d+)/i) || card.match(/Players\s*online\s*:?\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function tharatPlayersFromStatus(html: string): number | null {
  const text = decodeText(html);
  // Reject a stale/wrong page if it is no longer the THARAT map.
  if (!/\bTHARAT\b/i.test(text)) return null;
  const patterns = [
    /Survivors\s*online\s*(\d+)\s*\/\s*\d+/i,
    /Players\s*(\d+)\s*\/\s*\d+/i,
    /Online[^0-9]{0,40}(\d+)\s*\/\s*\d+/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return Number(m[1]);
  }
  return null;
}

async function getText(url: string) {
  const r = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; TharatResourceMap/1.0; +https://arksurvival.cz/)",
      accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 60 },
  });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.text();
}

export async function GET() {
  let players: number | null = null;
  let source = "arksurvival.cz";

  try {
    players = tharatPlayersFromArkSurvival(await getText(SOURCE));
  } catch {}

  // Their homepage server list is populated by JavaScript, so a server-side
  // fetch can receive only "Načítání serverů...". In that case use the live
  // public status page for the same THARAT server rather than hiding the badge.
  if (players === null) {
    try {
      players = tharatPlayersFromStatus(await getText(THARAT_STATUS));
      if (players !== null) source = "live-status";
    } catch {}
  }

  return NextResponse.json(
    { server: "Tharat", game: "Ascended", players, available: players !== null, source },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
