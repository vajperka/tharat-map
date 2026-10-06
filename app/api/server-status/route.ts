import { NextResponse } from "next/server";

export const revalidate = 60;
const SOURCE = "https://arksurvival.cz/";

function plain(html: string) {
  return html.replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&#8211;|&ndash;/gi,"–").replace(/&#8212;|&mdash;/gi,"—").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
}
function tharatPlayers(html: string): number | null {
  const text = plain(html);
  const index = text.search(/ArkSurvival\.cz\s*[•\-–—]?\s*Tharat|ARKSURVIVAL\.CZ\s+Tharat|\bTharat\b/i);
  if (index < 0) return null;
  const card = text.slice(index, index + 900);
  for (const re of [/Hráči\s*online\s*:?\s*(\d+)/i,/Players\s*online\s*:?\s*(\d+)/i,/Online\s*hráči\s*:?\s*(\d+)/i]) {
    const m = card.match(re); if (m) return Number(m[1]);
  }
  return null;
}
export async function GET() {
  try {
    const r = await fetch(SOURCE,{headers:{"user-agent":"TharatResourceMap/1.0"},next:{revalidate:60}});
    if(!r.ok) throw new Error(String(r.status));
    const players=tharatPlayers(await r.text());
    return NextResponse.json({server:"Tharat",game:"Ascended",players,available:players!==null},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}});
  } catch {
    return NextResponse.json({server:"Tharat",game:"Ascended",players:null,available:false},{headers:{"Cache-Control":"public, s-maxage=30, stale-while-revalidate=120"}});
  }
}
