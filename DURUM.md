# DURUM — Simyacının Sırrı

> Çalışma kesilirse yalnızca bu dosyayı okuyarak devam edilebilmelidir.
> Son güncelleme: 2026-11-19 (K1 sonu)

## Tamamlananlar
- **K0 – Kurulum**: Vite + React 19 + TypeScript (strict), Vitest, ESLint, Prettier, Playwright yapılandırması.
  Capacitor 8.6 Android projesi (`android/`), uygulama kimliği `com.gokhanagingil.simya`.
  Debug ve imzalı release APK derlemesi doğrulandı (`npm run apk`). Release keystore oluşturuldu.
  `docs/TASARIM.md`, `CLAUDE.md`, `DURUM.md`.
- **K1 – Motor**: `src/engine/` (klasik + sis + karışım kuralları, olaylar, geçmiş) ve testleri.
  A* çözücü (`src/solver/`) ve BFS ile çapraz doğrulama testleri (klasik, sis, karışım).

## Şu an
- K2: bölüm üretici ve 1. oda bölümleri.

## Sıradaki adımlar
1. K2 – Üretici (`scripts/generate-levels.ts`), zorluk puanı, oda 1 bölümleri, doğrulama testleri.
2. K3 – Oyun ekranı (şişeler, seçim, dökme animasyonu, mühür, kilitlenme paneli, geri al/yeniden).
3. K4 – Ana ekran, oda haritası, bölüm sonu, yıldız/rekor/kusursuz, kayıt, geri tuşu → TEST APK.
4. K5…K9 TASARIM B14'teki sırayla.

## Alınan kararlar
| Tarih | Karar | Gerekçe |
|---|---|---|
| 2026-11-19 | Çalışma `Gokhanagingil/simya` reposunda, `main` dalında. | Repo boştu; kullanıcı yetki verdi. |
| 2026-11-19 | Android SDK için ayrı "simya" bulut ortamı (yalnızca `dl.google.com` izni). | SDK indirmesi engelliydi; kullanıcı diğer ortamına izin vermek istemedi. |
| 2026-11-19 | Capacitor 8.6.2, compileSdk/targetSdk 36, minSdk 24, AGP 8.13, Gradle 8.14.3. | Güncel kararlı sürüm. |
| 2026-11-19 | TypeScript 5.9 (7.x değil). | typescript-eslint henüz TS 7'yi desteklemiyor. |
| 2026-11-19 | Keystore bulutta üretildi, kullanıcıya dosya olarak teslim edilecek; repoda yok. | Kullanıcının seçimi. Konum: `../simya-signing/`. |
| 2026-11-19 | Şişe "tamamlandı" = dolu ve gerçek renkleri tek renk (gizli birim olsa bile); mühürlenince gizliler açılır. | Çözücüyle tutarlı, oyuncuya hoş bir sürpriz; kilitlenmeyi azaltır. |
| 2026-11-19 | Açığa çıkan birim geri almayla tekrar gizlenmez (geçmişe de işlenir). | "Kalıcı olarak açığa çıkar" kuralı. Gizli birimler hareket etmediği için güvenli. |
| 2026-11-19 | Ekstra şişe geri almayla kaybolmaz (geçmişteki durumlara da eklenir). | Ücretli güç geri alınmamalı. |
| 2026-11-19 | Kilitlenme = hiç geçerli hamle yok. Döngüsel ama boşa hamleler kilitlenme sayılmaz. | Türün alışılmış davranışı; yanlış alarm yok. |
| 2026-11-19 | Çözücü sezgiseli: (renk koşuları − dolu şişe) + tabansız renk sayısı; karışımda ⌈fark/2⌉. | Kabul edilebilir ve tutarlı → A* ilk bulduğu çözüm kanıtlı en kısa. BFS testleriyle doğrulandı. |
| 2026-11-19 | INTERNET izni şimdilik manifestte kalıyor; tüm dış bağlantılar CSP ile kapalı. | Capacitor'da izin kaldırılınca WebView'ın yerel varlıkları sunduğu doğrulanamadı; emülatör yok. Gerçek telefonda denenince kaldırılabilir. |
| 2026-11-19 | WebView textZoom 100'e sabit; sistem yazı ölçeği ilk açılışta oyunun yazı boyutu ayarına öneri olarak aktarılır. | Sistem ölçeği + oyun ölçeği üst üste binip ekranı bozmasın. |
| 2026-11-19 | Durum çubuğu/güvenli alan: Capacitor 8 SystemBars (insetsHandling: css). | Ek eklenti gerekmez; `--safe-area-inset-*` değişkenleri. |

## Açık sorular
- INTERNET izni gerçek cihazda kaldırılıp denensin mi? (K4 test APK'sında izin var.)

## Bilinen sorunlar
- Bu ortamda Android emülatörü yok (KVM yok). APK derlenip imzalanıyor ama açılışı ancak gerçek telefonda doğrulanabilir.
- Maven Central bazen 429 veriyor; Gradle `--max-workers=1` ile yeniden denenince geçiyor.
