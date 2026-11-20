import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

// GET /api/admin/payments - List financial transactions & revenue analytics
export async function GET() {
  try {
    const payments = (dbStore as any).payments || [];
    const totalRevenuePaise = payments
      .filter((p: any) => p.status === "COMPLETED")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const activeProSubscribers = payments.filter((p: any) => p.tier === "STUDENT_PRO" && p.status === "COMPLETED").length;
    const activeInstitutionSubscribers = payments.filter((p: any) => p.tier === "INSTITUTION_VERIFIED" && p.status === "COMPLETED").length;

    return NextResponse.json({
      payments,
      metrics: {
        totalRevenueInr: totalRevenuePaise / 100,
        activeProSubscribers,
        activeInstitutionSubscribers,
        completedTransactions: payments.filter((p: any) => p.status === "COMPLETED").length,
        refundedTransactions: payments.filter((p: any) => p.status === "REFUNDED").length
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/payments - Process refund
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, reason } = body;

    const payments = (dbStore as any).payments;
    const payment = payments.find((p: any) => p.order_id === orderId);

    if (!payment) {
      return NextResponse.json({ error: "Payment transaction not found" }, { status: 404 });
    }

    if (payment.status === "REFUNDED") {
      return NextResponse.json({ error: "Transaction has already been refunded" }, { status: 400 });
    }

    payment.status = "REFUNDED";
    payment.refund_reason = reason || "Administrative refund requested";
    payment.refund_amount = payment.amount;

    // Audit log
    dbStore.auditLogs.unshift({
      id: Date.now(),
      admin_name: "SuperAdmin",
      action: "PAYMENT_REFUND_PROCESSED",
      resource: `Order ${orderId} (₹${payment.amount / 100})`,
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1"
    });

    return NextResponse.json({ success: true, payment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
