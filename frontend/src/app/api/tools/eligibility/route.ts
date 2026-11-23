import { NextRequest, NextResponse } from "next/server";
import { evaluateJobEligibility } from "@/lib/platformData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userProfile, job } = body;

    if (!userProfile || !job) {
      return NextResponse.json(
        { error: "Missing required userProfile or job details" },
        { status: 400 }
      );
    }

    const result = evaluateJobEligibility(userProfile, job);

    return NextResponse.json({
      success: true,
      evaluation: result
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to evaluate eligibility" },
      { status: 500 }
    );
  }
}
