"use client";

import type { CartItem as CartItemType } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleIncrease = () => {
    updateQuantity(item.product.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeItem(item.product.id);
  };

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg">
      <div className="relative w-16 h-16 flex-shrink-0">
        <img
          src={item.product.image_url}
          alt={item.product.name}
          className="object-cover rounded"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.product.price)}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={handleDecrease}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={handleIncrease}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-destructive bg-transparent"
          onClick={handleRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
