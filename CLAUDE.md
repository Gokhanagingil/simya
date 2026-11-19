# Simyacının Sırrı — Geliştirici Notları

Android (dikey) için Türkçe bir sıvı sıralama bulmaca oyunu. Hedef oyuncu 65 yaş üstü, zihnen keskin
ve rekabetçi bir kadın. İlke: **arayüz kolay, bulmaca zor.**

- Tasarımın tek doğru kaynağı: `docs/TASARIM.md`. Tasarım değişirse ÖNCE orası güncellenir.
- Güncel durum ve kararlar: `DURUM.md`. Çalışmaya her başlayışta önce onu oku.

## Komutlar

| İş                                        | Komut                                                  |
| ----------------------------------------- | ------------------------------------------------------ |
| Geliştirme sunucusu                       | `npm run dev` (http://localhost:5173)                  |
| Birim testleri                            | `npm test`                                             |
| Lint / tip / test (commit öncesi zorunlu) | `npm run check`                                        |
| Biçimlendirme                             | `npm run format`                                       |
| Uçtan uca testler (360×800 ve 412×915)    | `npm run e2e`                                          |
| Bölümleri yeniden üret                    | `npm run levels` (çıktı `src/levels/*.json`)           |
| Web paketi                                | `npm run build`                                        |
| **İmzalı release APK**                    | `npm run apk` → `release/simyacinin-sirri-<sürüm>.apk` |

Android araçları: JDK 21, Android SDK (`/opt/android-sdk`; platforms;android-36, build-tools;36.0.0).
`android/local.properties` içinde `sdk.dir` olmalıdır (git'e girmez). Kurulum:

```bash
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
```

## Klasör yapısı

```
src/engine/     Saf, deterministik oyun motoru (kuralların TEK kaynağı). UI'dan bağımsız.
src/solver/     A* çözücü (kanıtlanmış en kısa çözüm) + ipucu Web Worker'ı.
src/levels/     Üretilmiş bölüm JSON'ları (elle düzenlenmez) + yükleyici.
src/config/     Değiştirilebilir sayılar: ekonomi, yıldız eşikleri, palet.
src/game/       Oyun oturumu, ilerleme, ödüller, kayıt şeması ve göçler.
src/alchemy/    Malzemeler, tarifler, piramit.
src/i18n/tr.ts  TÜM arayüz metinleri (kodda sabit metin yok).
src/platform/   Capacitor sarmalayıcıları: kayıt, titreşim, geri tuşu.
src/audio/      Web Audio ile üretilen sesler.
src/components/ Yeniden kullanılan arayüz parçaları (şişe, düğme, pencere...).
src/screens/    Ekranlar.
scripts/        Bölüm üretici, APK betiği.
tests/          Vitest birim testleri.   e2e/  Playwright testleri.
docs/           TASARIM, TARIFLER, ZORLUK, LISANSLAR, TEST-KONTROL-LISTESI.
android/        Capacitor Android projesi (git'te).
```

## Kod kuralları

- TypeScript strict; `any` yok. Motor ve çözücü saf fonksiyonlardır, `Date`/`Math.random` kullanmaz.
- Kural değişikliği yalnızca `src/engine/` içinde yapılır; çözücü/üretici/UI aynı motoru kullanır.
- Yeni mekanik: `MechanicId`'ye ekle, `RuleFlags`'e bayrak ekle, `pourKind`/`applyMove` içinde bayrakla bağla,
  çözücü sezgiselinin kabul edilebilirliğini testle doğrula.
- Bölüm JSON'ları elle düzenlenmez; `npm run levels` ile üretilir ve testlerle doğrulanır.
- Tüm metinler `src/i18n/tr.ts`'de. Büyük harf için `toLocaleUpperCase('tr-TR')`.
- Emoji yok; tüm simgeler SVG (`src/components/Icon.tsx`).
- Commit öncesi `npm run check` temiz geçmeli. Küçük ve anlamlı commit'ler.

## UX kuralları (özet — ayrıntı TASARIM B9)

- Dokunma alanı ≥ 56 dp (tercihen 64). Şişe dokunma alanı görselinden geniş.
- Yazı: gövde ≥ 18 sp, düğme ≥ 20 sp, başlık ≥ 26 sp. Yazı boyutu ayarı ×1 / ×1,2 / ×1,4; en büyükte taşma yok.
- Kontrast: metin ≥ 7:1, arayüz öğeleri ve sıvı ≥ 3:1.
- Yalnızca dokunma: sürükleme, uzun basma, çift dokunma yok. Her dokunuşa < 100 ms görsel tepki.
- Süre baskısı yok. Simgeli her düğmenin yazılı etiketi var; ücretli düğmede bedel görünür.
- Yıkıcı işlemler onay ister ("Evet, yeniden başla" / "Vazgeç"); ilerleme sıfırlama iki aşamalı.
- Geri tuşu her ekranda mantıklı; ana ekranda çıkış onayı. Her hamleden sonra kayıt.
- Bilgi asla yalnızca renkle verilmez: her rengin sembolü var.
- Dil: sade, kısa, yetişkine saygılı Türkçe. "Aferin!" gibi övgüler yok; "Raf düzenlendi", "Kusursuz çözüm".
- Güvenli alanlara uy; önemli düğmeler hareket çubuğuna yapışmaz.

## İmzalama (ÇOK ÖNEMLİ)

- Release anahtarı: `simya-release.keystore` (alias `simya`, PKCS12, RSA 4096, 2076'ya kadar geçerli).
  SHA-256: `E7:E2:FA:D2:3C:86:BA:E0:98:B1:C1:53:C5:73:8A:A8:AC:0E:C0:C5:3A:CB:D0:35:97:83:B6:3E:C8:5C:87:15`
- Anahtar ve parolası **repoda DEĞİLDİR** (`.gitignore`: `*.keystore`, `keystore.properties`).
- Beklenen konum: repo klasörünün yanında `../simya-signing/` → `simya-release.keystore` + `keystore.properties`
  (ya da `SIMYA_KEYSTORE_PROPERTIES` ortam değişkeniyle başka bir yol).
- `keystore.properties` biçimi: `storeFile=<mutlak yol>`, `storePassword=…`, `keyAlias=simya`, `keyPassword=…`.
- **Neden yedeklenmeli:** Android bir güncellemeyi yalnızca aynı anahtarla imzalanmışsa kabul eder. Anahtar
  kaybolursa oyunun yeni sürümü telefona güncelleme olarak kurulamaz; eski sürümü silmek gerekir ve
  oyuncunun tüm ilerlemesi kaybolur. Anahtarın sahibi elinde iki ayrı yedek tutar (ör. bulut sürücü + USB).
- Bulut oturumları geçicidir: her yeni oturumda anahtar dosyaları `../simya-signing/` klasörüne geri yüklenir.

## Sürümleme

`package.json` `version` alanı tek kaynaktır; Android `versionCode = major*100000 + minor*1000 + patch*10`.
Her yeni APK'da sürüm artırılır (aynı ya da küçük versionCode güncelleme olarak kurulamaz).
