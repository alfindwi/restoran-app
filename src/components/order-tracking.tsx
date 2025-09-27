"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, CheckCircle, Package, Utensils, Home, XCircle } from "lucide-react"
import { Order, OrderItem } from "@/lib/types"

interface OrderTrackingProps {
  order: Order
}

export function OrderTracking({ order }: OrderTrackingProps) {
  const [currentOrder, setCurrentOrder] = useState(order)

  useEffect(() => {
    // Poll for order updates every 30 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${order.id}/status`)
        const updatedOrder = await response.json()
        setCurrentOrder(updatedOrder)
      } catch (error) {
        console.error("Error fetching order status:", error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [order.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID")
  }

  const getStatusSteps = () => {
    const steps = [
      { key: "pending", label: "Pesanan Diterima", icon: Clock },
      { key: "confirmed", label: "Dikonfirmasi", icon: CheckCircle },
      { key: "preparing", label: "Sedang Diproses", icon: Utensils },
      { key: "ready", label: "Siap Diambil", icon: Package },
      { key: "completed", label: "Selesai", icon: CheckCircle },
    ]

    const currentIndex = steps.findIndex((step) => step.key === currentOrder.status)

    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCurrent: index === currentIndex,
    }))
  }

  const statusSteps = getStatusSteps()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button onClick={() => (window.location.href = "/")} variant="outline" className="mb-4 bg-transparent">
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
          <h1 className="text-3xl font-bold mb-2">Lacak Pesanan</h1>
          <p className="text-muted-foreground">Order ID: {currentOrder.id}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Pesanan</CardTitle>
                <CardDescription>Lacak progress pesanan Anda secara real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {statusSteps.map((step) => {
                    const Icon = step.icon
                    return (
                      <div key={step.key} className="flex items-center space-x-4">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            step.isActive
                              ? "bg-orange-600 text-white"
                              : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${step.isActive ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          {step.isCurrent && (
                            <p className="text-sm text-orange-600 dark:text-orange-400">Sedang berlangsung</p>
                          )}
                        </div>
                        {step.isActive && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                    )
                  })}
                </div>

                {currentOrder.status === "cancelled" && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Pesanan Dibatalkan</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Pesanan Anda telah dibatalkan. Jika ada pembayaran, akan diproses refund dalam 1-3 hari kerja.
                    </p>
                  </div>
                )}

                {currentOrder.status === "ready" && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <Package className="h-5 w-5" />
                      <span className="font-medium">Pesanan Siap!</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Pesanan Anda sudah siap untuk diambil. Silakan datang ke restoran.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detail Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Informasi Pelanggan</h4>
                  <div className="text-sm space-y-1">
                    <p>{currentOrder.customer_name}</p>
                    <p className="text-muted-foreground">{currentOrder.customer_email}</p>
                    {currentOrder.customer_phone && (
                      <p className="text-muted-foreground">{currentOrder.customer_phone}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Item Pesanan</h4>
                  <div className="space-y-2">
                    {currentOrder.order_items?.map((item: OrderItem) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.product?.name}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center font-medium">
                  <span>Total:</span>
                  <span className="text-orange-600 dark:text-orange-400">{formatPrice(currentOrder.total_amount)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span>Status Pembayaran:</span>
                  <Badge variant={currentOrder.payment_status === "paid" ? "default" : "secondary"}>
                    {currentOrder.payment_status === "paid" ? "Dibayar" : "Belum Dibayar"}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Pesanan dibuat: {formatDate(currentOrder.created_at)}</p>
                  <p>Terakhir diupdate: {formatDate(currentOrder.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
