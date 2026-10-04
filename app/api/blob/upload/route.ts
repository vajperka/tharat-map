import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Pro nahrání fotografie se musíš přihlásit." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const safeName = pathname.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100);
        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          pathname: `markers/${session.user.id}/${Date.now()}-${safeName}`,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload error", error);
    return NextResponse.json({ error: "Fotografii se nepodařilo nahrát." }, { status: 400 });
  }
}
