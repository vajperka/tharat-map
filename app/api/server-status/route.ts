import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ASCENDED_API = "https://arksurvival.cz/api_ascended.php";

type ArkPlayer = { name?: string; playTime?: string };
type ArkServer = { name?: string; players?: ArkPlayer[] };
type AscendedResponse = { success?: boolean; servers?: ArkServer[] };

export async function GET() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    let response: Response;
    try {
      response = await fetch(ASCENDED_API, {
        headers: {
          accept: "application/json",
          "user-agent": "THARAT-Resource-Map/1.0",
        },
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw new Error(`ARKSurvival API returned ${response.status}`);
    }

    const data = (await response.json()) as AscendedResponse;
    const tharat = Array.isArray(data?.servers)
      ? data.servers.find(server => String(server?.name || "").trim().toLowerCase() === "tharat")
      : undefined;

    if (!tharat || !Array.isArray(tharat.players)) {
      return NextResponse.json(
        { server: "Tharat", game: "Ascended", players: null, playerList: [], available: false, source: "arksurvival.cz/api_ascended.php" },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    return NextResponse.json(
      {
        server: "Tharat",
        game: "Ascended",
        players: tharat.players.length,
        playerList: tharat.players.map(player => ({
          name: String(player?.name || "Unknown"),
          playTime: String(player?.playTime || "—"),
        })),
        available: true,
        source: "arksurvival.cz/api_ascended.php",
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        server: "Tharat",
        game: "Ascended",
        players: null,
        playerList: [],
        available: false,
        source: "arksurvival.cz/api_ascended.php",
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
