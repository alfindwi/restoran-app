import { NextRequest, NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServer()

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (name)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {customerName, customerEmail, customerPhone, notes, items, totalAmount} = body

    
    if (!customerName || !customerEmail || !items || items.length === 0 || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServer()

    await supabase
      .from("orders")
      .insert({
        customerEmail,
        customerName,
        customerPhone,
        notes,
        totalAmount,
        
      })
  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}