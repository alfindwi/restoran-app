"use client";

import { CartModal } from "@/components/cart-modal";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container grid grid-cols-2 h-16 items-center px-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">Warung Nusantara</h1>
        </div>

        <div className="flex justify-end">
          <CartModal />
          <a href="/admin">
            <button className="ml-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
              Login Admin
            </button>
          </a>
        </div>
      </div>
    </header>
  );
}
