import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export const GET = (request: NextRequest) => proxyBackendRequest(request, "/api/student/job-preferences", "student");
export const PUT = (request: NextRequest) => proxyBackendRequest(request, "/api/student/job-preferences", "student", "PUT");
