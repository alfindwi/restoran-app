import { PaymentPage } from "@/components/payment-page"
import { createServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface PaymentPageProps {
  params: Promise<{ orderId: string }>
}

export default async function Payment({ params }: PaymentPageProps) {
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

  if (order.payment_status === "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Pembayaran Berhasil!</h1>
          <p className="text-muted-foreground">Pesanan Anda telah dikonfirmasi.</p>
        </div>
      </div>
    )
  }

  return <PaymentPage order={order} />
}
