import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("query")?.toLowerCase();

  let list = dbStore.organizations.filter(o => o.is_active && o.approval_status === "APPROVED");
  if (q) {
    list = list.filter(o => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
  }
  return NextResponse.json(list);
}
