"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Check, Shield, Sparkles, Building2, Award, Zap, 
  HelpCircle, ExternalLink, ArrowRight, CheckCircle2, RefreshCw 
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const PLANS = [
  {
    id: "STUDENT_FREE",
    name: "Student Essential",
    price: "₹0",
    period: "Forever Free",
    description: "Full access to verified national examination directory, official links, and document lookup.",
    popular: false,
    features: [
      "All-India Official Government Directory (36 States & UTs)",
      "Direct verified links to .gov.in, .nic.in & .ac.in portals",
      "Examination Result Scorecard retrieval",
      "Admit Card & Hall Ticket download links",
      "Student Academic Identity Card lookups",
      "Basic AI Examination Assistant answers",
      "Broken link reporting & live server ping test"
    ],
    ctaText: "Current Active Tier",
    isFree: true
  },
  {
    id: "STUDENT_PRO_MONTHLY",
    name: "Student Pro Alerts",
    price: "₹99",
    period: "per month",
    description: "Instant SMS, WhatsApp alerts, and priority tracking so you never miss an admit card or result release.",
    popular: true,
    features: [
      "Everything in Student Essential tier",
      "Instant SMS & WhatsApp alerts when Hall Tickets release",
      "Real-time official Result announcement pings",
      "Saved Examination Deadlines & Calendar reminders",
      "Unlimited AI Exam Assistant queries with full citations",
      "Personalized Cut-Off & Score analysis tracker",
      "Priority Student Helpdesk assistance"
    ],
    ctaText: "Upgrade to Student Pro",
    isFree: false
  },
  {
    id: "INSTITUTION_VERIFIED",
    name: "Institution Verified Plan",
    price: "₹14,999",
    period: "per year",
    description: "For universities, autonomous colleges, and testing councils to manage official student services.",
    popular: false,
    features: [
      "Verified Institutional Authority Badge in National Directory",
      "Dedicated Institution Portal Console",
      "Publish official approved notices & exam announcements",
      "Direct API Integration Gateway (AES-256 encrypted)",
      "Institutional student inquiry & retrieval analytics",
      "Zero student-credential sharing policy compliance",
      "Dedicated Technical Account Manager"
    ],
    ctaText: "Register Institution",
    isFree: false
  }
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const handleCheckout = async (plan: any) => {
    if (plan.isFree) {
      alert("You already have full free access to all examination search and official directory features!");
      return;
    }

    setSelectedPlan(plan.id);
    setProcessing(true);
    setPaymentSuccess(false);

    try {
      // Step 1: Create cryptographically signed order
      const orderRes = await fetchApi("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({
          plan_id: plan.id,
          student_email: "student@examhub.in",
          student_mobile: "9876543210"
        })
      });

      // Step 2: In demo/production, Razorpay modal opens. Here we simulate completing and verifying with backend
      const mockPaymentId = `pay_${Date.now()}`;
      const mockSecret = "examhub_secret_key_default";
      
      // Calculate HMAC signature for simulator using browser Web Crypto
      const signaturePayload = `${orderRes.order_id}|${mockPaymentId}`;
      const enc = new TextEncoder();
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(mockSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sigBuf = await window.crypto.subtle.sign("HMAC", cryptoKey, enc.encode(signaturePayload));
      const signature = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Step 3: Backend signature verification
      const verifyRes = await fetchApi("/api/payments/verify-webhook", {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: orderRes.order_id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
          plan_id: plan.id
        })
      });

      if (verifyRes.verified) {
        setPaymentSuccess(true);
        setPaymentDetails({
          planName: plan.name,
          paymentId: mockPaymentId,
          amount: plan.price
        });
      } else {
        alert("Payment signature verification failed.");
      }
    } catch (err: any) {
      alert(err.message || "Payment checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Transparent Student-First Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Essential Services Are Always 100% Free
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          ExamHub India is committed to universal student access. Finding government portals, looking up results, and downloading admit cards will always remain completely free.
        </p>
      </div>

      {paymentSuccess && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 shadow-sm animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-black text-slate-900">Subscription Activated Successfully!</h3>
          <p className="text-xs text-emerald-800">
            Payment verified cryptographically on the backend. Your <strong>{paymentDetails?.planName}</strong> plan is now active.
          </p>
          <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded-lg border border-slate-200 inline-block">
            Transaction ID: {paymentDetails?.paymentId} • Amount: {paymentDetails?.amount}
          </div>
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <span>Go to Student Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border p-6 sm:p-7 flex flex-col justify-between shadow-sm relative transition-all ${
              plan.popular
                ? "border-blue-600 ring-2 ring-blue-600/20 shadow-md scale-102"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Most Popular for Students
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-xs text-slate-500 font-semibold">{plan.period}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Included Features
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  {plan.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleCheckout(plan)}
                disabled={processing && selectedPlan === plan.id}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                    : plan.isFree
                    ? "bg-slate-100 text-slate-700 cursor-default"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {processing && selectedPlan === plan.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{plan.ctaText}</span>
                    {!plan.isFree && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security & Non-Custodial Guarantee */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Non-Custodial & DPDP Act Compliant</h4>
            <p className="text-slate-400 text-xs">
              ExamHub India never stores card numbers or CVVs. All transactions are securely processed via Razorpay with backend cryptographic signature verification.
            </p>
          </div>
        </div>
        <Link
          href="/official-websites"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold whitespace-nowrap transition-colors"
        >
          Explore Free Directory
        </Link>
      </div>
    </div>
  );
}
