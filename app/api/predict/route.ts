import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "File audio tidak ditemukan." }, { status: 400 })
    }

    // Di sini seharusnya Anda memanggil model/servis ML.
    // Untuk demo, kita kembalikan hasil statis.
    const mockLabels = [
      { label: "Imam Nafi’", confidence: 0.87 },
      { label: "Imam Ibn Kathir", confidence: 0.81 },
      { label: "Imam Abu ‘Amr", confidence: 0.78 },
    ]
    const picked = mockLabels[Math.floor(Math.random() * mockLabels.length)]

    return NextResponse.json(picked)
  } catch (e) {
    return NextResponse.json({ error: "Gagal memproses permintaan." }, { status: 500 })
  }
}
