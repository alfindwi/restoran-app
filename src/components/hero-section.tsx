import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 text-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 text-foreground">
          Cita Rasa Nusantara
          <span className="block text-orange-600 dark:text-orange-400">Autentik</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
          Nikmati kelezatan masakan tradisional Indonesia dengan bahan-bahan pilihan dan resep turun temurun yang telah
          terjaga keasliannya.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
            Lihat Menu
          </Button>
          <Button size="lg" variant="outline">
            Pesan Sekarang
          </Button>
        </div>
      </div>
    </section>
  )
}
