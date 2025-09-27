import { MenuSection } from "@/components/menu-section";
import { HeroSection } from "@/components/hero-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types";

export default async function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store", // biar selalu ambil fresh data
        });
        if (!res.ok) throw new Error("Gagal fetch produk");

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p className="text-center text-muted-foreground">Memuat menu...</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MenuSection title="Makanan" items={products} />
      </main>
      <Footer />
    </div>
  );
}
