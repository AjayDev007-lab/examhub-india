import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export const POST = (request: NextRequest) => proxyBackendRequest(request, "/api/student/exams/external", "student", "POST");
