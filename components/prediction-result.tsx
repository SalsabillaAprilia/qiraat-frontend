"use client"

type Prediction = {
  label: string
  confidence: number // 0..1
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

  const percent = result ? Math.round(result.confidence * 100) : 0
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
            Qiraat Teridentifikasi : {result?.label} ({percent}%)
          </p>
          <div className="mt-2 h-2 w-full rounded bg-muted">
            <div className="h-2 rounded bg-primary" style={{ width: `${percent}%` }} />
          </div>
        </>
      )}
    </div>
  )
}
