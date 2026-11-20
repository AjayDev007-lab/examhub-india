import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET() {
  const user = dbStore.students[0];
  return NextResponse.json({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    mobile: user.mobile,
    is_active: user.is_active,
    is_verified: user.is_verified,
    mobile_verified: user.mobile_verified,
    created_at: user.created_at
  });
}
