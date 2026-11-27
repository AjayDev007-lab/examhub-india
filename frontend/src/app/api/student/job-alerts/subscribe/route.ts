import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export const POST = (request: NextRequest) => proxyBackendRequest(request, "/api/student/job-alerts/subscribe", "student", "POST");
