// Naskah narasi "Tangga di Dalam Atom" — Fisika Umum: Fisika Atom.
// Setiap adegan berisi baris narasi. Durasi baris dihitung otomatis dari jumlah
// suku kata (lihat timeline.ts) atau dari rekaman suara bila sudah ada,
// jadi cukup ubah teks di sini: visual, subtitle, dan musik ikut menyesuaikan.
//
// Aturan menulis teks narasi (dibaca mesin TTS):
//  - angka & simbol ditulis sebagai kata ("dua puluh meter per detik"),
//  - rumus ditulis sebagai kalimat; rumus rapi tampil di layar (komponen Formula).
// Angka sudah dicek di naskah/AUDIT.md (g = 10 m/s², ρ air = 1000 kg/m³, p_atm = 100 kPa, kecuali disebut lain).
//
// hl     : kata/frasa yang disorot pada subtitle
// pause  : jeda (detik) SETELAH baris dibacakan
// lead   : jeda (detik) sebelum baris pertama adegan
// tail   : jeda (detik) setelah baris terakhir adegan
// fixed  : durasi tetap (detik) untuk adegan tanpa narasi

export type Line = {
  text: string;
  /** Teks khusus TTS (opsional). Bila kosong, dibuat otomatis oleh src/tts.ts. */
  tts?: string;
  hl?: string[];
  pause?: number;
};

export type SceneScript = {
  id: string;
  chapter: string; // nomor bab di heading, "" untuk tanpa heading
  part?: 1 | 2 | 3; // 1 jejak sejarah, 2 atom Bohr, 3 menuju kimia kuantum
  title: string;
  lines: Line[];
  lead?: number;
  tail?: number;
  fixed?: number;
  mood: 'mystery' | 'title' | 'wonder' | 'build' | 'tension' | 'bright' | 'resolve' | 'outro';
};

export const SCRIPT: SceneScript[] = [
  {
    "id": "hook",
    "chapter": "",
    "title": "Lampu neon, kembang api, dan bintang",
    "mood": "mystery",
    "lead": 1.6,
    "tail": 1.2,
    "lines": [
      {
        "text": "Lampu neon menyala merah jingga. Kembang api tembaga memancarkan hijau kebiruan.",
        "hl": [
          "merah jingga",
          "hijau kebiruan"
        ],
        "pause": 0.7
      },
      {
        "text": "Cahaya bintang yang ditembakkan ke prisma ternyata dipotong garis-garis gelap yang tajam.",
        "hl": [
          "garis-garis gelap"
        ],
        "pause": 0.7
      },
      {
        "text": "Setiap unsur punya warna dan garisnya sendiri, seperti sidik jari.",
        "hl": [
          "sidik jari"
        ],
        "pause": 0.8
      },
      {
        "text": "Pada awal abad kedua puluh, garis-garis ini menjadi petunjuk untuk membuka rahasia terbesar fisika:",
        "pause": 0.4
      },
      {
        "text": "bagaimana atom sebenarnya tersusun.",
        "hl": [
          "bagaimana atom"
        ],
        "pause": 0.9
      },
      {
        "text": "Jawabannya menuntun langsung ke kimia kuantum.",
        "hl": [
          "kimia kuantum"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "title",
    "chapter": "",
    "title": "Tangga di Dalam Atom",
    "mood": "title",
    "fixed": 8,
    "lines": []
  },
  {
    "id": "roadmap",
    "chapter": "",
    "title": "Peta video",
    "mood": "wonder",
    "lead": 0.8,
    "tail": 1.4,
    "lines": [
      {
        "text": "Video ini membahas fisika atom dalam tiga bagian.",
        "hl": [
          "fisika atom"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian pertama, jejak sejarah: model Thomson, percobaan Rutherford, dan krisis atom klasik.",
        "hl": [
          "jejak sejarah"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian kedua, atom Bohr: spektrum garis, postulat Bohr, tingkat energi, energi ionisasi, dan deret Balmer.",
        "hl": [
          "atom Bohr"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian ketiga, menuju kimia kuantum: keterbatasan Bohr, gelombang elektron, dan orbital.",
        "hl": [
          "menuju kimia kuantum"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "thomson",
    "chapter": "01",
    "title": "Model roti kismis Thomson",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Tahun delapan belas sembilan puluh tujuh, J. J. Thomson menemukan elektron: partikel bermuatan negatif yang jauh lebih ringan dari atom.",
        "tts": "Tahun delapan belas sembilan puluh tujuh, Je Je Tomson menemukan elektron: partikel bermuatan negatif yang jauh lebih ringan dari atom.",
        "hl": [
          "menemukan elektron"
        ],
        "pause": 0.7
      },
      {
        "text": "Massanya sekitar seperseribu delapan ratus tiga puluh enam massa proton.",
        "hl": [
          "seperseribu delapan ratus tiga puluh enam"
        ],
        "pause": 0.7
      },
      {
        "text": "Karena atom netral, Thomson membayangkan elektron tertanam dalam bola bermuatan positif yang merata, seperti kismis dalam roti.",
        "hl": [
          "kismis dalam roti"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "rutherford",
    "chapter": "02",
    "title": "Percobaan hamburan Rutherford",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Di laboratorium Ernest Rutherford, Geiger dan Marsden menembakkan partikel alfa ke lembaran emas yang sangat tipis.",
        "hl": [
          "lembaran emas"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila model Thomson benar, partikel alfa seharusnya menembus dengan sedikit belokan.",
        "hl": [
          "sedikit belokan"
        ],
        "pause": 0.7
      },
      {
        "text": "Sebagian besar memang menembus lurus. Tetapi sekitar satu dari delapan ribu memantul ke belakang.",
        "hl": [
          "memantul ke belakang"
        ],
        "pause": 0.7
      },
      {
        "text": "Rutherford berkata, rasanya seperti menembakkan peluru meriam ke kertas tisu, lalu pelurunya memantul kembali.",
        "hl": [
          "kertas tisu"
        ],
        "pause": 0.7
      },
      {
        "text": "Tahun sembilan belas sebelas, Rutherford menyimpulkan: muatan positif dan hampir seluruh massa atom terkumpul dalam inti yang sangat kecil.",
        "hl": [
          "inti yang sangat kecil"
        ],
        "pause": 0.7
      },
      {
        "text": "Inti berukuran sekitar sepuluh pangkat minus lima belas meter, seratus ribu kali lebih kecil dari atom. Bila atom sebesar stadion, intinya hanya sebesar kelereng.",
        "hl": [
          "sebesar kelereng"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "crisis",
    "chapter": "03",
    "title": "Krisis atom klasik",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Rutherford membayangkan elektron mengorbit inti seperti planet mengelilingi matahari.",
        "hl": [
          "seperti planet"
        ],
        "pause": 0.7
      },
      {
        "text": "Tetapi menurut teori elektromagnetik, muatan yang bergerak melingkar terus memancarkan gelombang elektromagnetik.",
        "hl": [
          "memancarkan gelombang"
        ],
        "pause": 0.7
      },
      {
        "text": "Elektron akan kehilangan energi, berputar spiral, dan jatuh ke inti dalam waktu sekitar sepersepuluh miliar detik.",
        "hl": [
          "jatuh ke inti"
        ],
        "pause": 0.7
      },
      {
        "text": "Atom seharusnya runtuh seketika, dan spektrumnya seharusnya kontinu. Kenyataannya atom stabil, dan spektrumnya berupa garis.",
        "hl": [
          "Kenyataannya atom stabil"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "lines",
    "chapter": "04",
    "title": "Spektrum garis",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Lewatkan arus listrik melalui gas hidrogen bertekanan rendah, lalu uraikan cahayanya dengan prisma.",
        "hl": [
          "gas hidrogen"
        ],
        "pause": 0.7
      },
      {
        "text": "Yang muncul bukan pelangi utuh, melainkan beberapa garis tajam: merah, hijau kebiruan, biru, dan ungu.",
        "hl": [
          "beberapa garis tajam"
        ],
        "pause": 0.7
      },
      {
        "text": "Garis merahnya berpanjang gelombang enam ratus lima puluh enam nanometer.",
        "hl": [
          "enam ratus lima puluh enam nanometer"
        ],
        "pause": 0.7
      },
      {
        "text": "Tahun delapan belas delapan puluh lima, Johann Balmer menemukan bahwa panjang gelombang garis-garis ini mengikuti satu rumus sederhana. Tetapi tidak ada yang tahu mengapa.",
        "hl": [
          "tidak ada yang tahu mengapa"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "bohr",
    "chapter": "05",
    "title": "Postulat Bohr",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Tahun sembilan belas tiga belas, Niels Bohr mengajukan gagasan berani.",
        "hl": [
          "Niels Bohr"
        ],
        "pause": 0.7
      },
      {
        "text": "Pertama, elektron hanya boleh berada pada orbit-orbit tertentu, dan di orbit itu ia tidak memancarkan energi.",
        "hl": [
          "orbit-orbit tertentu"
        ],
        "pause": 0.7
      },
      {
        "text": "Orbit yang diizinkan adalah yang momentum sudutnya kelipatan bulat h per dua pi.",
        "hl": [
          "kelipatan bulat"
        ],
        "pause": 0.7
      },
      {
        "text": "Kedua, elektron dapat melompat antarorbit. Saat turun, ia memancarkan satu foton yang energinya tepat sama dengan selisih energi kedua orbit.",
        "hl": [
          "satu foton"
        ],
        "pause": 0.7
      },
      {
        "text": "Gagasan ini melawan fisika klasik, tetapi menjelaskan semua garis hidrogen dengan tepat.",
        "hl": [
          "dengan tepat"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "levels",
    "chapter": "06",
    "title": "Tingkat energi atom hidrogen",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Dari postulat itu, Bohr menurunkan jari-jari orbit: r ke-n sama dengan n kuadrat dikali a nol, dengan a nol sekitar nol koma nol lima tiga nanometer.",
        "hl": [
          "n kuadrat dikali a nol"
        ],
        "pause": 0.7
      },
      {
        "text": "Energinya E ke-n sama dengan minus tiga belas koma enam elektronvolt dibagi n kuadrat.",
        "hl": [
          "minus tiga belas koma enam elektronvolt dibagi n kuadrat"
        ],
        "pause": 0.7
      },
      {
        "text": "Tingkat pertama minus tiga belas koma enam, tingkat kedua minus tiga koma empat, tingkat ketiga minus satu koma lima satu elektronvolt.",
        "hl": [
          "minus tiga koma empat"
        ],
        "pause": 0.7
      },
      {
        "text": "Makin tinggi n, tingkatnya makin rapat, dan mendekati nol.",
        "hl": [
          "makin rapat"
        ],
        "pause": 0.7
      },
      {
        "text": "Tanda minus berarti elektron terikat: perlu energi untuk melepaskannya.",
        "hl": [
          "elektron terikat"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "ionization",
    "chapter": "07",
    "title": "Energi ionisasi",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Energi ionisasi adalah energi minimum untuk melepaskan elektron dari keadaan dasar sampai tak terhingga.",
        "hl": [
          "Energi ionisasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Untuk hidrogen, itu berarti dari n sama dengan satu ke n tak terhingga: tepat tiga belas koma enam elektronvolt.",
        "hl": [
          "tiga belas koma enam elektronvolt"
        ],
        "pause": 0.7
      },
      {
        "text": "Dalam satuan kimia, itu sekitar seribu tiga ratus dua belas kilojoule per mol, persis sama dengan hasil pengukuran.",
        "hl": [
          "seribu tiga ratus dua belas kilojoule per mol"
        ],
        "pause": 0.7
      },
      {
        "text": "Foton dengan panjang gelombang di bawah sembilan puluh satu nanometer, di daerah ultraungu jauh, mampu mengionkan atom hidrogen.",
        "hl": [
          "sembilan puluh satu nanometer"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "balmer",
    "chapter": "08",
    "title": "Deret Balmer dan deret lainnya",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Sekarang garis-garis hidrogen punya penjelasan.",
        "hl": [
          "punya penjelasan"
        ],
        "pause": 0.7
      },
      {
        "text": "Elektron yang turun dari tingkat tiga ke tingkat dua melepaskan foton satu koma delapan sembilan elektronvolt: itulah garis merah enam ratus lima puluh enam nanometer.",
        "hl": [
          "satu koma delapan sembilan elektronvolt"
        ],
        "pause": 0.7
      },
      {
        "text": "Dari empat ke dua, garis hijau kebiruan empat ratus delapan puluh enam nanometer. Dari lima ke dua, garis biru empat ratus tiga puluh empat nanometer.",
        "hl": [
          "empat ratus delapan puluh enam"
        ],
        "pause": 0.7
      },
      {
        "text": "Semua lompatan yang berakhir di tingkat dua membentuk deret Balmer, yang tampak oleh mata.",
        "hl": [
          "deret Balmer"
        ],
        "pause": 0.7
      },
      {
        "text": "Lompatan yang berakhir di tingkat satu membentuk deret Lyman di ultraungu, dan yang berakhir di tingkat tiga membentuk deret Paschen di inframerah.",
        "hl": [
          "deret Lyman",
          "deret Paschen"
        ],
        "pause": 0.7
      },
      {
        "text": "Satu rumus Rydberg menjelaskan semuanya: satu per lambda sama dengan R, dikali selisih satu per n kuadrat.",
        "hl": [
          "rumus Rydberg"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "limits",
    "chapter": "09",
    "title": "Keterbatasan model Bohr",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Model Bohr luar biasa untuk hidrogen. Tetapi ia gagal untuk atom berelektron banyak, bahkan untuk helium.",
        "hl": [
          "gagal"
        ],
        "pause": 0.7
      },
      {
        "text": "Ia tidak bisa menjelaskan mengapa sebagian garis lebih terang daripada yang lain, atau mengapa garis terbelah di dalam medan magnet.",
        "hl": [
          "garis terbelah"
        ],
        "pause": 0.7
      },
      {
        "text": "Dan Bohr tidak menjelaskan mengapa hanya orbit tertentu yang diizinkan. Ia hanya menetapkannya.",
        "hl": [
          "hanya menetapkannya"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "matterwave",
    "chapter": "10",
    "title": "Elektron sebagai gelombang berdiri",
    "mood": "wonder",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Jawabannya datang dari de Broglie: elektron adalah gelombang, dengan panjang gelombang h per p.",
        "hl": [
          "elektron adalah gelombang"
        ],
        "pause": 0.7
      },
      {
        "text": "Gelombang yang mengelilingi inti harus bertemu dirinya sendiri dengan mulus. Hanya orbit yang kelilingnya memuat bilangan bulat panjang gelombang yang bertahan.",
        "hl": [
          "bilangan bulat panjang gelombang"
        ],
        "pause": 0.7
      },
      {
        "text": "Syarat itu tepat sama dengan aturan momentum sudut Bohr. Kuantisasi ternyata adalah gelombang berdiri.",
        "hl": [
          "gelombang berdiri"
        ],
        "pause": 0.7
      },
      {
        "text": "Tahun sembilan belas dua puluh enam, Erwin Schrödinger menulis persamaan gelombang untuk elektron, dan tingkat energi hidrogen muncul dengan sendirinya.",
        "hl": [
          "Erwin Schrödinger"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "orbitals",
    "chapter": "11",
    "title": "Dari orbit ke orbital",
    "mood": "wonder",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Dalam mekanika kuantum, elektron tidak lagi punya lintasan yang tajam.",
        "hl": [
          "tidak lagi punya lintasan"
        ],
        "pause": 0.7
      },
      {
        "text": "Yang ada adalah orbital: awan peluang yang menunjukkan di mana elektron mungkin ditemukan.",
        "hl": [
          "awan peluang"
        ],
        "pause": 0.7
      },
      {
        "text": "Orbital satu s berbentuk bola. Orbital dua p berbentuk dua cuping. Orbital tiga d punya empat cuping.",
        "hl": [
          "satu s",
          "dua p",
          "tiga d"
        ],
        "pause": 0.7
      },
      {
        "text": "Bentuk-bentuk orbital inilah yang menentukan bagaimana atom berikatan, sudut ikatan molekul, dan susunan tabel periodik.",
        "hl": [
          "tabel periodik"
        ],
        "pause": 0.7
      },
      {
        "text": "Di sinilah fisika atom berakhir, dan kimia kuantum dimulai.",
        "hl": [
          "kimia kuantum dimulai"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "recap",
    "chapter": "12",
    "title": "Rangkuman",
    "mood": "resolve",
    "lead": 1.0,
    "tail": 1.6,
    "lines": [
      {
        "text": "Mari rangkum.",
        "pause": 0.5
      },
      {
        "text": "Rutherford menemukan inti yang sangat kecil, tetapi atom klasik seharusnya runtuh.",
        "hl": [
          "inti yang sangat kecil"
        ],
        "pause": 0.7
      },
      {
        "text": "Bohr mengusulkan orbit terkuantisasi: E ke-n sama dengan minus tiga belas koma enam elektronvolt per n kuadrat.",
        "hl": [
          "orbit terkuantisasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Lompatan antartingkat menghasilkan garis spektrum: Lyman, Balmer, dan Paschen. Energi ionisasi hidrogen tiga belas koma enam elektronvolt.",
        "hl": [
          "garis spektrum"
        ],
        "pause": 0.7
      },
      {
        "text": "De Broglie dan Schrödinger menunjukkan bahwa kuantisasi lahir dari elektron sebagai gelombang berdiri, dan orbit berubah menjadi orbital.",
        "hl": [
          "orbital"
        ],
        "pause": 0.7
      },
      {
        "text": "Jadi, setiap kali melihat cahaya berwarna dari suatu unsur, tanyakan: dari tingkat mana elektron itu jatuh, dan ke tingkat mana?",
        "hl": [
          "dari tingkat mana"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "outro",
    "chapter": "",
    "title": "Penutup",
    "mood": "outro",
    "fixed": 16,
    "lines": []
  }
];
