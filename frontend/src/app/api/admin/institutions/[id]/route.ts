import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

type Context = { params: Promise<{ id: string }> };

async function forward(request: NextRequest, context: Context) {
  const { id } = await context.params;
  return proxyBackendRequest(request, `/api/admin/institutions/${encodeURIComponent(id)}`, "admin");
}

export async function GET(request: NextRequest, context: Context) { return forward(request, context); }
export async function PUT(request: NextRequest, context: Context) { return forward(request, context); }
export async function DELETE(request: NextRequest, context: Context) { return forward(request, context); }
