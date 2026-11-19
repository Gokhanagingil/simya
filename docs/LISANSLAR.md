# Lisanslar

## Yazı tipi

- **Atkinson Hyperlegible Next** — SIL Open Font License 1.1.
  Telif: 2020-2024 The Atkinson Hyperlegible Next Project Authors
  (https://github.com/googlefonts/atkinson-hyperlegible-next). npm paketi `@fontsource/atkinson-hyperlegible-next`
  aracılığıyla uygulamaya **gömülüdür** (internetten yüklenmez). Lisans metni:
  `node_modules/@fontsource/atkinson-hyperlegible-next/LICENSE`.

## Görseller

- Tüm grafikler (şişeler, simgeler, malzeme amblemleri, hikâye resimleri, uygulama simgesi, açılış ekranı)
  bu proje için **kodla çizilmiş özgün SVG'lerdir** (`src/components/*.tsx`, `assets/*.svg`).
  Üçüncü taraf görsel kullanılmamıştır. Emoji kullanılmaz.

## Sesler

- Tüm ses efektleri ve müzik çalışma anında **Web Audio API ile üretilir** (`src/audio/sound.ts`).
  Ses dosyası yoktur; üçüncü taraf ses kullanılmamıştır.

## Yazılım bağımlılıkları (uygulamaya giren)

| Paket                                                                                  | Lisans     |
| -------------------------------------------------------------------------------------- | ---------- |
| react, react-dom 19                                                                    | MIT        |
| @capacitor/core, @capacitor/android 8                                                  | MIT        |
| @capacitor/app, @capacitor/preferences, @capacitor/haptics, @capacitor/splash-screen 8 | MIT        |
| AndroidX kütüphaneleri (Capacitor üzerinden)                                           | Apache 2.0 |

Geliştirme araçları (Vite, Vitest, TypeScript, ESLint, Prettier, Playwright, axe-core) uygulamaya girmez;
lisansları kendi paketlerindedir (MIT / Apache 2.0 / MPL 2.0 — axe-core).

## Gizlilik

Analitik, izleme ya da reklam SDK'sı yoktur. Uygulama ağ kullanmaz; içerik güvenlik politikası (CSP) dış
bağlantıları engeller.
