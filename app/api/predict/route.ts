import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "File audio tidak ditemukan." }, { status: 400 })
    }

    // Forward request to backend model service if configured.
    const backendUrl = process.env.PREDICT_BACKEND_URL || "http://localhost:5000/predict"

    try {
      const resp = await fetch(backendUrl, {
        method: "POST",
        body: formData as any,
      })

      const text = await resp.text()
      // Try parse JSON, fallback to text
      try {
        const json = text ? JSON.parse(text) : null
        return NextResponse.json(json, { status: resp.status })
      } catch {
        return new NextResponse(text, { status: resp.status })
      }
    } catch (err) {
      return NextResponse.json({ error: "Gagal terhubung ke backend model." }, { status: 502 })
    }
  } catch (e) {
    return NextResponse.json({ error: "Gagal memproses permintaan." }, { status: 500 })
  }
}
