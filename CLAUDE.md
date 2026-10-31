# Konteks repo (untuk asisten AI)

- Video **"Tangga di Dalam Atom" — Fisika Atom & Model Bohr** (Fisika Umum, S1 Kimia UNESA, RPS minggu 15) milik **Yayan** (Septian Anugrah Dwi Putra), seri Fisika Umum #10 (penutup seri). Seri #1 `video-fisika-energi`, #2 `video-fisika-fluida-statis`, #3 `video-fisika-fluida-dinamis`, #4 `video-fisika-momentum`, #5 `video-fisika-osilasi`, #6 `video-fisika-gelombang`, #7 `video-fisika-termofisika`, #8 `video-fisika-listrik`, #9 `video-fisika-magnet` (mesin, komponen, dan alur kerja disalin dari #9). Arah seri: fondasi fisika untuk kimia kuantum (Osilasi → Gelombang → Termofisika → Listrik → Magnet → Fisika Atom); setiap video punya bagian "di dunia kimia" yang menjembatani ke kuantum. Aturan umum & pelajaran teknis: repo `septiananugrah-ship-it/science-intro` → `CLAUDE.md`.
- Angka yang dipakai dicek di `naskah/AUDIT.md`.
- Branding: **tanpa intro SCIENTIAN terpisah** — judul menampilkan kapsul logo S + "Explore Science with Yayan"; outro SCIENTIAN + "Disusun oleh Septian Anugrah Dwi Putra" + pil penutup seri ("lanjut ke Kimia Kuantum").
- Gaya seri **"Lab"** (malam biru tinta + kisi cetak biru, Space Grotesk/Inter/JetBrains Mono/Source Serif 4) dengan nuansa **atom**: tangga tingkat energi berskala, elektron yang melompat dan memancarkan foton berwarna, spektrum garis, zoom ke inti, gelombang elektron yang menjadi orbital.
- **Kode warna**: inti/proton = merah `C.heat`, elektron = biru `C.pot`, tingkat energi = hijau `C.work`, foton = warna panjang gelombangnya, partikel alfa = jingga `C.kin`, gelombang elektron = ungu `C.spr`, orbit klasik = toska `C.cyan`, energi ionisasi = emas `C.gold`.
- Komponen: `physics.tsx` (Crate, Ball, Car, Person, Spring, EnergyBars, Plot…), `flow.tsx`, `fluid.tsx`, `primitives.tsx` (Arrow berdenyut, Spark trail, Ripple, Card, Formula…).
- **Semua adegan harus terus bergerak** — panduan lengkap `naskah/POLISH.md`.
- **Claude tidak menjalankan workflow GitHub Actions.** Setelah merge ke `main`, berhenti dan minta pengguna menekan *Run workflow* sendiri; beri link & isian.
- Narasi: menyusul (ElevenLabs suara klon, atau Edge TTS gratis lewat input `mesin`). Selalu sediakan versi tanpa narasi.

## Aturan konten & tata letak

- Rumus utama ≥ 56 px (`Formula`), satu kartu per momen; zona subtitle (bawah 180 px) selalu bebas; margin ≥ 80 px. Komponen HTML di luar `<Stage>`.
- Eₙ = −13,6 eV/n², a₀ = 0,053 nm. "≈" untuk perkiraan. Koma desimal.
- Fisika harus benar: tingkat energi berskala −13,6/n² (makin rapat ke atas); turun → memancarkan foton hf = ΔE (warna sesuai λ); 3→2 = 656 nm merah, 4→2 = 486, 5→2 = 434; jari-jari ∝ n²; partikel alfa terbelok makin besar makin dekat inti.
- Teks TTS terpisah dari subtitle (`src/tts.ts`; huruf tunggal & nama tokoh dieja otomatis).
- Kemulusan: `EASE` lembut, fade keluar `EASE_IN_OUT`; tanpa ganti berdasarkan ambang (silang-pudar); tanpa CSS blur; tanpa filter pada garis lurus.

## QA

- `CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/qa-moments.mjs out/x adegan:baris:offset ...` lalu `python3 scripts/contact.py out/x out/x-sheets 6` (offset positif = detik setelah baris mulai).
- `scripts/qa-lines.mjs` = still di akhir setiap baris narasi (audit menyeluruh); `scripts/qa-audit.mjs` = awal/tengah/akhir + transisi.
- Uji kemulusan: `node scripts/qa-film.mjs out/a.mp4 <frameAwal> <frameAkhir> 0.25` lalu `python3 scripts/qa-glitch.py out/a.mp4 <frameAwal>`.
