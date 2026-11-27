import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export const GET = (request: NextRequest) => proxyBackendRequest(request, "/api/student/calendar/events", "student");
export const POST = (request: NextRequest) => proxyBackendRequest(request, "/api/student/calendar/events", "student", "POST");
