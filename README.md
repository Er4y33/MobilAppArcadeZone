# 🎮 ArcadeZone — Mobil Oyun Platformu

React Native ile geliştirilmiş, beş mini oyun içeren tam kapsamlı (full-stack) mobil oyun platformu. Oyuncular skor kaydeder, haftalık görevleri tamamlayarak coin kazanır ve mağazadan görsel öğeler satın alır.

## 📋 Proje Hakkında

**Mobil Uygulama Geliştirme II** ve **Veri Tabanı Uygulamaları** derslerinin ortak final projesidir.

Oyun mekanikleri, backend ve sistem tasarımı: Eray Çocuk

Tasarım ve UI/UX: Melih Atahan Akgün

## 🎮 Oyunlar

| Oyun               | Beceri                      | Skor Mantığı        |
| ------------------ | --------------------------- | ------------------- |
| ⚡ Reaction Tap    | Refleks                     | Düşük ms = iyi      |
| 🧠 Memory Match    | Görsel hafıza               | Az hamle = iyi      |
| ⏱ Son Saniye       | Kelime bilgisi              | Yüksek puan = iyi   |
| 🔢 Sayı Avı        | Matematik / hızlı hesaplama | Yüksek puan = iyi   |
| 🎨 Sırayı Takip Et | Sıralı hafıza               | Yüksek seviye = iyi |

## ✨ Özellikler

**Haftalık Görevler** — 15 görevlik havuzdan her hafta 6 görev seçilir. Seçim deterministiktir: aynı hafta liste değişmez, hafta değişince otomatik yenilenir. İlerleme yalnızca o haftanın oturumlarından hesaplanır. Görevler kolay/orta/zor olarak sınıflandırılır ve zorluğa göre coin ödülü verir.

**Mağaza** — Avatar çerçeveleri ve oyuncu unvanları satın alınıp kuşanılabilir, profilde görüntülenir.

**Profil İstatistikleri** — Oyun bazlı oynama dağılımı ve son 7 günlük aktivite grafikleri, XP/seviye takibi, en iyi skorlar.

**Diğer** — Oyun bazlı liderlik tablosu, açık/koyu tema desteği.

> Tüm ödül ve satın alma işlemleri `security definer` veritabanı fonksiyonları üzerinden yapılır; istemci tarafından doğrudan coin veya öğe eklenemez.

## 🏗️ Mimari

MobilAppArcadeZone/ ← Frontend (React Native)
├── app/
│ ├── (auth)/ ← Login, Signup
│ └── (tabs)/ ← Ana Menü, Oyunlar, Görevler, Mağaza,
│ └── game/play/ Liderboard, Profil, Ayarlar + oyun ekranları
├── constants/tasks.ts ← Görev havuzu ve hafta hesaplamaları
├── context/
│ ├── AuthContext.tsx ← Supabase Auth ve profil
│ ├── ScoreContext.tsx ← Skor kayıt ve çekme
│ └── ThemeContext.tsx ← Karanlık/Aydınlık tema
└── lib/supabase.ts ← Supabase client

BackEndArcadeZone/ ← Backend (NestJS)
├── src/
│ ├── auth/ ← JWT, Bcrypt, Guards, Strategies
│ ├── players/ ← Oyuncu CRUD
│ ├── games/ ← Oyun CRUD (admin korumalı silme)
│ └── game-sessions/ ← Oturum CRUD
└── database/ ← Supabase SQL şemaları

## 🛠️ Teknoloji Yığını

**Frontend:** React Native (Expo Router), TypeScript, Supabase JS Client, AsyncStorage

**Backend:** NestJS, TypeORM, PostgreSQL (Supabase Cloud), JWT (Access + Refresh), Bcrypt, Passport.js

## 🗄️ Veritabanı

| Tablo              | Açıklama                                           |
| ------------------ | -------------------------------------------------- |
| `players`          | Oyuncu profili: level, xp, coins, kuşanılan öğeler |
| `games`            | Oyun tanımları ve skor etiketleri                  |
| `game_sessions`    | Oyun oturumu skorları                              |
| `store_items`      | Mağaza ürünleri (çerçeve, unvan)                   |
| `player_items`     | Oyuncunun sahip olduğu öğeler                      |
| `task_definitions` | Görev tanımları (sunucu tarafı doğrulama)          |
| `player_tasks`     | Ödülü alınmış görevler (hafta bazlı)               |
| `leaderboard_view` | En iyi skorları hesaplayan SQL View                |

**RPC Fonksiyonları:** `record_game_session` (skor + XP + coin), `claim_task_reward` (görev doğrulama ve ödül), `purchase_item`, `equip_item` / `unequip_category`

## 🔐 Authentication

| Endpoint         | Method | Açıklama               |
| ---------------- | ------ | ---------------------- |
| `/auth/register` | POST   | Yeni kullanıcı kaydı   |
| `/auth/login`    | POST   | Giriş, JWT token döner |
| `/auth/profile`  | GET    | Profil (JWT gerekli)   |
| `/auth/logout`   | POST   | Çıkış                  |
| `/auth/refresh`  | POST   | Token yenileme         |

## 🚀 Kurulum

### Frontend

```bash
git clone https://github.com/MelihAtahanAkgun/MobilAppArcadeZone.git
cd MobilAppArcadeZone
npm install
```

`.env` dosyası:

EXPO_PUBLIC_SUPABASE_URL=https://fqkywfhkzwgoinhjcfoc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

`database/` klasöründeki SQL dosyalarını Supabase SQL Editor'de sırayla çalıştırın, ardından:

```bash
npx expo start
```

### Backend

```bash
git clone https://github.com/Er4y33/BackEndArcadeZone.git
cd BackEndArcadeZone
npm install
```

`.env` dosyası:

DATABASE_URL=postgresql://postgres:[SIFRE]@[HOST]:5432/postgres
EXPO_PUBLIC_SUPABASE_URL=https://[PROJE_REF].supabase.co
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000

```bash
npm run start:dev
```

## 👥 Geliştiriciler

| İsim               | Rol                  | GitHub                                                   |
| ------------------ | -------------------- | -------------------------------------------------------- |
| Eray Çocuk              | 	Oyun mekanikleri, backend, veritabanı, ekonomi tasarımı, yayın süreci | [@Er4y33](https://github.com/Er4y33)                     |
| Melih Atahan Akgün | Frontend & UI/UX     | [@MelihAtahanAkgun](https://github.com/MelihAtahanAkgun) |
