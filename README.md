# Tangga di Dalam Atom — Fisika Atom & Model Bohr (Fisika Umum)

Video edukasi (2K, 30 FPS) · **SCIENTIAN — Explore Science with Yayan** · disusun oleh **Septian Anugrah Dwi Putra**. Seri Fisika Umum #10, penutup seri (sebelumnya: Usaha & Energi, Fluida Statis, Fluida Dinamis, Momentum, Osilasi, Gelombang, Termofisika, Listrik, Magnet). Dibuat dengan [Remotion](https://remotion.dev).

Gaya visual seri **"Lab"** bernuansa atom: tangga tingkat energi berskala, elektron melompat memancarkan foton berwarna, spektrum garis hidrogen, gelombang elektron menjadi orbital — jembatan langsung ke kimia kuantum. Tanpa intro terpisah: judul pembuka memuat logo S + "Explore Science with Yayan".

## Isi

| Bagian | Bab |
|---|---|
| Pembuka | Lampu neon, kembang api, garis spektrum bintang · judul · peta video |
| 1 · Jejak sejarah | 01 Model Thomson · 02 Hamburan Rutherford · 03 Krisis atom klasik |
| 2 · Atom Bohr | 04 Spektrum garis · 05 Postulat Bohr · 06 Tingkat energi · 07 Energi ionisasi · 08 Deret Balmer, Lyman, Paschen |
| 3 · Menuju kimia kuantum | 09 Keterbatasan Bohr · 10 Elektron sebagai gelombang berdiri · 11 Dari orbit ke orbital |
| Penutup | 12 Rangkuman · outro |

## Render (tombol ditekan sendiri, tab **Actions**)

- **Belum ada suara?** Jalankan **Render Atom 2K 30FPS → Run workflow** dengan isian bawaan → versi musik + subtitle (`atom-tanpa-narasi-2k-30fps`).
- **Dengan narasi:** **Buat voice-over + render 2K → Run workflow**, pilih `mesin`:
  - `elevenlabs` — suara klon. Isi secret `ELEVENLABS_API_KEY` dan `ELEVENLABS_VOICE_ID` (Settings → Secrets and variables → Actions), atau isi voice ID di form. ±19 ribu karakter untuk seluruh naskah (muat dalam kuota Starter 30 ribu/bulan).
  - `edge` — gratis, tanpa kunci (suara Microsoft `id-ID-ArdiNeural` laki-laki / `id-ID-GadisNeural` perempuan).
  Workflow membuat suara per baris, menyesuaikan timeline/subtitle/musik dengan durasi suara asli, menyimpannya ke repo, lalu merender versi **dengan narasi** dan **tanpa narasi**.
- Setelah suara jadi, disarankan **Cek pengucapan narasi (Whisper)**.
- Unduh artefak di halaman run (iPad: tekan lama nama artefak → *Unduh Tautan Tertaut*).

Baris yang teksnya diubah: hapus `public/voiceover/<kode>.mp3` agar dibuat ulang (workflow hanya membuat baris yang belum ada). Rekaman suara sendiri: simpan per baris dengan kode di `naskah/NASKAH_VOICEOVER.md`, lalu `npm run voiceover -- --measure`.

## Menjalankan sendiri

```bash
npm ci
npm run dev                # Remotion Studio: "Atom", "Atom2K", atau folder "Adegan"
npm run timeline           # perbarui naskah VO, SRT, BAB_YOUTUBE, peta musik
npm run music              # sintesis ulang musik (python3 + numpy + ffmpeg)
npm run lint               # cek tipe TypeScript
```

## Struktur

```
src/script.ts           naskah per adegan (teks, kata kunci, jeda, ejaan TTS opsional)
src/tts.ts              teks ramah-TTS (ejaan huruf & simbol)
src/timeline.ts         waktu baris & kata (estimasi suku kata, atau durasi rekaman asli)
src/components/         latar cetak biru, subtitle, heading bab, primitif rumus, komponen fisika (batang energi, pegas, balok, grafik) + fluida (air bergelombang, tangki, panah tekanan, gelembung)
src/scenes/             23 adegan
scripts/                voice-over (ElevenLabs/Edge), musik orisinal (numpy), cek pengucapan, render potongan & gabung, QA still
```
