<div align="center">

# 💸 DompetKu

### Karena dompet fisik kamu udah tipis, setidaknya yang digital kelihatan rapi 😅

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

> Aplikasi manajemen keuangan pribadi yang cantik, responsif, dan tidak akan menghakimi kamu habis gajian langsung bokek.

</div>

---

## 🤔 Kenapa DompetKu?

Karena spreadsheet Excel itu membosankan, aplikasi bank terlalu serius, dan nulis di buku catatan... siapa yang masih nulis di buku catatan? 📓

DompetKu hadir dengan tampilan pink yang menenangkan jiwa (dan mungkin sedikit menyembunyikan fakta bahwa pengeluaranmu lebih besar dari pemasukan).

---

## ✨ Fitur Lengkap

| Fitur | Keterangan | Vibe |
|-------|-----------|------|
| 🔐 **Autentikasi** | Register & login dengan JWT + bcrypt, HTTP-only cookie | Fort Knox tapi pink |
| 🏠 **Dashboard** | Ringkasan bulanan, bar chart, donut chart, transaksi terbaru | Semua ada, semua jelas |
| 💸 **Transaksi** | CRUD lengkap, filter, pagination, export PDF & Excel | Catat semua, termasuk jajan tengah malam |
| 🔄 **Transfer Saldo** | Pindah dana antar Cash ↔ Bank/E-Wallet dengan validasi saldo | Biar ga salah dompet |
| 📂 **Kategori** | Kategori default + custom, color picker, icon picker | Estetik abis |
| 📋 **Template** | Preset transaksi untuk input cepat | Bayar kos tiap bulan? Tinggal klik |
| 📊 **Laporan** | Analisis bulanan dengan chart & tabel, export PDF & Excel | Bukti nyata kamu boros |
| 👁️ **Sembunyikan Saldo** | Satu klik semua angka jadi `Rp *****` | Buat yang malu lihat saldo sendiri |
| 🌐 **Multi Bahasa** | Toggle ID / EN langsung dari menu profil | Biar keliatan internasional |
| 👤 **Profil** | Edit nama inline, ganti password | Minimal bisa ganti nama kalau malu |
| 🎨 **Desain** | Pink muda feminin, animasi Framer Motion, fully responsive | Cantik di HP, cantik di laptop |
| 🔔 **Notifikasi** | Auto notif setiap transaksi masuk | Pengingat bahwa kamu baru aja belanja lagi |

---

## 🛠️ Tech Stack

```
Frontend    →  Next.js App Router + TypeScript
Styling     →  Tailwind CSS (tema rose/pink/fuchsia, karena hidup terlalu pendek untuk warna abu-abu)
Database    →  Vercel KV (Redis) di production · JSON file di lokal
Auth        →  JWT custom, HTTP-only cookie, 7 hari
Chart       →  Recharts (bar + donut)
Animasi     →  Framer Motion (biar ga kaku kayak laporan keuangan beneran)
Export      →  jsPDF + jspdf-autotable · SheetJS
Icon        →  Lucide React
Runtime     →  Bun 🐰
```

---

## 🚀 Jalankan Lokal (5 menit, serius)

**1. Clone & install**
```bash
git clone https://github.com/username/dompetku.git
cd dompetku
bun install
```

**2. Buat `.env.local`**
```env
JWT_SECRET=rahasia-banget-jangan-kasih-tau-siapapun
```
> Data otomatis tersimpan ke file JSON di `/data` — tidak perlu setup database apapun. Semudah itu.

**3. Jalankan**
```bash
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000), register akun, dan mulai catat pengeluaran yang bikin kamu menyesal. 🎉

---

## ☁️ Deploy ke Vercel

**1.** Push ke GitHub → import di [vercel.com](https://vercel.com)

**2. Setup Vercel KV** (biar data ga ilang tiap deploy)
- Dashboard project → **Storage** → **Create Database** → **KV**
- Klik **Connect to Project** — env vars otomatis masuk

**3. Tambah env var:**
```
JWT_SECRET = rahasia-banget-jangan-kasih-tau-siapapun
```

**4.** Deploy. Selesai. Pergi ngopi. ☕

---

## 📁 Struktur Project

```
dompetku/
├── app/
│   ├── (dashboard)/          # Halaman utama (protected)
│   │   ├── page.tsx          # Dashboard — tempat kamu merenung
│   │   ├── transactions/     # Daftar dosa finansial
│   │   ├── categories/       # Organisir pengeluaran biar keliatan rapi
│   │   ├── templates/        # Shortcut buat yang males ketik
│   │   ├── reports/          # Bukti tertulis kamu boros
│   │   └── profile/          # Tentang kamu (dan passwordmu)
│   ├── api/                  # API Routes
│   │   ├── auth/             # login, register, logout
│   │   ├── transactions/     # + endpoint transfer & balance
│   │   ├── categories/
│   │   ├── templates/
│   │   ├── profile/
│   │   └── reports/
│   ├── login/
│   └── register/
├── components/               # UI components yang cantik-cantik
├── lib/                      # Helper: db, jwt, auth, utils, i18n
├── data/                     # JSON storage (lokal only, jangan di-commit ke prod)
└── vercel.json
```

---

## 🔑 Environment Variables

| Variable | Keterangan | Wajib? |
|----------|-----------|--------|
| `JWT_SECRET` | Secret key JWT — makin panjang makin aman | ✅ Selalu |
| `KV_REST_API_URL` | URL Vercel KV (auto inject dari dashboard) | 🏭 Production |
| `KV_REST_API_TOKEN` | Token Vercel KV (auto inject dari dashboard) | 🏭 Production |

---

## 📝 Catatan Penting

- **Lokal** → data di `/data/*.json`, tidak perlu setup apapun
- **Production** → data di Vercel KV, persisten & aman
- Setiap user hanya bisa lihat data miliknya sendiri (scoped by `userId`) — privasi terjaga
- Kategori default otomatis di-seed saat register pertama kali
- Transfer antar wallet tidak dihitung sebagai pemasukan/pengeluaran di laporan — karena memang bukan, itu cuma pindah tempat
- Saldo wallet dihitung kumulatif dari semua riwayat, bukan per bulan

---

## 🐛 Ketemu Bug?

Buka issue, atau kalau malu, pura-pura tidak tahu dan berharap tidak ada yang sadar. Tapi lebih baik buka issue. 🙏

---

<div align="center">

Dibuat dengan 💖, ☕, dan sedikit kepanikan finansial

*"Langkah pertama menuju kebebasan finansial adalah tahu ke mana uangmu pergi. Langkah kedua adalah menangis."*

</div>
