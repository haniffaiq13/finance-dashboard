# Finance Dashboard - Internal Organization Management System

Dashboard internal untuk mengelola keuangan dan user organisasi dengan sistem kontrol akses berbasis peran (RBAC).

## 🚀 Fitur Utama

### 📊 Dashboard & Analytics
- Ringkasan keuangan real-time
- Grafik trend saldo bulanan
- Chart pemasukan vs pengeluaran
- Distribusi kategori pengeluaran
- Filter data berdasarkan periode dan kategori

### 💰 Manajemen Keuangan
- CRUD transaksi pemasukan dan pengeluaran
- Upload lampiran (PDF, gambar)
- Kategorisasi transaksi
- Export data ke CSV
- Filter dan pencarian transaksi

### 👥 Manajemen user
- CRUD data user organisasi
- Status user (Aktif/Non-aktif)
- Manajemen peran user
- Statistik keuseran

### 🔐 Sistem Autentikasi & Otorisasi
- Login/Register dengan validasi
- Role-Based Access Control (RBAC)
- 3 tingkat akses: finance, writer, user
- Session management dengan localStorage

## 🏗️ Arsitektur Sistem

### Frontend
- **Framework**: Next.js 13 dengan App Router
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

### Data Layer (Sementara)
- **Mode**: JSON files + localStorage
- **Files**: 
  - `data/users.json` - Data pengguna
  - `data/members.json` - Data user
  - `data/transactions.json` - Data transaksi
- **Persistence**: localStorage untuk perubahan data

### API Layer (Siap untuk Integrasi)
- **Structure**: Abstraction layer di `lib/api/`
- **Services**: auth, finance, members
- **Ready**: Mudah diganti dengan real API calls

## 🎯 Role-Based Access Control

| Fitur | finance | writer | user |
|-------|-----------|------------|---------|
| Dashboard | ✅ Read | ✅ Read | ✅ Read |
| Transaksi | ✅ CRUD | ❌ Read Only | ❌ Read Only |
| user | ❌ Read Only | ✅ CRUD | ❌ Read Only |
| Export Data | ✅ Yes | ❌ Read Only | ❌ No |
| Charts | ✅ Read | ✅ Read | ✅ Read |

## 🔧 Setup & Installation

```bash
# Clone repository
git clone <repository-url>
cd finance-dashboard

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| finance | finance | password123 |
| writer | writer | password123 |
| user | user1 | password123 |

## 📁 Struktur Project

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── keuangan/          # Finance management
│   ├── user/           # Member management
│   └── profile/           # User profile
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── finance/          # Finance-specific components
│   ├── members/          # Member-specific components
│   └── charts/           # Chart components
├── lib/                   # Utilities & services
│   ├── api/              # API abstraction layer
│   ├── auth.ts           # Authentication logic
│   ├── rbac.ts           # Role-based access control
│   ├── format.ts         # Formatting utilities
│   └── upload.ts         # File upload handling
├── store/                 # Zustand stores
├── data/                  # JSON data files
└── types/                 # TypeScript definitions
```

## 🔄 Migrasi ke API

Sistem sudah siap untuk migrasi ke backend API:

1. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_API_MODE=api
   NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api
   ```

2. **API Endpoints yang Dibutuhkan**:
   ```
   POST   /auth/login
   POST   /auth/register
   GET    /auth/me
   POST   /auth/logout
   
   GET    /transactions
   POST   /transactions
   PUT    /transactions/:id
   DELETE /transactions/:id
   GET    /transactions/summary
   GET    /transactions/charts
   
   GET    /members
   POST   /members
   PUT    /members/:id
   DELETE /members/:id
   GET    /members/stats
   ```

3. **Uncomment API calls** di file `lib/api/*.ts`

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Ready (shadcn/ui support)
- **Loading States**: Skeleton loading & spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Form Validation**: Real-time validation dengan Zod
- **File Upload**: Drag & drop dengan preview
- **Data Export**: CSV export dengan filtering

## 🔒 Security Features

- **Input Validation**: Zod schemas untuk semua form
- **XSS Protection**: Sanitized inputs
- **CSRF Protection**: Ready untuk implementasi
- **File Upload Security**: Type & size validation
- **Session Management**: Secure token handling
- **Role Validation**: Server-side permission checks

## 📊 Data Management

### Current (JSON Mode)
- Data disimpan di JSON files
- Perubahan di-persist ke localStorage
- Cocok untuk development & demo

### Future (API Mode)
- Real database integration
- Server-side validation
- Proper authentication
- File storage service
- Audit logging

## 🚀 Deployment

### Static Export (Current)
```bash
npm run build
# Output di folder 'out/'
```

### With API Backend
```bash
# Update next.config.js
# Remove 'output: export'
npm run build
npm start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License - see LICENSE file for details

---

**Status**: ✅ Ready for production (JSON mode) | 🔄 Ready for API integration
