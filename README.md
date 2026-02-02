<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Rodinya Case Project

Bu proje, NestJS framework'ü kullanılarak geliştirilmiş bir backend uygulamasıdır. Kullanıcı yönetimi, JWT tabanlı kimlik doğrulama ve medya (dosya) yönetimi özelliklerini içerir.

## 🚀 Teknolojiler

- **Framework:** [NestJS](https://github.com/nestjs/nest)
- **Veritabanı:** MongoDB (Mongoose)
- **Kimlik Doğrulama:** JWT (Passport.js)
- **Dokümantasyon:** Swagger (OpenAPI)
- **Dosya Yükleme:** Multer
- **Validasyon:** Class-validator & Class-transformer

## 📋 Gereksinimler

Projenin yerel makinenizde çalışması için aşağıdaki araçların yüklü olması gerekir:

- Node.js (v18 veya üzeri önerilir)
- npm (veya yarn/pnpm)
- MongoDB (Yerel veya MongoDB Atlas)

## 🛠 Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/uyarhamit/rodinya-case.git
cd rodinya-case
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Çevre değişkenlerini ayarlayın:
`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli bilgileri doldurun:
```bash
cp .env.example .env
```
`.env` dosyasındaki `MONGODB_URI`, `JWT_ACCESS_SECRET` gibi alanları kendi yapılandırmanıza göre düzenlemeyi unutmayın.

## 🏃 Uygulamayı Çalıştırma

```bash
# Geliştirme modu (Watch mode)
npm run start:dev

# Normal başlatma
npm run start

# Üretim (Production) modu
npm run start:prod
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

## 📖 API Dokümantasyonu (Swagger)

Uygulama çalıştıktan sonra API uç noktalarını incelemek ve test etmek için Swagger arayüzüne erişebilirsiniz:

[http://localhost:3000/swagger](http://localhost:3000/swagger)

*Not: Korumalı uç noktalar için `Bearer <token>` formatında JWT kullanmanız gerekmektedir.*

## 🧪 Testler

```bash
# Birim (Unit) testleri
npm run test

# Uçtan uca (e2e) testler
npm run test:e2e

# Test kapsamı (Coverage)
npm run test:cov
```

## 📂 Proje Yapısı

- `src/api/auth`: Kayıt, giriş ve JWT stratejileri.
- `src/api/users`: Kullanıcı profili ve yönetimi.
- `src/api/media`: Dosya yükleme, listeleme ve izin yönetimi.
- `uploads/`: Yüklenen dosyaların saklandığı dizin.

## 📄 Lisans

Bu proje [UNLICENSED](LICENSE) olarak lisanslanmıştır.
