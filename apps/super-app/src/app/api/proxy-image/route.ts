import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json(
      { error: "Only http and https URLs are allowed" },
      { status: 400 }
    );
  }

  const response = await fetch(url);

  if (!response.ok) {
    return NextResponse.json(
      { error: `Failed to fetch image: ${response.statusText}` },
      { status: response.status }
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "application/octet-stream";

  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "URL does not point to an image" },
      { status: 400 }
    );
  }

  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": contentType,
    },
  });
}
