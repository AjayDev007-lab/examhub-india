import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export const GET = (request: NextRequest) => proxyBackendRequest(request, "/api/student/exams", "student");
export const POST = (request: NextRequest) => proxyBackendRequest(request, "/api/student/exams/register", "student", "POST");
