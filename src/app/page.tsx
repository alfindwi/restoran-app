import { MenuSection } from "@/components/menu-section"
import { HeroSection } from "@/components/hero-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("category", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
  }

  const foodItems = products?.filter((p) => p.category === "food") || []

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MenuSection title="Makanan" items={foodItems} />
      </main>
      <Footer />
    </div>
  )
}
