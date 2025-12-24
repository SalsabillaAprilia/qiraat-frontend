# Qiraat Identification App (Frontend)

Ringkasan singkat tentang repo frontend untuk mengidentifikasi Qiraat dari audio tilawah.

Important: sistem dipisah jadi dua repo — frontend (repo ini) dan backend model berbasis Flask. Untuk menjalankan secara lokal, clone kedua repo sebagai folder terpisah (mis. `qiraat-frontend` dan `qiraat-backend-model`).

## Ringkasan

- Frontend dibangun dengan Next.js (App Router).
- Backend model disediakan di repo terpisah (Flask) dan bertanggung jawab untuk preprocessing, ekstraksi fitur, dan klasifikasi.

## Menjalankan Secara Lokal

1. Pastikan Node.js 18+ dan `pnpm` terpasang.
2. Di folder frontend:

```bash
pnpm install
pnpm dev
```

3. Di folder backend (lihat repo Flask): ikuti README di https://github.com/SalsabillaAprilia/qiraat-backend-model untuk menjalankan server model.
4. Buka http://localhost:3000

## Endpoint & Flow

- UI (browser) mengunggah audio ke frontend pada endpoint `POST /api/predict` (multipart/form-data, field `file`).
- Next.js (server) menerima request tersebut di `app/api/predict/route.ts` dan meneruskannya ke Flask backend model yang berada di repo terpisah. Ini menjaga URL backend tetap server-side dan aman.

Contoh `curl` (mengirim ke proxy Next.js):

```bash
curl -X POST http://localhost:3000/api/predict -F "file=@/path/to/audio.wav"
```

## Struktur Singkat Repo

- app/ (Next.js pages / api)
- components/ (React components)
- lib/ (utilities)
- public/ (aset statis)
- styles/ (CSS)

## Environment

- `PREDICT_BACKEND_URL` (server-side): URL Flask backend, mis. `http://127.0.0.1:5000/predict`. Next.js akan meneruskan request ke URL ini.

Catatan: klien secara default memanggil proxy internal `/api/predict`, jadi tidak perlu variabel client-side untuk URL backend.

## Scripts

- `pnpm dev` — jalankan development server
- `pnpm build` — build produksi
- `pnpm start` — jalankan build

## Links

- Backend model repo: https://github.com/SalsabillaAprilia/qiraat-backend-model