"use client"

import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { CartItem } from "./cart-item"
import { CheckoutForm } from "./checkout-form"

export function CartModal() {
  const { items, getTotalItems, getTotalPrice } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keranjang Belanja</DialogTitle>
          <DialogDescription>
            {totalItems > 0 ? `${totalItems} item dalam keranjang` : "Keranjang kosong"}
          </DialogDescription>
        </DialogHeader>

        {!showCheckout ? (
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keranjang belanja kosong</p>
                <p className="text-sm">Tambahkan beberapa item dari menu</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-orange-600 dark:text-orange-400">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="lg"
                >
                  Lanjut ke Checkout
                </Button>
              </>
            )}
          </div>
        ) : (
          <CheckoutForm
            onBack={() => setShowCheckout(false)}
            onSuccess={() => {
              setShowCheckout(false)
              setIsOpen(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
