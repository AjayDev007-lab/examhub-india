import { NextRequest, NextResponse } from "next/server";
import { searchAllPlatform } from "@/lib/platformData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "ALL";

    const results = searchAllPlatform(query, category);

    return NextResponse.json({
      success: true,
      query,
      total: results.length,
      results
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Search failed" }, { status: 500 });
  }
}
