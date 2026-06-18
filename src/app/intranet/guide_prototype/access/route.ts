import { NextRequest } from "next/server";
import { createIntranetAccessResponse, getClientIpFromHeaders } from "@/lib/intranet";
import { GUIDE_PROTOTYPE_BASE_PATH, GUIDE_PROTOTYPE_INTRANET_MODULE } from "@/lib/routes";

export async function GET(request: NextRequest) {
  return createIntranetAccessResponse(
    getClientIpFromHeaders(request.headers),
    request.url,
    GUIDE_PROTOTYPE_INTRANET_MODULE,
    GUIDE_PROTOTYPE_BASE_PATH,
  );
}
