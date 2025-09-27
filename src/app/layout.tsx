import type React from "react"
import type { Metadata } from "next"
import { CartProvider } from "@/hooks/use-cart"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Warung Nusantara - Cita Rasa Autentik Indonesia",
  description: "Nikmati kelezatan masakan tradisional Indonesia dengan bahan-bahan pilihan dan resep turun temurun.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans`}>
        <CartProvider>
          <Suspense>{children}</Suspense>
        </CartProvider>
      </body>
    </html>
  )
}
