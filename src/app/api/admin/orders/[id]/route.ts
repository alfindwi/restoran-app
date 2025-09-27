import { type NextRequest, NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const supabase = await createServer()

    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating order:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error in update order API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
