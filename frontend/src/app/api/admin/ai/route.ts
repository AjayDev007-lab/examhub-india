import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

// GET /api/admin/ai - Retrieve AI configuration, quotas, and usage metrics
export async function GET() {
  try {
    const aiConfig = (dbStore as any).aiSettings || {};
    return NextResponse.json({
      config: aiConfig,
      providers: [
        { id: "google_gemini", name: "Google Gemini 1.5 Flash / Pro", status: "ONLINE", recommended: true },
        { id: "anthropic_claude", name: "Anthropic Claude 3.5 Sonnet", status: "CONFIGURED", recommended: false },
        { id: "openai", name: "OpenAI GPT-4o / Mini", status: "STANDBY", recommended: false }
      ],
      quotas: {
        dailyStudentLimit: aiConfig.daily_student_token_limit || 25000,
        dailyInstitutionLimit: aiConfig.daily_institution_token_limit || 500000,
        consumedToday: aiConfig.total_tokens_consumed_today || 432190,
        activeCostInr: aiConfig.estimated_cost_inr || 86.44
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/ai - Update AI settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const current = (dbStore as any).aiSettings;

    if (body.provider) current.provider = body.provider;
    if (body.model_name) current.model_name = body.model_name;
    if (body.is_enabled !== undefined) current.is_enabled = Boolean(body.is_enabled);
    if (body.daily_student_token_limit) current.daily_student_token_limit = Number(body.daily_student_token_limit);
    if (body.daily_institution_token_limit) current.daily_institution_token_limit = Number(body.daily_institution_token_limit);
    if (body.temperature !== undefined) current.temperature = Number(body.temperature);
    if (body.system_prompt) current.system_prompt = body.system_prompt.trim();

    // Audit log
    dbStore.auditLogs.unshift({
      id: Date.now(),
      admin_name: "SuperAdmin",
      action: "AI_CONFIG_UPDATED",
      resource: `AI Provider: ${current.provider} (${current.model_name})`,
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1"
    });

    return NextResponse.json({ success: true, settings: current });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
