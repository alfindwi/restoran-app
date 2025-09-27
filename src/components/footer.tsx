export function Footer() {
  return (
    <footer className="bg-muted py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Warung Nusantara</h3>
            <p className="text-muted-foreground text-sm">
              Menyajikan cita rasa autentik Indonesia dengan kualitas terbaik dan pelayanan yang ramah.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Jl. Malioboro No. 123</p>
              <p>Yogyakarta, Indonesia</p>
              <p>Telp: (0274) 123-4567</p>
              <p>Email: info@warungnusantara.com</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Jam Buka</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Senin - Jumat: 08:00 - 22:00</p>
              <p>Sabtu - Minggu: 07:00 - 23:00</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Warung Nusantara. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
