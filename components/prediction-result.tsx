"use client"

type Prediction = {
  qiraat: string
  riwayat: string
}

export function PredictionResult({
  result,
  error,
  tone = "success", // "success" | "info"
}: {
  result: Prediction | null
  error?: string | null
  tone?: "success" | "info"
}) {
  if (!result && !error) return null

  const isError = Boolean(error)
  const toneClass =
    tone === "info"
      ? "bg-info/10 border-info text-info-foreground"
      : "bg-success/10 border-success text-success-foreground"

  return (
    <div
      className={`mt-4 rounded-lg border p-4 ${isError ? "bg-destructive/10 border-destructive text-destructive-foreground" : toneClass}`}
      role="status"
      aria-live="polite"
    >
      {isError ? (
        <p className="font-medium">Terjadi kesalahan: {error}</p>
      ) : (
        <>
          <p className="font-medium">
            Qiraat Teridentifikasi : {result?.qiraat}
          </p>
          <p className="font-medium">
            Riwayat: {result?.riwayat}
          </p>
        </>
      )}
    </div>
  )
}
