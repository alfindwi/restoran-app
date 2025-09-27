"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Clock, CheckCircle } from "lucide-react"

interface PaymentPageProps {
  order: any
}

export function PaymentPage({ order }: PaymentPageProps) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [snapToken, setSnapToken] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement("script")
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "")
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const initiatePayment = async () => {
    setPaymentStatus("processing")

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total_amount,
          customerDetails: {
            first_name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
          },
        }),
      })

      const data = await response.json()

      if (data.token) {
        setSnapToken(data.token)
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result: any) => {
            console.log("Payment success:", result)
            setPaymentStatus("success")
            // Update order status
            updateOrderStatus("paid", result.transaction_id)
          },
          onPending: (result: any) => {
            console.log("Payment pending:", result)
            setPaymentStatus("pending")
          },
          onError: (result: any) => {
            console.log("Payment error:", result)
            setPaymentStatus("failed")
          },
          onClose: () => {
            console.log("Payment popup closed")
            setPaymentStatus("pending")
          },
        })
      }
    } catch (error) {
      console.error("Error initiating payment:", error)
      setPaymentStatus("failed")
    }
  }

  const updateOrderStatus = async (paymentStatus: string, transactionId: string) => {
    try {
      await fetch("/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentStatus,
          transactionId,
        }),
      })
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const simulatePayment = async () => {
    setPaymentStatus("processing")

    setTimeout(async () => {
      const success = Math.random() > 0.2

      if (success) {
        setPaymentStatus("success")
        await updateOrderStatus("paid", `DEMO_${Date.now()}`)
      } else {
        setPaymentStatus("failed")
      }
    }, 2000)
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h1>
            <p className="text-muted-foreground mb-4">
              Terima kasih! Pesanan Anda telah dikonfirmasi dan sedang diproses.
            </p>
            <p className="text-sm text-muted-foreground mb-4">Order ID: {order.id}</p>
            <div className="space-y-2">
              <Button
                onClick={() => (window.location.href = `/order/${order.id}`)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Lacak Pesanan
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full bg-transparent">
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Pembayaran</h1>
          <p className="text-muted-foreground">Selesaikan pembayaran untuk pesanan Anda</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ringkasan Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                {order.customer_phone && <p className="text-sm text-muted-foreground">{order.customer_phone}</p>}
              </div>

              <Separator />

              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.products.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-orange-600 dark:text-orange-400">{formatPrice(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Badge variant="outline" className="w-full justify-center py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Sandbox Mode - Demo Payment
                </Badge>

                <p className="text-sm text-muted-foreground text-center">
                  Ini adalah mode demo. Pembayaran tidak akan diproses secara nyata.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                    onClick={initiatePayment}
                    disabled={paymentStatus === "processing"}
                    variant="outline"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white hover:text-white"
                    size="lg"
                  >
                    Bayar dengan Midtrans
                  </Button>


              </div>

              {paymentStatus === "failed" && (
                <div className="text-center text-red-600 text-sm">Pembayaran gagal. Silakan coba lagi.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
