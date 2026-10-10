import { NextResponse } from "next/server";
import { verifyTurnstile, makeDiscordProof, cookieName } from "@/lib/turnstile";

export async function POST(request: Request) {
  let token: unknown;
  try { token = (await request.json()).token; } catch { return NextResponse.json({error:"Invalid request"}, {status:400}); }
  if (!await verifyTurnstile(token, request.headers.get("cf-connecting-ip"))) {
    return NextResponse.json({error:"Robot verification failed"}, {status:403});
  }
  const proof = makeDiscordProof();
  if (!proof) return NextResponse.json({error:"Server configuration missing"}, {status:503});
  const response = NextResponse.json({ok:true});
  response.cookies.set(cookieName, proof, {
    httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax",
    path:"/", maxAge:300,
  });
  return response;
}
