# EYD Checker — Indonesian EYD/PUEBI Checker

Full-stack demo: React + Tailwind frontend, FastAPI backend.

## Rangkuman Presentasi

**EYD/PUEBI Checker** adalah aplikasi web full-stack yang dirancang untuk membantu pengguna memeriksa dan mengoreksi ejaan bahasa Indonesia sesuai dengan aturan Ejaan Yang Disempurnakan (EYD) atau Pedoman Umum Ejaan Bahasa Indonesia (PUEBI). Aplikasi ini menggabungkan teknologi modern untuk memberikan pengalaman pengguna yang intuitif dan akurat.

### Arsitektur Aplikasi

#### Frontend (React + Vite)
- **Framework**: React dengan Vite sebagai build tool
- **Styling**: Tailwind CSS untuk desain responsif dan modern
- **Fitur UI**:
  - Editor teks dengan placeholder bahasa Indonesia
  - Mode gelap/terang untuk kenyamanan mata
  - Preview real-time hasil koreksi
  - Tombol terima/abaikan untuk setiap saran
  - Fitur undo/redo untuk navigasi keputusan
  - Opsi copy dan download teks yang telah dikoreksi

#### Backend (FastAPI + Python)
- **Framework**: FastAPI untuk API REST yang cepat dan aman
- **Database**: SQLite untuk penyimpanan feedback pengguna
- **CORS**: Middleware untuk komunikasi frontend-backend
- **Endpoint utama**:
  - `/check_eyd`: Menganalisis teks dan memberikan saran koreksi
  - `/feedback`: Menyimpan keputusan pengguna (terima/abaikan)

### Fitur Utama

#### 1. Analisis Berbasis Aturan
Aplikasi menggunakan algoritma heuristik untuk mendeteksi kesalahan umum dalam bahasa Indonesia:

- **Kapitalisasi**: Huruf awal kalimat, kata setelah tanda baca akhir kalimat, nama setelah sapaan (Pak/Bu)
- **Partikel**: -nya, -kah, -lah harus melekat pada kata sebelumnya
- **Preposisi**: "di", "ke", "dari" harus dipisah jika berfungsi sebagai preposisi
- **Tanda Baca**: Spasi setelah koma, penghapusan spasi berlebih, penghapusan spasi sebelum tanda baca

#### 2. Interaksi Pengguna
- **Preview Visual**: Menampilkan teks asli dan teks dengan koreksi yang disarankan
- **Kontrol Granular**: Setiap saran dapat diterima atau diabaikan secara individual
- **Riwayat Keputusan**: Fitur undo/redo untuk mengubah keputusan
- **Ekspor Hasil**: Copy ke clipboard atau download sebagai file teks

#### 3. Sistem Feedback
- **Penyimpanan Lokal**: Feedback disimpan dalam database SQLite
- **Pelacakan Keputusan**: Mencatat apakah saran diterima atau diabaikan
- **Potensi Pengembangan**: Data feedback dapat digunakan untuk melatih model ML di masa depan

### Teknologi yang Digunakan

#### Frontend
- React 18
- Vite
- Tailwind CSS
- PostCSS
- Lucide React (untuk ikon)

#### Backend
- Python 3.10+
- FastAPI
- Pydantic (validasi data)
- SQLite
- Uvicorn (server ASGI)

### Cara Kerja Aplikasi

1. **Input Teks**: Pengguna memasukkan teks bahasa Indonesia ke dalam textarea
2. **Analisis**: Backend memproses teks menggunakan algoritma berbasis aturan
3. **Tampilan Saran**: Frontend menampilkan daftar saran koreksi dengan penjelasan aturan
4. **Interaksi**: Pengguna dapat menerima atau mengabaikan setiap saran
5. **Preview**: Teks yang dikoreksi ditampilkan secara real-time
6. **Ekspor**: Hasil akhir dapat disalin atau didownload

### Keunggulan Aplikasi

- **Ringan dan Cepat**: Tidak memerlukan model ML berat, cocok untuk deployment sederhana
- **Deterministik**: Hasil analisis konsisten untuk input yang sama
- **User-Friendly**: Interface intuitif dengan kontrol penuh kepada pengguna
- **Extensible**: Mudah ditambahkan aturan baru atau integrasi ML
- **Open Source**: Kode tersedia untuk pengembangan lebih lanjut

### Potensi Pengembangan

- **Integrasi ML**: Menambahkan model IndoBERT untuk akurasi lebih tinggi
- **Batch Processing**: Menganalisis multiple file sekaligus
- **Real-time Checking**: Validasi saat mengetik
- **Collaborative Features**: Berbagi dan review bersama
- **Mobile App**: Versi native untuk perangkat mobile

### Kesimpulan

EYD/PUEBI Checker adalah solusi praktis untuk membantu penulis dan editor bahasa Indonesia menjaga kualitas ejaan teks mereka. Dengan kombinasi teknologi web modern dan algoritma linguistik yang cerdas, aplikasi ini menawarkan pengalaman yang efisien dan akurat untuk kebutuhan proofreading sehari-hari.

Quick start (requires Node.js and Python 3.10+):

1) Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and test the app. The frontend calls `http://localhost:8000/check_eyd`.

Notes:
- Backend includes light rule-based EYD checks and an optional IndoBERT scoring path (if `transformers` and a model are installed).
- Feedback is saved in `backend/feedback.db` (SQLite) when users submit acceptance/ignore decisions.
# eydcheecker990