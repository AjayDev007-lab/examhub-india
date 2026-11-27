import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export const GET = (request: NextRequest) => proxyBackendRequest(request, "/api/student/reminders", "student");
