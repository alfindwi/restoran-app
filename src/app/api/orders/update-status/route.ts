import { type NextRequest, NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentStatus, transactionId } = body

    const supabase = await createServer()

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        payment_id: transactionId,
        status: paymentStatus === "paid" ? "confirmed" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
