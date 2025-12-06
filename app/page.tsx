import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QiraatAnalyzer } from "@/components/qiraat-analyzer"

export default function Page() {
  return (
    <main className="min-h-screen">
      <header className="border-b bg-accent text-accent-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
                Sistem Identifikasi Qiraat
              </h1>
              <p className="mt-3 text-base opacity-90">
                Unggah rekaman bacaan Al-Qur’an dan identifikasi Qiraat secara otomatis.
              </p>
            </div>
            <img
              src="/audio-microphone-icon.jpg"
              alt="Ilustrasi ikon audio"
              className="hidden sm:block select-none rounded-lg bg-card p-3 ring-1 ring-border w-40 h-auto object-contain"
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <Card className="rounded-xl border">
          <CardHeader>
            <CardTitle className="text-balance">Analisis Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <QiraatAnalyzer />
          </CardContent>
        </Card>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2025 Sistem Identifikasi Qiraat | Salsabilla's Project
      </footer>
    </main>
  )
}
