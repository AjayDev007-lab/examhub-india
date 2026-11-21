import { NextResponse, NextRequest } from "next/server";
import { INITIAL_MAINTENANCE_TASKS, MaintenanceTaskItem } from "@/lib/maintenanceData";

let tasksStore = [...INITIAL_MAINTENANCE_TASKS];

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/maintenance/tasks${req.nextUrl.search}`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  const category = req.nextUrl.searchParams.get("category");
  const priority = req.nextUrl.searchParams.get("priority");
  const status = req.nextUrl.searchParams.get("status_filter");

  let list = tasksStore;
  if (category && category !== "ALL") list = list.filter(t => t.category === category);
  if (priority && priority !== "ALL") list = list.filter(t => t.priority === priority);
  if (status && status !== "ALL") list = list.filter(t => t.status === status);

  return NextResponse.json({ total: list.length, tasks: list });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/maintenance/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  const newTask: MaintenanceTaskItem = {
    id: tasksStore.length + 1,
    title: body.title,
    description: body.description,
    category: body.category || "WEBSITE_BUG",
    priority: body.priority || "MEDIUM",
    status: "OPEN",
    reported_by: body.reported_by || "SUPER_ADMIN",
    deadline: body.deadline,
    created_at: new Date().toISOString()
  };
  tasksStore.unshift(newTask);
  return NextResponse.json({ success: true, task_id: newTask.id, message: "Maintenance task created successfully" });
}
