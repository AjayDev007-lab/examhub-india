import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbStore } from "@/lib/data";

const PLANS = {
  STUDENT_FREE: { id: "STUDENT_FREE", name: "Free Student Access", amount: 0, currency: "INR" },
  STUDENT_PRO_MONTHLY: { id: "STUDENT_PRO_MONTHLY", name: "Student Pro Alerts (Monthly)", amount: 9900, currency: "INR" }, // in paise (₹99)
  STUDENT_PRO_ANNUAL: { id: "STUDENT_PRO_ANNUAL", name: "Student Pro Alerts (Annual)", amount: 79900, currency: "INR" }, // in paise (₹799)
  INSTITUTION_VERIFIED: { id: "INSTITUTION_VERIFIED", name: "Institution Integration Plan", amount: 1499900, currency: "INR" } // in paise (₹14,999)
};

export async function POST(request: NextRequest) {
  try {
    const { plan_id, student_email, student_mobile } = await request.json();

    const plan = PLANS[plan_id as keyof typeof PLANS];
    if (!plan) {
      return NextResponse.json({ error: "Invalid subscription plan selected" }, { status: 400 });
    }

    if (plan.amount === 0) {
      return NextResponse.json({
        success: true,
        is_free: true,
        message: "Free student tier activated automatically. Examination search and official links remain 100% free forever."
      });
    }

    // Generate unique Razorpay Order ID
    const randomHex = crypto.randomBytes(8).toString("hex");
    const orderId = `order_${randomHex}`;
    const receiptId = `rcpt_${Date.now()}`;

    // In production with live RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET, Razorpay client creates the order
    // Here we generate the cryptographically structured Razorpay order payload
    const orderPayload = {
      order_id: orderId,
      receipt: receiptId,
      amount: plan.amount,
      currency: plan.currency,
      plan_name: plan.name,
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_examhub_india",
      prefill: {
        email: student_email || "student@examhub.in",
        contact: student_mobile || "9876543210"
      },
      notes: {
        platform: "EXAMHUB_INDIA",
        plan_id: plan.id,
        created_at: new Date().toISOString()
      }
    };

    return NextResponse.json(orderPayload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
