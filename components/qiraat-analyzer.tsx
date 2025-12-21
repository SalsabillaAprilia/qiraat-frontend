"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import WaveSurfer from "wavesurfer.js";
import { PredictionResult } from "./prediction-result";
import { AnimatePresence } from "framer-motion";

type Prediction = {
  prediction: string;
  qiraat: string;
  riwayat: string;
  confidence: number;
  explanation?: string;
  latency?: string;
};

export function QiraatAnalyzer() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const waveSurferRef = React.useRef<WaveSurfer | null>(null);

  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(
    null
  );
  const [result, setResult] = React.useState<Prediction | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Init WaveSurfer once
  React.useEffect(() => {
    if (!containerRef.current || waveSurferRef.current) return;

    const styles = getComputedStyle(document.documentElement);
    const waveColor =
      styles.getPropertyValue("--color-muted-foreground")?.trim() || "#6b7280";
    const progressColor =
      styles.getPropertyValue("--color-primary")?.trim() || "#10b981";

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      cursorColor: progressColor,
      height: 96,
      barWidth: 2,
      barGap: 1,
      responsive: true,
    } as any);

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    waveSurferRef.current = ws;

    return () => {
      ws.destroy();
      waveSurferRef.current = null;
    };
  }, []);

  // Load audio when URL changes
  React.useEffect(() => {
    if (audioUrl && waveSurferRef.current) {
      waveSurferRef.current.load(audioUrl);
    }
  }, [audioUrl]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic validation: ensure the selected file is an audio file
    const isAudioMime = file.type ? file.type.startsWith("audio/") : false;
    const allowedExt = [
      ".wav",
      ".mp3",
      ".m4a",
      ".flac",
      ".ogg",
      ".webm",
    ];
    const lowerName = file.name.toLowerCase();
    const hasAllowedExt = allowedExt.some((ext) => lowerName.endsWith(ext));

    if (!isAudioMime && !hasAllowedExt) {
      setResult(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setFileName(null);
      setError("File harus berformat audio (wav, mp3, m4a, flac, ogg, webm).");
      return;
    }

    // Check file size (UX): reject too-large files early
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      setResult(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setFileName(null);
      setError("File terlalu besar. Maksimum 10 MB.");
      return;
    }

    // Check audio duration before accepting (reject > 120s)
    const getAudioDuration = (f: File) =>
      new Promise<number>((resolve, reject) => {
        const url = URL.createObjectURL(f);
        const audio = new Audio();
        audio.preload = "metadata";
        audio.src = url;
        const clear = () => {
          URL.revokeObjectURL(url);
        };
        audio.addEventListener("loadedmetadata", () => {
          const d = audio.duration;
          clear();
          resolve(d);
        });
        audio.addEventListener("error", (e) => {
          clear();
          reject(e);
        });
      });

    try {
      const duration = await getAudioDuration(file);
      if (!isFinite(duration) || duration <= 0) {
        setError("Gagal membaca durasi audio.");
        return;
      }
      const MAX_DURATION = 120; // seconds
      if (duration > MAX_DURATION) {
        setResult(null);
        setAudioBlob(null);
        setAudioUrl(null);
        setFileName(null);
        setError(`Durasi audio terlalu panjang (${Math.round(duration)}s). Maksimum ${MAX_DURATION}s.`);
        return;
      }
    } catch (err) {
      setError("Tidak dapat membaca metadata audio. Pastikan file audio valid.");
      return;
    }

    setResult(null);
    setError(null);
    setAudioBlob(file);
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  }

  async function identify() {
    if (!audioBlob) {
      alert("Silakan unggah audio terlebih dahulu.");
      return;
    }
    setIsLoading(true);
    setUploadProgress(0);
    setResult(null);
    setError(null);

    try {
      const file = new File(
        [audioBlob],
        fileName ||
          (audioBlob.type.includes("webm") ? "rekaman.webm" : "audio.wav"),
        {
          type: audioBlob.type || "audio/wav",
        }
      );
      const fd = new FormData();
      fd.append("file", file);
      // Use XMLHttpRequest to track upload progress
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/predict";
      const uploadPromise: Promise<any> = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(pct);
          }
        };
        xhr.onload = () => {
          const text = xhr.responseText;
          let payload: any = null;
          try {
            payload = text ? JSON.parse(text) : null;
          } catch (e) {
            // ignore parse error
          }
          if (xhr.status === 200) {
            resolve(payload);
          } else if (xhr.status === 400) {
            const details =
              (payload && (payload.details || payload.error)) || `HTTP 400`;
            reject({ status: 400, message: details });
          } else {
            reject({ status: xhr.status, message: (payload && payload.error) || `HTTP ${xhr.status}` });
          }
        };
        xhr.onerror = () => {
          reject({ status: xhr.status || 0, message: "Network error" });
        };
        xhr.send(fd);
      });

      const payload = await uploadPromise;

      const data: Prediction = {
        prediction: payload.prediction,
        qiraat: payload.qiraat,
        riwayat: payload.riwayat,
        confidence: payload.confidence ?? 0,
        explanation: payload.explanation,
        latency: payload.latency,
      };
      setResult(data);
    } catch (err) {
      console.error("[QiraatAnalyzer] Gagal identifikasi:", err);
      if (err && typeof err === "object" && (err as any).status === 400) {
        setError((err as any).message || "Permintaan tidak valid (400).");
      } else {
        setError("Sistem tidak dapat terhubung ke server.");
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  }

  function togglePlay() {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
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
            <p className="text-white text-lg font-medium">
              Sedang menganalisis audio...
            </p>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="inline-block">
          <input
            type="file"
            accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg"
            onChange={handleFileChange}
            className="hidden"
            id="file-input-audio"
          />

          <Button asChild className="w-full sm:w-auto" disabled={isLoading}>
            <span>
              <label htmlFor="file-input-audio" className="cursor-pointer">
                Pilih File Audio
              </label>
            </span>
          </Button>
        </label>

        <Button
          onClick={identify}
          disabled={!audioBlob || isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Mengidentifikasi..." : "Mulai Identifikasi"}
        </Button>
      </div>

      {uploadProgress !== null && (
        <div className="mt-2 w-full">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-sm text-muted-foreground">Mengunggah</p>
            <p className="text-sm font-medium text-muted-foreground">{uploadProgress}%</p>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadProgress}
            className="w-full bg-muted/20 rounded-full h-2 overflow-hidden"
          >
            <div
              className="bg-primary h-2 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-muted/50 p-4">
        <div
          ref={containerRef}
          className="rounded-md bg-muted/70"
          aria-label="Visualisasi gelombang audio"
        />
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={togglePlay}
            disabled={!audioUrl}
            aria-pressed={isPlaying}
          >
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
        key={result?.prediction || error || "empty"}
        className="rounded-lg border bg-card p-4"
      >
        <h3 className="text-sm font-medium mb-2">Detail Hasil</h3>
        {!result && !error ? (
          <p className="text-sm text-muted-foreground">
            Belum ada hasil analisis. Pilih File Audio lalu klik Mulai
            Identifikasi.
          </p>
        ) : null}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md bg-destructive/20 px-3 py-2">
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        )}
        {result && (
          <>

            {/* Card 1 — Latency & Confidence */}
            <div className="rounded-md bg-accent/40 px-3 py-2 mb-3 text-sm leading-relaxed">
              Analisis selesai dalam{" "}{result.latency}.
              <br />
              {(() => {
                const pct = Math.round((result.confidence ?? 0) * 100);
                const level =
                  pct >= 80
                    ? "tingkat keyakinan tinggi"
                    : pct >= 60
                    ? "tingkat keyakinan sedang"
                    : "tingkat keyakinan rendah";

                return (
                  <>
                    Sistem memiliki {level} bahwa audio {fileName} merupakan
                    bacaan dengan riwayat {result.riwayat} ’an {result.qiraat}.
                  </>
                );
              })()}
            </div>

            {/* Card 2 — Explanation */}
            {result?.explanation && (
              <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground leading-relaxed">
                <strong>Karakteristik Bacaan:</strong> {result.explanation}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
