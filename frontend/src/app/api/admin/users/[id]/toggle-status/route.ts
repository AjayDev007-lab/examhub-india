import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = dbStore.students.find(s => s.id === Number(id));
  if (!user) {
    return NextResponse.json({ detail: "User not found" }, { status: 404 });
  }
  user.is_active = !user.is_active;
  return NextResponse.json({ success: true, user_id: user.id, is_active: user.is_active });
}
