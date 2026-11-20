import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  let list = dbStore.exams;
  if (q) {
    list = list.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.code.toLowerCase().includes(q) ||
      e.organization_name.toLowerCase().includes(q)
    );
  }
  return NextResponse.json(list);
}
