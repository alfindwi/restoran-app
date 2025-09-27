import { type NextRequest, NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, transaction_status, fraud_status, transaction_id, signature_key } = body

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (serverKey) {
      const hash = crypto
        .createHash("sha512")
        .update(order_id + transaction_status + "200.00" + serverKey)
        .digest("hex")

      if (hash !== signature_key) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    const supabase = await createServer()

    let paymentStatus = "pending"
    let orderStatus = "pending"

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        paymentStatus = "paid"
        orderStatus = "confirmed"
      }
    } else if (transaction_status === "pending") {
      paymentStatus = "pending"
      orderStatus = "pending"
    } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
      paymentStatus = "failed"
      orderStatus = "cancelled"
    }

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        payment_id: transaction_id,
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)

    if (error) {
      console.error("Error updating order from webhook:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in payment webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
