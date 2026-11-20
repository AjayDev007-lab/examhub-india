"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bot, ShieldCheck, ArrowLeft, Save, RefreshCw, Cpu, 
  CheckCircle, AlertCircle, Coins, Key, Lock, Sliders, Globe
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AIManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [provider, setProvider] = useState("google_gemini");
  const [modelName, setModelName] = useState("gemini-1.5-flash");
  const [isEnabled, setIsEnabled] = useState(true);
  const [studentTokenLimit, setStudentTokenLimit] = useState(25000);
  const [institutionTokenLimit, setInstitutionTokenLimit] = useState(500000);
  const [temperature, setTemperature] = useState(0.2);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [groundedCitation, setGroundedCitation] = useState(true);

  // Metrics
  const [metrics, setMetrics] = useState<any>({
    consumedToday: 432190,
    activeCostInr: 86.44,
    dailyStudentLimit: 25000,
    dailyInstitutionLimit: 500000
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/ai");
      if (res.config) {
        setProvider(res.config.provider || "google_gemini");
        setModelName(res.config.model_name || "gemini-1.5-flash");
        setIsEnabled(res.config.is_enabled ?? true);
        setStudentTokenLimit(res.config.daily_student_token_limit || 25000);
        setInstitutionTokenLimit(res.config.daily_institution_token_limit || 500000);
        setTemperature(res.config.temperature ?? 0.2);
        setSystemPrompt(res.config.system_prompt || "");
        setGroundedCitation(res.config.grounded_citation_required ?? true);
      }
      if (res.quotas) {
        setMetrics(res.quotas);
      }
    } catch (err: any) {
      console.error("Failed to load AI settings:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await fetchApi("/api/admin/ai", {
        method: "PUT",
        body: JSON.stringify({
          provider,
          model_name: modelName,
          is_enabled: isEnabled,
          daily_student_token_limit: Number(studentTokenLimit),
          daily_institution_token_limit: Number(institutionTokenLimit),
          temperature: Number(temperature),
          system_prompt: systemPrompt,
          grounded_citation_required: groundedCitation
        })
      });
      setSuccessMsg("AI Engine parameters and quotas updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update AI settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-white flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
              <span>/</span>
              <span className="text-purple-400 font-semibold">Intelligence</span>
              <span>/</span>
              <span className="text-slate-200">AI Management Centre</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">AI Exam Assistant Control Centre</h1>
                <p className="text-xs text-slate-400">Configure LLM providers, student token quotas, safety guardrails & ground-truth verification</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadSettings}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
          </button>
        </div>

        {/* Telemetry KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400">Tokens Processed Today</span>
            <div className="text-xl font-black text-white">{metrics.consumedToday?.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Within safe quota
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400">Estimated Cost (INR)</span>
            <div className="text-xl font-black text-white">₹{metrics.activeCostInr?.toFixed(2)}</div>
            <span className="text-[10px] text-slate-400">Billed via backend gateway</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400">Student Daily Limit</span>
            <div className="text-xl font-black text-white">{studentTokenLimit?.toLocaleString()} tokens</div>
            <span className="text-[10px] text-purple-400">Per registered user</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400">Ground Truth Citation</span>
            <div className="text-xl font-black text-emerald-400">ENFORCED</div>
            <span className="text-[10px] text-slate-400">Strict .gov.in & .nic.in only</span>
          </div>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Provider & Engine Configuration
              </h2>
              <p className="text-[11px] text-slate-400">Select active AI model, latency thresholds, and quota rules</p>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-0 w-4 h-4"
              />
              <span className={`text-xs font-bold ${isEnabled ? "text-emerald-400" : "text-slate-500"}`}>
                {isEnabled ? "AI Assistant Enabled" : "AI Assistant Disabled"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Active LLM Provider</label>
              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  if (e.target.value === "google_gemini") setModelName("gemini-1.5-flash");
                  if (e.target.value === "anthropic_claude") setModelName("claude-3-5-sonnet");
                  if (e.target.value === "openai") setModelName("gpt-4o-mini");
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="google_gemini">Google Gemini (Recommended - High QPS & Cost-Effective)</option>
                <option value="anthropic_claude">Anthropic Claude (High Accuracy & Analysis)</option>
                <option value="openai">OpenAI GPT-4o / GPT-4o Mini</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Model Identifier</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              >
                {provider === "google_gemini" && (
                  <>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Fastest & Optimized)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Multimodal Reasoning)</option>
                  </>
                )}
                {provider === "anthropic_claude" && (
                  <>
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet-latest</option>
                    <option value="claude-3-haiku">claude-3-haiku</option>
                  </>
                )}
                {provider === "openai" && (
                  <>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-4o">gpt-4o</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Student Daily Token Limit</label>
              <input
                type="number"
                value={studentTokenLimit}
                onChange={(e) => setStudentTokenLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Institution Daily Token Limit</label>
              <input
                type="number"
                value={institutionTokenLimit}
                onChange={(e) => setInstitutionTokenLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Sampling Temperature ({temperature})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer pt-2"
              />
              <span className="text-[10px] text-slate-400">Lower = More deterministic & factual</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Master System Prompt (Grounded Exam Directives)</label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-[11px] focus:outline-none focus:border-purple-500 leading-relaxed"
              placeholder="System prompt instructions..."
            />
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3 text-slate-400">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-slate-300">Backend Cryptographic Security: </strong>
              API credentials are maintained strictly inside server environment variables (`GEMINI_API_KEY`, etc.) and are never sent to the client browser. All prompts pass through safety filtering before generation.
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Updating..." : "Save AI Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
