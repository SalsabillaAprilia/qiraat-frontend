# Qiraat Identification App

Aplikasi berbasis web untuk mengidentifikasi jenis Qiraat dari audio tilawah yang diunggah pengguna.  
Proyek ini dikembangkan sebagai bagian dari pembelajaran dan penelitian terkait pemrosesan audio, machine learning, dan kajian ilmu Qiraat.

## Overview

Qiraat Identification App memungkinkan pengguna mengunggah file audio bacaan Al-Fatihah, kemudian sistem akan menganalisis audio tersebut dan menentukan Qiraat yang digunakan.  
Versi saat ini berfokus pada dua Qiraat awal (yaitu Nāfi‘ dan Ḥamzah) dan akan dikembangkan lebih lanjut.

Repository ini berisi **kode frontend** yang dibangun menggunakan teknologi web modern dan terhubung dengan backend API berbasis Flask.

## Fitur Utama

- Unggah audio langsung dari perangkat
- Putar pratinjau audio sebelum diidentifikasi
- Klasifikasi Qiraat secara otomatis
- Penjelasan detail mengenai Qiraat yang teridentifikasi
- Tampilan UI bersih & responsif
- Terintegrasi dengan backend model klasifikasi

## Teknologi yang Digunakan

- **Frontend:** Next.js / React (menggunakan auto-generated v0 kemudian dimodifikasi dan dikembangkan manual)
- **Deployment:** Vercel
- **Backend API:** Flask (repository terpisah)

## Aplikasi Live

Aplikasi dapat diakses di:
**https://qiraat-identification.vercel.app/**

## Menjalankan Secara Lokal

1. Clone repository ini
2. Instal dependensi: pnpm install
3. Jalankan server development:pnpm dev
4. Buka di browser

## Integrasi Backend

Frontend ini berkomunikasi dengan backend Flask yang bertugas untuk:
- Preprocessing audio
- Ekstraksi fitur
- Klasifikasi Qiraat
- Pengembalian respons API

Repository backend:  
https://github.com/SalsabillaAprilia/qiraat-backend-model

## Pengembangan Selanjutnya

- Menambah dukungan lebih banyak Qiraat
- Memperluas cakupan surah dan segmen ayat
- Meningkatkan akurasi menggunakan dataset yang lebih besar
- Menambahkan autentikasi dan riwayat penggunaan