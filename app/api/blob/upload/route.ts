import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
// Keep below the Vercel Function request-body ceiling. The file itself is capped
// at 4 MiB; multipart overhead remains small for a single image.
const MAX_BYTES = 4 * 1024 * 1024;

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Pro nahrání fotografie se musíš přihlásit." },
      { status: 401 },
    );
  }

  try {
    const form = await request.formData();
    const value = form.get("file");

    if (!(value instanceof File)) {
      return NextResponse.json({ error: "Nebyla vybrána fotografie." }, { status: 400 });
    }
    if (!ALLOWED.has(value.type)) {
      return NextResponse.json(
        { error: "Povolené jsou pouze JPG, PNG a WebP." },
        { status: 415 },
      );
    }
    if (value.size <= 0 || value.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Fotka může mít maximálně 4 MB." },
        { status: 413 },
      );
    }

    const ext = value.type === "image/png" ? "png" : value.type === "image/webp" ? "webp" : "jpg";
    const pathname = `markers/${session.user.id}/${Date.now()}.${ext}`;

    // On current Vercel Blob projects, @vercel/blob authenticates this server-side
    // call with the deployment's short-lived Vercel OIDC identity. No
    // BLOB_READ_WRITE_TOKEN is exposed to the browser or required in app code.
    const blob = await put(pathname, value, {
      access: "public",
      addRandomSuffix: true,
      contentType: value.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: value.size,
    });
  } catch (error) {
    console.error("Blob upload error", error);
    return NextResponse.json(
      { error: "Fotografii se nepodařilo nahrát do Vercel Blob." },
      { status: 500 },
    );
  }
}
