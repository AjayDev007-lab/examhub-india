import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

type Context = { params: Promise<{ id: string }> };

async function forward(request: NextRequest, context: Context) {
  const { id } = await context.params;
  return proxyBackendRequest(request, `/api/student/applications/${encodeURIComponent(id)}`, "student");
}

export async function GET(request: NextRequest, context: Context) {
  return forward(request, context);
}

export async function PUT(request: NextRequest, context: Context) {
  return forward(request, context);
}

export async function DELETE(request: NextRequest, context: Context) {
  return forward(request, context);
}
