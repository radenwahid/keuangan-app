<div align="center">

# 💸 DompetKu

### Aplikasi manajemen keuangan pribadi yang cantik & mudah digunakan

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|-----------|
| 🔐 Autentikasi | Register & login dengan JWT + bcrypt, HTTP-only cookie |
| 🏠 Dashboard | Ringkasan bulanan, bar chart, donut chart, transaksi terbaru |
| 💸 Transaksi | CRUD lengkap, filter, pagination, export PDF & Excel |
| 📂 Kategori | Kategori default + custom, color picker, icon picker |
| 📋 Template | Preset transaksi untuk input cepat |
| 📊 Laporan | Analisis bulanan dengan chart & tabel, export PDF & Excel |
| 👤 Profil | Edit nama inline, ganti password |
| 🎨 Tema | Pink muda feminin, animasi Framer Motion, fully responsive |

---

## 🛠️ Tech Stack

- **Framework** — Next.js 14 App Router
- **Styling** — Tailwind CSS (tema rose/pink/fuchsia)
- **Database** — Vercel KV (Redis) di production · JSON file di lokal
- **Auth** — JWT custom, HTTP-only cookie, 7 hari
- **Chart** — Recharts (bar + donut)
- **Animasi** — Framer Motion
- **Export** — jsPDF + jspdf-autotable (PDF) · SheetJS (Excel)
- **Icon** — Lucide React
- **Runtime** — Bun

---

## 🚀 Cara Menjalankan Lokal

**1. Clone & install**
```bash
git clone https://github.com/username/keuangan-app.git
cd keuangan-app
bun install
```

**2. Buat file `.env.local`**
```env
JWT_SECRET=isi-dengan-random-string-panjang
```
> Di lokal, data otomatis disimpan ke file JSON di folder `/data` — tidak perlu setup KV.

**3. Jalankan**
```bash
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## ☁️ Deploy ke Vercel

**1. Push ke GitHub, lalu import project di [vercel.com](https://vercel.com)**

**2. Setup Vercel KV**
- Di dashboard project → tab **Storage** → **Create Database** → pilih **KV**
- Klik **Connect to Project** — env vars otomatis ter-inject

**3. Tambah Environment Variable**
```
JWT_SECRET = isi-dengan-random-string-panjang
```

**4. Deploy** — selesai. Data tersimpan permanen di Vercel KV.

> Untuk dev lokal setelah setup KV, download `.env.local` dari dashboard KV dan taruh di root project.

---

## 📁 Struktur Project

```
keuangan-app/
├── app/
│   ├── (dashboard)/        # Halaman utama (protected)
│   │   ├── page.tsx        # Dashboard
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── templates/
│   │   ├── reports/
│   │   └── profile/
│   ├── api/                # API Routes
│   │   ├── auth/           # login, register, logout
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── templates/
│   │   ├── profile/
│   │   └── reports/
│   ├── login/
│   └── register/
├── components/             # UI components
├── lib/                    # Helper: db, jwt, auth, utils
├── data/                   # JSON storage (lokal only)
└── vercel.json
```

---

## 🔑 Environment Variables

| Variable | Keterangan | Wajib |
|----------|-----------|-------|
| `JWT_SECRET` | Secret key untuk signing JWT | ✅ |
| `KV_REST_API_URL` | URL Vercel KV (auto dari dashboard) | Production |
| `KV_REST_API_TOKEN` | Token Vercel KV (auto dari dashboard) | Production |

---

## 📝 Catatan

- Data lokal disimpan di `/data/*.json` — tidak perlu setup apapun
- Data production disimpan di Vercel KV sebagai JSON — persisten & aman
- Setiap user hanya bisa melihat data miliknya sendiri (scoped by `userId`)
- Kategori default otomatis di-seed saat user pertama kali register

---

<div align="center">
  Dibuat dengan 💖 menggunakan Next.js & Tailwind CSS
</div>
