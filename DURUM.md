# DURUM — Simyacının Sırrı

> Çalışma kesilirse yalnızca bu dosyayı okuyarak devam edilebilmelidir.
> Son güncelleme: 2026-11-19 (K4 test APK'sı)

## Tamamlananlar

- **K0 – Kurulum**: Vite + React 19 + TypeScript (strict), Vitest, ESLint, Prettier, Playwright.
  Capacitor 8.6 Android projesi (`android/`), kimlik `com.gokhanagingil.simya`. `npm run apk` imzalı APK üretir.
- **K1 – Motor**: `src/engine/` klasik + sis + karışım kuralları, olaylar (pour/mix/reveal/complete), geçmiş.
- **K2 – Çözücü ve üretici**: A* (kanıtlı en kısa çözüm, BFS ile doğrulandı), paralel ve önbellekli üretici,
  zorluk puanı (`docs/ZORLUK.md`), 3 oda × 20 bölüm, paket doğrulama testleri.
- **K3 – Oyun ekranı**: Şişe SVG'leri (koyu cam, sembollü sıvılar), seçim/hedef işaretleme, uçan-eğilen dökme
  animasyonu, mantar tıpa, kilitlenme paneli, geri al, yeniden başla (onaylı).
- **K4 – İlerleme**: Ana ekran (Devam Et), oda haritası, bölüm sonu (yıldız, hamleniz/en iyi, rekor, toz, malzeme),
  kayıt (Preferences/localStorage, sürümlü şema + göç + bozuk kayıt kurtarma + yedek), Android geri tuşu.
- **K5 – Ekonomi ve güçler**: Simya tozu, 3 ücretsiz geri alma + ücretli, ipucu (Web Worker, saklı çözüm yolu
  önce), ekstra şişe, onay pencereleri. Ücretli güçte en fazla 2★.
- **K6 – Sis ve karışım**: iki mekanik, tanıtım kartları, Mahzen ve Laboratuvar bölümleri, sis kaldır, karışım önizlemesi.
- **K7 – Hikâye ve keşif**: açılış hikâyesi (4 sayfa), defter (hikâye/tarifler/ipuçları/nasıl oynanır), simya masası
  (3 başarısızlıkta açık not), piramit, oda anahtarları (Sis, Prizma), kilit açılış sahnesi. `docs/TARIFLER.md`.
- **K8 (büyük ölçüde)**: etkileşimli öğretici, bağlamsal tek seferlik yardımlar, ayarlar (yazı boyutu ×1/×1,2/×1,4,
  semboller, ses, müzik, ses düzeyi, titreşim, yavaş animasyon, öğreticiyi yeniden başlat, iki aşamalı sıfırlama),
  Web Audio sesleri, titreşim, gizli geliştirici menüsü, uygulama simgesi ve açılış ekranı.
- Testler: Vitest birim testleri (motor, sis, karışım, çözücü, yıldız, ekonomi, kayıt, tarif ağacı, palet ΔE, yerleşim,
  bölüm paketi); Playwright e2e (360×800, 412×915): öğretici, çözme, geri al, ipucu, devam, geri tuşu; axe kontrast
  (AA + AAA), dokunma alanı ≥ 56 dp ve taşma denetimi (Normal ve Çok büyük yazıda).

## Şu an

- K4 test APK'sı kullanıcıya teslim edildi (`v0.0.4`); oyuncu geri bildirimi bekleniyor. Beklerken K8/K9 cilası.

## Sıradaki adımlar

1. Oyuncu geri bildirimini uygula (boyut, renk, dokunma) — öncelikli.
2. K8: metinlerin son okuması, performans ölçümü (açılış, 60 fps), karışım/sis e2e testleri.
3. K9: `v0.1.0` release APK, sürüm notu (`docs/SURUM-NOTLARI.md`), etiket.

## Alınan kararlar

| Tarih      | Karar                                                                                                                                                      | Gerekçe                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 2026-11-19 | Çalışma `Gokhanagingil/simya` reposunda, `main` dalında.                                                                                                   | Repo boştu; kullanıcı yetki verdi.                                                                          |
| 2026-11-19 | Android SDK için ayrı "simya" bulut ortamı (yalnızca `dl.google.com`).                                                                                     | SDK indirmesi engelliydi; kullanıcı diğer ortamına izin vermek istemedi.                                    |
| 2026-11-19 | Capacitor 8.6.2, compile/targetSdk 36, minSdk 24, AGP 8.13, Gradle 8.14.3, JDK 21.                                                                         | Güncel kararlı.                                                                                             |
| 2026-11-19 | TypeScript 5.9 (7.x değil).                                                                                                                                | typescript-eslint TS 7'yi henüz desteklemiyor.                                                              |
| 2026-11-19 | Keystore bulutta üretildi, kullanıcıya dosya olarak teslim; repoda yok. Konum `../simya-signing/`.                                                         | Kullanıcının seçimi.                                                                                        |
| 2026-11-19 | Sürümleme: test APK `0.0.4` (versionCode 40), ilk tam sürüm `0.1.0` (1000).                                                                                | Her APK bir öncekinin üstüne güncelleme olarak kurulabilsin.                                                |
| 2026-11-19 | "Tamamlandı" = dolu ve gerçek renkleri tek renk (gizli olsa bile); mühürlenince gizliler açılır.                                                           | Çözücüyle tutarlı; gereksiz kilitlenmeyi önler.                                                             |
| 2026-11-19 | Açığa çıkan birim geri almayla tekrar gizlenmez; ekstra şişe geri almayla kaybolmaz; sis kaldır kalıcı.                                                    | "Kalıcı açığa çıkma" kuralı; ücretli güçler geri alınmamalı. Gizli birimler hareket etmediği için güvenli.  |
| 2026-11-19 | Kilitlenme = hiç geçerli hamle yok.                                                                                                                        | Türün alışılmış davranışı; yanlış alarm yok.                                                                |
| 2026-11-19 | Ücretli güç (ücretli geri alma dahil) kullanılan bölümde kusursuz çözüm de sayılmaz; ekstra şişeli çözüm rekora girmez.                                    | Ekstra şişeyle en iyi çözümden kısa çözüm mümkün; rekor/kusursuz anlamını korur.                            |
| 2026-11-19 | Ücretsiz geri alma hakkı, ekstra şişe hakkı ve "ücretli güç" işareti her denemede (yeniden başlayınca) sıfırlanır.                                         | Yeniden başla her zaman ücretsiz; temiz yeni deneme.                                                        |
| 2026-11-19 | Ücretli güçler onay penceresiyle kullanılır ("Evet, 20 toz harca"). İpucu bulunamazsa toz alınmaz.                                                         | Yanlışlıkla dokunmalar yıldız ve toz kaybettirmesin.                                                        |
| 2026-11-19 | Palet: kırmızı #e33b45, turuncu #f28a1c, sarı #f6d23a, yeşil #4cb944, mavi #3b8cf0, mor (eflatun) #b858cf, pembe #ff9ccb, kahverengi #8e6a50, gri #c3c7cc. | Tüm çiftler CIEDE2000 ≥ 20 (yaşlı göz benzetiminde ≥ 18); mavi–mor ≥ 30.                                    |
| 2026-11-19 | Şişe camı koyu (#241f1d): sıvılar camın içinde ≥ 3:1, şişe açık zeminde koyu kenarla belirgin.                                                             | Açık temada sarı ile kahverengi aynı zeminde 3:1 sağlayamıyordu.                                            |
| 2026-11-19 | Tarif ağacı 18 tarif; 4 temel madde + 2 ilke (Tuz, Cıva) ödül olarak; anahtarlar Sis ve Prizma.                                                            | Kurallar tutarlı (ateş/su/hava/toprak/tuz/cıva); `docs/TARIFLER.md`.                                        |
| 2026-11-19 | Karışım odası bölümleri en fazla 6 hedef şişe + 1–2 boş.                                                                                                   | 7 hedefli adayların yalnızca ~1/8'i 250 B düğümde kanıtlanabiliyor; kanıtsız bölüm paketlenmez.             |
| 2026-11-19 | INTERNET izni manifestte kalıyor; CSP tüm dış bağlantıları kapatıyor (`connect-src 'self'`).                                                               | İzin kaldırılınca WebView'ın çalıştığı emülatörsüz doğrulanamadı.                                           |
| 2026-11-19 | CSP'de `script-src 'unsafe-inline'`.                                                                                                                       | Capacitor Android köprüsünü HTML'ye satır içi betikle ekliyor (JSInjector); aksi hâlde eklentiler çalışmaz. |
| 2026-11-19 | WebView textZoom 100'e sabit; sistem yazı ölçeği ilk açılışta oyun ayarına öneri olarak aktarılır (≥1,12 Büyük, ≥1,3 Çok büyük).                           | Sistem ve oyun ölçeği üst üste binip ekranı bozmasın.                                                       |
| 2026-11-19 | Durum çubuğu/güvenli alan: Capacitor 8 SystemBars (insetsHandling: css).                                                                                   | Ek eklenti gerekmez.                                                                                        |
| 2026-11-19 | Android geri tuşu web'de (ve e2e'de) Escape ile taklit edilir.                                                                                             | Aynı mantığın otomatik test edilebilmesi.                                                                   |
| 2026-11-19 | Sisli bölümlerde 5 güç düğmesi 3 sütunda; "Sis kaldır" seçim modunda güç çubuğu yerine talimat paneli.                                                     | 360×800'de şişeler büyük kalsın.                                                                            |

## Açık sorular

- INTERNET izni gerçek cihazda kaldırılıp denensin mi?
- Karışım kuralı oyuncuya sezgisel geldi mi? (TASARIM B4 notu — oyuncu testi sonrası değerlendirilecek.)

## Bilinen sorunlar

- Bu ortamda Android emülatörü yok (KVM yok): APK derlenip imzalanıyor, açılışı yalnızca gerçek telefonda doğrulanabilir.
- Maven Central bazen 429 veriyor; Gradle `--max-workers=1` ile yeniden denenince geçiyor (betik zaten tek işçiyle çalışıyor).
