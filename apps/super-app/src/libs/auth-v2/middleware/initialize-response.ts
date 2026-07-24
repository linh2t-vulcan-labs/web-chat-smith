import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { CustomMiddleware } from "./chain";

export function withInitializeResponse(middleware: CustomMiddleware) {
  return (request: NextRequest, event: NextFetchEvent) => {
    const initialResponseInChain = NextResponse.next();

    return middleware(request, event, initialResponseInChain);
  };
}
