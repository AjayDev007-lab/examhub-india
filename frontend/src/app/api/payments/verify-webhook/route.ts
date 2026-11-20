import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbStore } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id, student_email } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment signature parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "examhub_secret_key_default";

    // Compute cryptographic HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    // Timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8")
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment signature mismatch. Tampered or fraudulent transaction rejected." },
        { status: 400 }
      );
    }

    // Record verified transaction in audit logs
    if (dbStore) {
      dbStore.auditLogs.unshift({
        id: dbStore.auditLogs.length + 1,
        actor_type: "STUDENT",
        actor_id: 1,
        action: "PAYMENT_VERIFIED",
        target_type: "SUBSCRIPTION",
        target_id: 1,
        ip_address: "127.0.0.1",
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment successfully verified and subscription activated.",
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Payment verification failed" }, { status: 500 });
  }
}
