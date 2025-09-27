import { createServer } from "@/lib/supabase/server"
import { OrderTracking } from "@/components/order-tracking"
import { notFound } from "next/navigation"

interface OrderPageProps {
  params: Promise<{ orderId: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
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

  if (error || !order) {
    notFound()
  }

  return <OrderTracking order={order} />
}
