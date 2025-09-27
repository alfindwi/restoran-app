import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"

interface MenuSectionProps {
  title: string
  items: Product[]
}

export function MenuSection({ title, items }: MenuSectionProps) {
  if (items.length === 0) return null

  return (
    <section id="menu" className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
