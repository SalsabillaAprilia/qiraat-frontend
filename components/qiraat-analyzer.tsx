"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import WaveSurfer from "wavesurfer.js"
import { PredictionResult } from "./prediction-result"
import { AnimatePresence } from "framer-motion"

type Prediction = {
  label: string
  confidence: number
  explanation?: string
}

export function QiraatAnalyzer() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const waveSurferRef = React.useRef<WaveSurfer | null>(null)

  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<Prediction | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)

  // Init WaveSurfer once
  React.useEffect(() => {
    if (!containerRef.current || waveSurferRef.current) return

    const styles = getComputedStyle(document.documentElement)
    const waveColor = styles.getPropertyValue("--color-muted-foreground")?.trim() || "#6b7280"
    const progressColor = styles.getPropertyValue("--color-primary")?.trim() || "#10b981"

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      cursorColor: progressColor,
      height: 96,
      barWidth: 2,
      barGap: 1,
      responsive: true,
    } as any)

    ws.on("play", () => setIsPlaying(true))
    ws.on("pause", () => setIsPlaying(false))
    ws.on("finish", () => setIsPlaying(false))

    waveSurferRef.current = ws

    return () => {
      ws.destroy()
      waveSurferRef.current = null
    }
  }, [])

  // Load audio when URL changes
  React.useEffect(() => {
    if (audioUrl && waveSurferRef.current) {
      waveSurferRef.current.load(audioUrl)
    }
  }, [audioUrl])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError(null)
    setAudioBlob(file)
    setFileName(file.name)
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
  }

  async function identify() {
    if (!audioBlob) {
      alert("Silakan unggah audio terlebih dahulu.")
      return
    }
    setIsLoading(true)
    setResult(null)
    setError(null)
   
    try {
      const file = new File([audioBlob], fileName || (audioBlob.type.includes("webm") ? "rekaman.webm" : "audio.wav"), {
        type: audioBlob.type || "audio/wav",
      })
      const fd = new FormData()
      fd.append("file", file)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/predict"
      const res = await fetch(API_URL, {
        method: "POST",
        body: fd,
      })

      const payload = await res.json().catch(() => null)

      if (!res.ok) {
        const message = (payload && (payload.error as string)) || `HTTP ${res.status}`
        setError(message)
        return
      }

      const data: Prediction = {
        label: (payload.prediction as string) || "Tidak diketahui",
        confidence: payload.confidence ?? 0,
        explanation: payload.explanation || "Analisis rinci belum tersedia untuk model ini."
      }
      setResult(data)
    } catch (err) {
      console.error("[QiraatAnalyzer] Gagal identifikasi:", err)
      setError("Terjadi kesalahan saat mengidentifikasi audio.")
    } finally {
      setIsLoading(false)
    }
  }

  function togglePlay() {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause()
    }
  }

  return (
    <div className="space-y-5 relative">
      <AnimatePresence>
        {isLoading && (
          <div
            key="loader"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50"
            aria-hidden="true"
          >
            <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full mb-4" />
            <p className="text-white text-lg font-medium">Sedang menganalisis audio...</p>
          </div>
        )}
      </AnimatePresence>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="inline-block">
          <input
            type="file"
            accept="audio/*,.mp3,.wav"
            onChange={handleFileChange}
            className="hidden"
            id="file-input-audio"
          />
          
          <Button asChild className="w-full sm:w-auto">
            <span>
              <label htmlFor="file-input-audio" className="cursor-pointer">
                Pilih File Audio
              </label>
            </span>
          </Button>
        </label>

        <Button onClick={identify} disabled={!audioBlob || isLoading} className="w-full sm:w-auto">
          {isLoading ? "Mengidentifikasi..." : "Mulai Identifikasi"}
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <div ref={containerRef} className="rounded-md bg-muted/70" aria-label="Visualisasi gelombang audio" />
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" onClick={togglePlay} disabled={!audioUrl} aria-pressed={isPlaying}>
            {isPlaying ? "Jeda" : "Dengarkan"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {audioUrl
              ? fileName
                ? `Pratinjau audio: ${fileName}`
                : "Audio siap diputar."
              : "Pilih File Audio untuk memulai pratinjau."}
          </p>
        </div>
      </div>

      <PredictionResult result={result} error={error} tone="success" />

      <div
        key={result?.label || error || "empty"}
        className="rounded-lg border bg-card p-4"
      >
        <h3 className="text-sm font-medium mb-2">Detail Hasil</h3>
        {!result && !error ? (
          <p className="text-sm text-muted-foreground">Belum ada hasil analisis. Pilih File Audio lalu klik Mulai Identifikasi.</p>
        ) : error ? (
           <div className="flex items-center justify-between gap-3 rounded-md bg-destructive/20 px-3 py-2">
             <p className="text-sm text-destructive-foreground">{error}</p>
           </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 rounded-md bg-accent/40 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="truncate text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
              </div>
              <div className="shrink-0 text-right text-sm text-primary">
                {result?.label
                  ? `${result.label} (${Math.round((result?.confidence ?? 0) * 100)}%)`
                  : "Tidak terdeteksi"}
              </div>
            </div>

            {result?.explanation && (
              <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground leading-relaxed">
                <strong>Penjelasan:</strong>{" "}
                {result.explanation}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
