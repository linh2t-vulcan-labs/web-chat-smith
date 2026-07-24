import { publicEnv } from "@cs/env/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { JoseEncryption } from "@/libs/jose";
import { COOKIE_NAME } from "@/utils/commons/keys";
import { Logger } from "@/utils/commons/logger";
import { EFileExtension } from "@/utils/constants/file";
import { HTTP_STATUS } from "@/utils/constants/http";
import { FileManager } from "@/utils/file-manager";

const zodSchema = z.object({
  content: z.string(),
  type: z.nativeEnum(EFileExtension),
});

export async function POST(req: Request) {
  const input = (await req.json()) as { content: string; type: EFileExtension };

  const logger = new Logger("EXPORT API");

  const result = zodSchema.safeParse(input);

  if (!result.success) {
    logger.sendError({ reason: "ERROR ZOD", result });
    return new NextResponse("Forbidden", { status: HTTP_STATUS.BAD_REQUEST });
  }

  const { content, type } = input;

  const origin = req.headers.get("origin") || req.headers.get("referer");

  const allowedOrigin = publicEnv.CS_PUBLIC_WEB_URL;

  // Fail-closed: an unset allowedOrigin must never make the startsWith
  // check vacuously true (`"".startsWith("")` is true) — that would silently
  // disable origin validation instead of rejecting the request.
  if (!(origin && allowedOrigin) || !origin.startsWith(allowedOrigin)) {
    logger.sendError({ allowedOrigin, origin, reason: "ERROR ORIGIN" });

    return new NextResponse("Forbidden", { status: HTTP_STATUS.BAD_REQUEST });
  }

  const cookieStore = await cookies();

  const authToken = cookieStore.get(COOKIE_NAME.VULCAN_AUTH_TOKEN)?.value;

  if (!authToken) {
    logger.sendError({ reason: "NOT EXIST ACCESS TOKEN" });

    return new NextResponse("Forbidden", { status: HTTP_STATUS.BAD_REQUEST });
  }

  const token = await JoseEncryption.decryptAuthData(authToken);

  if (!token) {
    logger.sendError({ reason: "ERROR DECRYPTED ACCESS TOKEN" });

    return new NextResponse("Forbidden", { status: HTTP_STATUS.BAD_REQUEST });
  }

  const buffer = await FileManager.processFileInRouteHandler(content, type);

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="export.${type}`,
      "Content-Type": FileManager.detectMimeType(type),
    },
  });
}
