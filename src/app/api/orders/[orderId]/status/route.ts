import { type NextRequest, NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

interface RouteParams {
  params: Promise<{ orderId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params
    const supabase = await createServer()

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq("id", orderId)
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error in order status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
