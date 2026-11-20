import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET() {
  return NextResponse.json(dbStore.tickets);
}
