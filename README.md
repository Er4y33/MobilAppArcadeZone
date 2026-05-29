# 🎮 ArcadeZone — Mobil Oyun Platformu

ArcadeZone, React Native ile geliştirilmiş, üç farklı mini oyun içeren tam kapsamlı (full-stack) bir mobil oyun platformudur.

## 📋 Proje Hakkında

Bu proje, **Mobil Uygulama Geliştirme II** ve **Veri Tabanı Uygulamaları** derslerinin ortak final projesidir.

- **Frontend:** React Native (Expo) — Melih Atahan Akgün
- **Backend:** NestJS + TypeORM + Supabase — Eray

## 🏗️ Mimari

```
MobilAppArcadeZone/          ← Frontend (React Native)
  ├── app/
  │   ├── (auth)/            ← Login, Signup ekranları
  │   ├── (tabs)/            ← Ana Menü, Oyunlar, Liderboard, Profil, Ayarlar
  │   └── game/play/         ← Reaction Tap, Memory Match, Son Saniye
  ├── context/
  │   ├── AuthContext.tsx    ← Supabase Auth yönetimi
  │   ├── ScoreContext.tsx   ← Skor kayıt ve çekme
  │   └── ThemeContext.tsx   ← Karanlık/Aydınlık tema
  └── lib/
      └── supabase.ts        ← Supabase client bağlantısı

BackEndArcadeZone/           ← Backend (NestJS)
  ├── src/
  │   ├── auth/              ← JWT, Bcrypt, Guards, Strategies
  │   ├── players/           ← Oyuncu CRUD
  │   ├── games/             ← Oyun CRUD (admin korumalı silme)
  │   └── game-sessions/     ← Oturum CRUD
  └── database/              ← Supabase SQL şemaları
```

## 🎮 Oyunlar

| Oyun | Açıklama | Skor Mantığı |
|------|----------|-------------|
| ⚡ Reaction Tap | Ekranda çıkan hedefe hızlı dokun | Düşük ms = iyi |
| 🃏 Memory Match | Kart eşleştirme oyunu | Az hamle = iyi |
| 🔤 Son Saniye | Karışık harflerden kelime bul | Yüksek puan = iyi |

## 🛠️ Teknoloji Yığını

**Frontend:**
- React Native (Expo Router)
- TypeScript
- Supabase JS Client
- AsyncStorage

**Backend:**
- NestJS + TypeScript
- TypeORM
- PostgreSQL (Supabase Cloud)
- JWT (Access + Refresh Token)
- Bcrypt
- Passport.js (LocalStrategy + JwtStrategy)

## 🚀 Kurulum

### Frontend (MobilAppArcadeZone)

```bash
git clone https://github.com/MelihAtahanAkgun/MobilAppArcadeZone.git
cd MobilAppArcadeZone
npm install
```

`.env` dosyasını oluştur:
```
EXPO_PUBLIC_SUPABASE_URL=https://fqkywfhkzwgoinhjcfoc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npx expo start
```

### Backend (BackEndArcadeZone)

```bash
git clone https://github.com/Er4y33/BackEndArcadeZone.git
cd BackEndArcadeZone
npm install
```

`.env` dosyasını oluştur:
```
DATABASE_URL=postgresql://postgres:[SIFRE]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

```bash
npm run start:dev
```

## 🔐 Authentication

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/auth/register` | POST | Yeni kullanıcı kaydı |
| `/auth/login` | POST | Giriş, JWT token döner |
| `/auth/profile` | GET | Profil (JWT gerekli) |
| `/auth/logout` | POST | Çıkış |
| `/auth/refresh` | POST | Token yenileme |

## 🗄️ Veritabanı Şeması

```
players          → Oyuncu profilleri (UUID, username, email, level, xp, coins)
games            → Oyun tanımları (reaction, memory, sonsaniye)
game_sessions    → Oyun skorları (player_id, game_id, score, played_at)
leaderboard_view → En iyi skorları hesaplayan SQL View
```

## 👥 Geliştiriciler

| İsim | Rol | GitHub |
|------|-----|--------|
| Eray | Backend & Veritabanı | [@Er4y33](https://github.com/Er4y33) |
| Melih Atahan Akgün | Frontend & UI/UX | [@MelihAtahanAkgun](https://github.com/MelihAtahanAkgun) |
