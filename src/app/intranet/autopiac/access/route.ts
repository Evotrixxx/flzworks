import { NextRequest } from "next/server";
import { createIntranetAccessResponse, getClientIpFromHeaders } from "@/lib/intranet";

export async function GET(request: NextRequest) {
  return createIntranetAccessResponse(getClientIpFromHeaders(request.headers), request.url);
}
