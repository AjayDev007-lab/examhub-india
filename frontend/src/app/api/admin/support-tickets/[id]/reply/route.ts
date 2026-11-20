import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticket = dbStore.tickets.find(t => t.id === Number(id));
  if (!ticket) {
    return NextResponse.json({ detail: "Ticket not found" }, { status: 404 });
  }

  const body = await request.json();
  ticket.admin_response = body.response;
  ticket.status = body.status || "RESOLVED";
  return NextResponse.json(ticket);
}
