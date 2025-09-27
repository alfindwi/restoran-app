"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CreditCard } from "lucide-react"

interface CheckoutFormProps {
  onBack: () => void
  onSuccess: () => void
}

export function CheckoutForm({ onBack }: CheckoutFormProps) {
  const { items, getTotalPrice, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  })

  const totalPrice = getTotalPrice()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items,
          totalAmount: totalPrice,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const order = await response.json()

      clearCart()
      window.location.href = `/payment/${order.id}`
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">Informasi Pemesanan</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Nama Lengkap *</Label>
          <Input
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            required
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email *</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleInputChange}
            required
            placeholder="nama@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Nomor Telepon</Label>
          <Input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            value={formData.customerPhone}
            onChange={handleInputChange}
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Catatan Tambahan</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Catatan khusus untuk pesanan (opsional)"
            rows={3}
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold mb-4">
            <span>Total Pembayaran:</span>
            <span className="text-orange-600 dark:text-orange-400">{formatPrice(totalPrice)}</span>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            {isLoading ? (
              "Memproses..."
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Lanjut ke Pembayaran
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
