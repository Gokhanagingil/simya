# Simyacının Sırrı — Tasarım Belgesi

> Tasarımın tek doğru kaynağı bu dosyadır. Tasarımda değişiklik olursa önce bu dosya güncellenir.
> Değişiklikler en altta "Değişiklik günlüğü" bölümünde tarih ve gerekçeyle listelenir.

## B1. Oyuncu

- 65 yaş üstü bir kadın. Oyun oynamayı çok seviyor ve rekabetçi.
- Kuralı basit ama çözmesi kafa yoran oyunları seviyor: renkli sıvı sıralama, sudoku benzeri mantık bulmacaları, WOW tarzı kelime oyunları, şekil ve renk bulmacaları.
- Bir oyuna başlayınca aylarca aynı oyunu oynuyor, yani süreklilik önemli. Tekrara düşen oyunlardan çabuk sıkılıyor.
- Heyecan, gizem ve zekâ ön planda olmalı.
- Puan toplamayı ve bu puanları engelleri aşmak için harcamayı seviyor.
- Android telefonda, dikey ekranda, tek başına oynayacak. Çok oyunculu özellik, hesap ya da internet bağlantısı olmayacak.
- Yaşa bağlı olası ihtiyaçları:
  - daha büyük yazı ve dokunma alanları,
  - yüksek kontrast,
  - bazı renk tonlarını (özellikle mavi-yeşil ve mavi-mor) ayırt etmede zorluk,
  - sürükleme ya da uzun basma gibi karmaşık hareketlerde zorlanma.
- Zihinsel olarak keskin. İlke şu: **arayüz kolay, bulmaca zor olmalı.** Asla çocuksu ya da tepeden bakan bir dil kullanma.

## B2. Oyun özeti ve hikâye

Oyuncu, eski bir İstanbul sokağında yıllardır kapalı duran bir simyacı dükkânını miras alır. Raflar karmakarışık şişelerle doludur. Simyacının defteri şifrelidir ve son sayfasında şu yazar: _"Kimsenin görmediği bir renk buldum."_

- Her bulmaca dükkândaki bir rafı düzene sokar.
- Bulmacalar malzeme kazandırır. Oyuncu bu malzemeleri **simya masasında** birleştirerek yeni maddeler keşfeder ve **keşif piramidinde** yukarı çıkar. Piramidin tepesinde "kayıp renk" vardır. Bu renk son sezonda açılır.
- Her odanın sonunda defterin bir sayfası açılır ve hikâye ilerler.
- Bazı keşifler yeni bulmaca mekaniklerini açar. Böylece oyuncu yeni kuralları dışarıdan gelen bir zorunluluk gibi değil, kendi keşfettiği bir ödül gibi yaşar.
- Ton sıcak, zarif ve hafif gizemli olmalı, yetişkin bir okura saygı göstermeli. Metinler kısa ve doğal bir Türkçeyle yazılmalı, çeviri gibi durmamalı.

**Terimler** (arayüzde tutarlı kullan):

- **Bölüm:** tek bir bulmaca.
- **Oda:** 20 bölümlük grup. 1. aşamadaki odalar: Vitrin, Mahzen, Laboratuvar.
- Diğer terimler: **Simya tozu**, **Yıldız**, **Kusursuz çözüm**, **Defter**, **Simya masası**, **Piramit**.

## B3. Temel kurallar

- **Tahta:** N şişe var, her şişenin kapasitesi K birim. 1. aşamada K=4. Şişeler alttan üste renkli birimlerden oluşur.
- **Hamle:** Oyuncu önce kaynak şişeye, sonra hedef şişeye dokunur. Kaynağın en üstündeki aynı renkli, görünür ve ardışık birimler hedefe dökülür. Dökülen miktar, bu üst renk grubu ile hedefteki boş yerden hangisi küçükse odur.
- **Geçerli hedef:** boş bir şişe ya da en üst rengi aynı olan ve yeri bulunan bir şişe. Karışım kuralı B4'te.
- **Tamamlanan şişe:** Dolu ve tek renkli şişeye mantar tıpa/mühür animasyonu oynar. Bu şişe artık seçilemez, böylece yanlışlıkla bozulmaz.
- **Kazanma:** Tüm şişeler ya boş ya da tamamlanmış olmalı.
- **Kilitlenme:** Geçerli hamle kalmadıysa nazik bir panel açılır: "Hamle kalmadı". Seçenekler: Geri al, Yeniden başla, Ekstra şişe. Asla "kaybettiniz" deme.
- **Hamle sayacı:** Her dökme 1 hamledir. Geri alma sayacı da bir geri alır.
- **Seçim davranışı:**
  - Seçilen şişe hafifçe yükselir ve parlar. **Geçerli hedefler belirgin şekilde işaretlenir.**
  - Aynı şişeye tekrar dokunmak seçimi bırakır.
  - Geçersiz bir şişeye dokunulursa seçim o şişeye geçer. Hata sesi çalmaz. İlk birkaç seferde kısa bir açıklama gösterilir.
  - Boş alana dokunmak seçimi bırakır.
- Dökme animasyonu sürerken (en fazla 0,7 sn) gelen dokunuşlar yok sayılır.

## B4. Mekanikler

1. aşamada üç mekanik var. Her biri ayrı bir odada tanıtılır.

**Klasik — 1. Oda: Vitrin**

- B3'teki kurallar.

**Sis — 2. Oda: Mahzen**

- Bazı birimler gizlidir ve "?" deseniyle görünür. Şişenin en üst birimi her zaman görünür.
- Gizli bir birim şişenin en üstüne geldiğinde kısa bir animasyonla kalıcı olarak açığa çıkar.
- Gizli birimler dökülmez. Üst renk grubu yalnızca görünür birimlerden oluşur.
- Sisli bölümlerde yıldız eşikleri daha esnektir (bkz. B5). Gereksiz kilitlenmeleri önlemek için bu bölümlerde çoğunlukla fazladan bir boş şişe bırakılır.

**Karışım — 3. Oda: Laboratuvar**

- Ana renkler kırmızı, sarı ve mavidir. Karışımlar:
  - kırmızı + sarı = turuncu
  - sarı + mavi = yeşil
  - kırmızı + mavi = mor
- Kaynağın üst grubu bir ana renkse ve hedefin üst grubu **farklı** bir ana renkse dökme geçerlidir. Dökülen birimler hedefin üstündeki aynı renkli grupla birleşir ve hepsi karışım rengine dönüşür. Toplam miktar korunur. Örnek: 1 kırmızı, 2 sarının üstüne dökülürse 3 turuncu olur.
- Karışım renkleri bir daha karışmaz, normal renk gibi davranır. Bir karışım ancak "Geri al" düğmesiyle geri alınabilir.
- Kaynak seçildiğinde, karışım oluşturacak hedeflerin üzerinde sonuç renginin küçük bir önizlemesi gösterilir. Oyuncu ne olacağını önceden görmeli.
- Karışım yalnızca bölüm tanımında etkinleştirilmişse çalışır.
- Not: Bu kural bir tasarım kararıdır. Oynanabilirlik testinde sezgisel olmadığı görülürse alternatif öner ve gerekçesiyle `DURUM.md`'ye yaz.

**Sonraki aşamalarda gelecek mekanikler** (şimdi yapma, ama motor bunları ekleyebilecek şekilde kurulsun):

- Mühürlü şişeler
- Donmuş katmanlar
- Hamle sınırı
- Raf düzeni: şişeler ızgarada durur, satır/sütun kuralı vardır (sudoku benzeri)
- Huni: tek yönlü dökme

## B5. Yıldızlar, rekorlar ve rekabet (tek kişilik)

- Oyuncu kendine ve "en iyi çözüm"e karşı yarışır.
- Her bölümün en kısa çözümü çözücüden bilinir. Bölüm sonunda örneğin şu gösterilir: "Hamleniz: 15 · En iyi çözüm: 12".
- Yıldız eşikleri (ayar dosyasında tutulsun, değiştirilebilsin):

  | Yıldız | Normal bölüm            | Sisli bölüm            |
  | ------ | ----------------------- | ---------------------- |
  | 3★     | hamle ≤ ⌈en iyi × 1,15⌉ | hamle ≤ ⌈en iyi × 1,4⌉ |
  | 2★     | hamle ≤ ⌈en iyi × 1,5⌉  | hamle ≤ ⌈en iyi × 1,8⌉ |
  | 1★     | bölümü tamamlamak       | bölümü tamamlamak      |

- **Kusursuz çözüm:** Hamle sayısı en iyi çözüme eşitse özel bir işaret (ör. altın taç) ve ek simya tozu verilir.
- Ücretli bir güç kullanılan bölümde en fazla 2★ alınabilir. Ücretsiz geri almalar bu kurala girmez. Güç düğmesinde bunu kısa bir notla belirt.
- Her bölümün kişisel rekoru saklanır ve bölümler tekrar oynanabilir. Rekor kırılınca kutlama yapılır, ör. "Rekorunuzu 2 hamle geliştirdiniz".
- Ana ekranda toplam yıldız ve kusursuz çözüm sayısı görünür.

## B6. Simya tozu (puan) ekonomisi

Tüm sayılar bir `config` dosyasında tutulsun ve değiştirilebilsin.

- **Başlangıç bakiyesi:** 100 toz.
- **Kazanma:**
  - bölüm ilk kez tamamlanınca 10
  - her yeni yıldız için +5
  - ilk kusursuz çözüm için +15
  - oda tamamlama bonusu 50
  - Tekrar oynamada yalnızca yeni kazanılan yıldız ve kusursuz çözüm için ödül verilir.
- **Harcama:**

  | Güç                                                | Bedel                               |
  | -------------------------------------------------- | ----------------------------------- |
  | Geri al                                            | her bölümde ilk 3 ücretsiz, sonra 5 |
  | İpucu (sıradaki doğru hamleyi okla gösterir)       | 20                                  |
  | Ekstra boş şişe (bölüm başına 1)                   | 30                                  |
  | Sis kaldır (seçilen şişedeki gizli birimleri açar) | 15                                  |
  | Yeniden başla                                      | her zaman ücretsiz                  |

- Hiçbir bölüm toz harcamadan çözülemez hâle gelmemeli. Toz yalnızca bir kestirmedir.
- Gerçek parayla satın alma, reklam, can/enerji sistemi ve bekleme süresi **yoktur**.

## B7. Simya masası, piramit ve defter

**Malzemeler**

- Malzemeler bölümlerden kazanılır, ör. her 5 bölümde bir. Temel malzemeler odanın ilk bölümünde verilir.

**Simya masası**

- Masada iki yuva vardır. Oyuncu envanterden iki malzeme seçer ve büyük "Birleştir" düğmesine basar. Envanterdeki malzemeler büyük kartlar olarak, simge ve adıyla gösterilir.
- **Tarif varsa:** keşif animasyonu oynar, yeni madde envantere eklenir, deftere yazılır ve piramitteki yeri aydınlanır.
- **Tarif yoksa:** "Bu ikisi bir şey oluşturmadı." mesajı çıkar. Ceza yoktur, malzeme harcanmaz. Malzemeler kavramdır, tükenmez.
- Art arda 3 başarısız denemeden sonra defter daha açık bir ipucu sunar.

**Tarif kuralları ve ipuçları**

- Tarifler **tutarlı kurallara** dayanmalı ki oyuncu ezberlemek yerine çıkarım yapabilsin. Örnekler:
  - Ateşle birleşen sertleşir ya da ısınır.
  - Suyla birleşen yumuşar ya da çözülür.
  - Havayla birleşen hafifler ya da dağılır.
- Keşfedilmemiş her madde için defterde bilmece biçiminde bir ipucu bulunur. Örnek ton: _"Kızıl metal gümüşi metalle buluşunca, bir çağa adını veren metal doğar."_ (bakır + kalay = tunç; metaller piramidin üst katmanlarında, sonraki aşamalarda gelecek).

**Oda anahtarı**

- Her odanın sonunda bir anahtar maddenin keşfedilmesi gerekir. Bu madde bir sonraki odayı ve o odanın mekaniğini açar. Defter bu madde için özel bir bilmece verir.
- Örnek (yalnızca fikir vermek için; tutarlı bir tarif ağacını sen tasarla): Su + Hava = Sis → Mahzen (sis mekaniği) açılır; … → Prizma → Laboratuvar (karışım) açılır.

**1. aşama içeriği**

- 4 temel madde (Su, Ateş, Toprak, Hava), yaklaşık 15–20 tarif ve 3 piramit katmanı.
- Tarif ağacını `docs/TARIFLER.md`'de belgele ve testlerle doğrula: her anahtar erişilebilir, her hedefin bir bilmecesi var, yetim tarif ve çift tanım yok.

**Piramit ekranı**

- Katmanlar hâlinde gösterilir. Keşfedilen maddeler renkli ve adlıdır, keşfedilmeyenler "?" silüeti olarak görünür.
- Tepedeki kayıp renk gizemli biçimde görünür ama kilitlidir.

**Defter ekranı**

- Bölümleri: Hikâye sayfaları (açılanlar), Tarifler (keşfedilenler), İpuçları ve bilmeceler, "Nasıl oynanır" (tüm mekaniklerin resimli açıklamaları).

**Hikâye**

- Açılışta 3–4 kısa, resimli ve atlanabilir sayfa olsun. Her odanın sonunda 60–120 kelimelik bir defter sayfası açılsın.
- Gizem kademeli olarak açılmalı. 1. aşama merak uyandıran bir ipucuyla bitmeli.

## B8. Bölüm üretimi, çözücü ve zorluk eğrisi

**Üretim**

- Bölümler elle tasarlanmaz. **Derleme zamanında** bir Node betiğiyle üretilir, doğrulanır ve JSON olarak repoya eklenir.

**Çözücü**

- Durumları şişe sırasından bağımsız hâle getiren (kanonikleştiren), düğüm sınırlı bir A* ya da IDA* kullan.
- Paketlenen her bölüm için en kısa çözüm kanıtlanmış olmalı. Kanıtlanamayan aday bölüm atılır.
- Çözücü, oyunun kullandığı **motorun aynısını** kullanmalı. Kuralların tek bir kaynağı olsun.

**Zorluk puanı**

- Hesaplamada şunları kullan: en kısa çözüm uzunluğu, renk sayısı, boş şişe sayısı, dallanma, rastgele oyunlarda kilitlenme oranı (tuzak yoğunluğu), gizli ve karışım birimi sayısı. Ağırlıkları kalibre et ve belgele.

**Zorluk eğrisi**

- Her oda 20 bölümdür.
- Odanın ilk bölümü yeni mekaniği tek başına ve çok kolay biçimde tanıtır.
- Sonra zorluk **testere dişi** gibi artar: zor bir bölümün ardından 1–2 rahat bölüm gelir.
- Odanın son bölümleri o odanın en zorlarıdır.
- 2. ve 3. odalarda klasik kurallar yeni mekanikle harmanlanır.

**1. aşama sınırları**

- En fazla 10 şişe (ekstra şişeyle 11), kapasite 4, en fazla 8 renk.

**Bölüm şeması** (örnek; şişeler alttan üste yazılır, şema sürümlü olsun):

```json
{
  "schemaVersion": 1,
  "id": "oda1-b05",
  "room": 1,
  "index": 5,
  "seed": 12345,
  "capacity": 4,
  "mechanics": ["classic"],
  "bottles": [["red", "blue", "red", "yellow"], ["blue", "yellow"], []],
  "hidden": [[false, true, false, false], [false, false], []],
  "optimalMoves": 12,
  "solution": [
    [0, 2],
    [1, 0]
  ],
  "difficulty": 0.42,
  "reward": { "material": "su" }
}
```

**Doğrulama testi**

- Paketlenen her bölümün saklı çözümü motorda oynatıldığında bölüm kazanılmalı ve hamle sayısı `optimalMoves` değerine eşit olmalı.

**Oyun sırasında ipucu**

- İpucu için çözücü mevcut durumdan, bir Web Worker'da ve zaman sınırıyla çalışır.
- Oyuncu saklı çözüm yolundaysa ipucu doğrudan oradan verilir.
- Çözüm yoksa şu gösterilir: "Bu durumdan çıkış yok, birkaç hamle geri almayı deneyin."

## B9. UX ve erişilebilirlik kuralları (en kritik bölüm)

**Ölçülebilir hedefler**

- **Dokunma alanı:** Düğmeler en az 56 dp, tercihen 64 dp olmalı. Her şişenin dokunma alanı görselinden geniş olmalı ve şişeler arasında yeterli boşluk bulunmalı.
- **Yazı boyutu:** gövde en az 18 sp, düğme etiketleri en az 20 sp, başlıklar en az 26 sp.
- **Yazı boyutu ayarı:** Normal / Büyük (×1,2) / Çok büyük (×1,4). En büyük boyutta hiçbir ekran bozulmamalı ve metin taşmamalı.
- **Kontrast:** metinde en az 7:1; arayüz öğelerinde ve sıvı ile arka plan arasında en az 3:1.
- **Ekran düzeni:** 360×800 dp ekranda en fazla 12 şişe iki sıra hâlinde rahatça sığmalı ve şişeler büyük kalmalı.
- Önemli düğmeleri ekranın en alt kenarına, yani Android hareket çubuğunun bölgesine yapıştırma. Güvenli alan (safe area / edge-to-edge insets) boşluklarına uy.

**Etkileşim**

- Yalnızca dokunma kullanılır. Sürükleme, zorunlu kaydırma, uzun basma ve çift dokunma yok. Listelerde doğal kaydırma olabilir.
- Her dokunuşa 100 ms içinde görsel tepki verilmeli.
- Süre baskısı, geri sayım ya da zamanlayıcı yok.
- Simgeli tüm düğmelerin yazılı bir etiketi olmalı ("Geri al", "İpucu", "Yeniden"). Ücretli düğmelerde bedel görünmeli.
- Yıkıcı işlemler (yeniden başla, ilerlemeyi sıfırla) onay penceresi ister. Pencerede büyük ve açık düğmeler olmalı: "Evet, yeniden başla" / "Vazgeç". İlerlemeyi sıfırlama iki aşamalı onay ister.
- **Android geri tuşu:** Her ekranda mantıklı bir önceki ekrana dönmeli. Oyun ekranında ilerleme kaybolmamalı. Ana ekranda "Oyundan çıkmak istiyor musunuz?" diye sorulmalı. Uygulama asla yanlışlıkla kapanmamalı.
- Uygulama arka plana atılsa da, telefon kapansa da hiçbir ilerleme kaybolmamalı. Durum her hamleden sonra kaydedilir. Uygulama açıldığında oyuncu tam kaldığı yerden devam eder.
- Ana ekranda tek bir baskın birincil eylem olmalı: doğrudan sıradaki bölümü açan büyük bir "Devam Et" düğmesi.

**Renk ve şekil**

- Bilgi asla yalnızca renkle verilmez. Her rengin sıvının içinde görünen bir **sembolü** olur: daire, üçgen, kare, baklava, artı, yıldız, kalp, altıgen, dalga gibi. Semboller varsayılan olarak açıktır ve ayarlardan kapatılabilir.
- Önerilen palet: kırmızı, turuncu, sarı, yeşil, mavi, mor, pembe, kahverengi, gri.
- Tonları seçerken yaşla azalan mavi duyarlılığını ve renk körlüğü türlerini hesaba kat. Renk çiftleri arasındaki farkı (ör. CIEDE2000 ΔE) bir testle doğrula ve bu farkı yüksek tut. Koyu mavi, mor ve lacivert gibi birbirine yakın tonlardan kaçın.
- Emoji kullanma, çünkü farklı Android sürümlerinde farklı görünür. Tüm simgeler SVG olsun.

**Dil ve içerik**

- Arayüzün tamamı Türkçe olmalı, İngilizce terim kullanılmamalı ("level" değil "bölüm", "undo" değil "geri al").
- Tüm metinler tek bir dosyada (`src/i18n/tr.ts`) tutulmalı. Kodun içinde sabit metin olmamalı.
- Büyük harfe çevirirken `tr-TR` yerel ayarı kullanılmalı (i → İ, ı → I).
- Kısa cümleler ve sade bir dil kullan. Çocuksu ifadeler, aşırı ünlem ve "Aferin!" gibi tepeden bakan övgüler olmamalı. Kutlamalar zarif olmalı: "Raf düzenlendi", "Kusursuz çözüm".

**Öğretim**

- İlk açılışta etkileşimli bir öğretici olmalı. Her seferde tek bir talimat verilir, ilgili öğe vurgulanır ve oyuncu gerçekten yaparak öğrenir. Metin duvarı olmamalı.
- Yeni bir mekanik geldiğinde tek ekranlık resimli bir tanıtım kartı gösterilir. Ardından o mekaniği tek başına gösteren kolay bir bölüm gelir.
- Bağlamsal yardımlar yalnızca bir kez gösterilir. Hepsi Defter > "Nasıl oynanır" bölümünde yeniden okunabilir. Öğretici ayarlardan tekrar başlatılabilir.

**Hareket ve performans**

- Dökme animasyonu 500–700 ms sürmeli, akıcı ve anlaşılır olmalı. Sıvının nereden nereye gittiği net görülmeli.
- Ayarlarda "Yavaş animasyon" seçeneği olmalı (×1,5). Sistemdeki "hareketi azalt" tercihine uyulmalı.
- Hedefler: orta seviye bir Android telefonda 60 fps, 2 saniyenin altında açılış.

## B10. Görsel ve ses tasarımı

- **Tema:** eski bir simya dükkânı. Sıcak ahşap raflar, parşömen tonları, pirinç detaylar ve ışığı yakalayan cam şişeler. Ama **netlik süslemeden önce gelir**: şişelerin arkasındaki alan sade ve az ayrıntılı olmalı.
- Açık ve sıcak bir tema kullan, güneş ışığında da okunabilsin. 1. aşamada karanlık tema yok.
- Tüm grafikler özgün olmalı: kodla çizilmiş SVG'ler ya da özgün olarak üretilmiş varlıklar. Üçüncü taraflara ait telifli varlık kullanılmamalı.
- **Font:** Türkçe karakterleri (ç, ğ, ı, İ, ö, ş, ü) tam destekleyen, okunaklılığı yüksek ve açık lisanslı bir font seç (ör. Atkinson Hyperlegible Next ya da Nunito). Font uygulamaya gömülü olmalı, internetten yüklenmemeli.
- **Sesler:** yumuşak bir cam tınısı, dökme sesi, şişe tamamlanma çanı ve bölüm sonu melodisi. Sesler Web Audio ile üretilsin ya da CC0 lisanslı olsun. Ses düzeyi varsayılan olarak orta seviyede olsun. Ses efektleri ve müzik ayrı ayrı kapatılabilsin. Müzik varsayılan olarak kapalı.
- **Titreşim:** Şişe tamamlandığında ve bölüm sonunda kısa ve hafif bir titreşim olsun. Ayarlardan kapatılabilsin.
- **Uygulama simgesi:** parlayan bir simya şişesi (Android uyarlanabilir simgesi). Açılış ekranı da temaya uygun olsun.
- Tüm lisansları `docs/LISANSLAR.md` dosyasına yaz.

## B11. Ekranlar

1. **Ana ekran (Dükkân):** Büyük bir "Devam Et" düğmesi. İkincil olarak Odalar, Simya Masası, Defter ve Ayarlar. Toz bakiyesi ve toplam yıldız görünür.
2. **Odalar / bölüm haritası:** Vitrin, Mahzen ve Laboratuvar odaları. Her bölüm numaralı bir şişe olarak, yıldızları ve kusursuz işaretiyle gösterilir. Kilitli bölümler açıkça kilitli görünür.
3. **Oyun ekranı:**
   - Üst çubuk: geri, oda ve bölüm numarası, hamle sayısı, 3★ için hedef hamle, toz.
   - Orta alan: şişeler.
   - Alt çubuk: büyük ve etiketli düğmeler. Geri al (kalan ücretsiz hakkıyla), Yeniden, İpucu, Ekstra şişe ve yalnızca sisli bölümlerde Sis kaldır.
4. **Bölüm sonu:** yıldızlar, "hamleniz / en iyi çözüm", rekor, kazanılan toz ve malzeme. Düğmeler: "Sonraki bölüm" (birincil) ve "Tekrar oyna".
5. **Simya masası** ve **Piramit**.
6. **Defter:** Hikâye, Tarifler, İpuçları, Nasıl oynanır.
7. **Ayarlar:** yazı boyutu, renk sembolleri, ses efektleri, müzik, titreşim, yavaş animasyon, öğreticiyi tekrar göster, ilerlemeyi sıfırla, hakkında/sürüm.
8. **Yeni mekanik tanıtım kartı** ve **oda anahtarı / kilit açılış sahnesi**.
9. **Gizli geliştirici menüsü:** Hakkında ekranında sürüm numarasına 7 kez dokunarak açılır. İçinde şunlar olur: istenen bölüme atla, toz ekle, çözümü göster, öğreticiyi sıfırla, kaydı dışa/içe aktar (JSON). Oyuncu bu menüyü tesadüfen bulamamalı.

## B12. Teknik mimari

- **Teknoloji:** TypeScript (strict), Vite ve React, mümkün olduğunca az bağımlılık. Android paketi için Capacitor'ın güncel kararlı sürümü.
- **Oyun motoru:** Arayüzden tamamen ayrı, saf ve deterministik bir TypeScript modülü. Sunduğu işlevler:
  - `getValidTargets`
  - `applyMove`: yeni durumu ve animasyon olaylarını (pour, reveal, mix, complete) döndürür
  - kazanma ve kilitlenme kontrolü
  - geri alma geçmişi
    Mekanikler bölüm tanımındaki bayraklarla etkinleşir. Yapı yeni mekanikler eklenebilecek şekilde kurulmalı.
- Çözücü ve üretici aynı motoru kullanır. Üretici `scripts/` altında bir Node betiğidir ve çıktısı `src/levels/*.json` dosyalarıdır.
- İpucu çözücüsü bir Web Worker'da çalışır.
- **Kayıt:**
  - `@capacitor/preferences` kullanılır; web'de yedek olarak localStorage.
  - Kayıt şeması **sürümlü** olur ve **göç (migration)** fonksiyonları bulunur.
  - Kayıt bozuksa uygulama çökmeden güvenli biçimde kurtarılır.
  - Android Otomatik Yedekleme açık kalsın, böylece telefon değişince ilerleme taşınabilsin.
- Ekran yönü dikey olarak kilitlenir. Android geri tuşu Capacitor App eklentisiyle yönetilir. Durum çubuğu ve güvenli alanlar düzgün ayarlanır.
- Gerekmiyorsa ağ izni ekleme. Analitik, izleme ya da reklam SDK'sı olmayacak.
- **Kimlik:** uygulama kimliği `com.gokhanagingil.simya`, uygulama adı "Simyacının Sırrı".
- **İmzalama:**
  - Bir kez bir release keystore oluştur.
  - Keystore'u repoya **koyma** (`.gitignore`'a ekle). Nerede saklanacağını ve neden yedeklenmesi gerektiğini `CLAUDE.md`'de açıkça yaz.
  - K4'teki test APK'sı da dahil olmak üzere tüm sürümler aynı anahtarla imzalanmalı. Aksi hâlde oyuncu güncelleme için uygulamayı silmek zorunda kalır ve ilerlemesi kaybolur.
- **Dağıtım:** Play Store kullanılmayacak. İmzalı APK telefona doğrudan yüklenecek. APK üretimini tek bir komuta indir ve belgele.

## B13. Kalite, testler ve "bitti" tanımı

**Birim testleri (Vitest)**

- Motor kuralları: dökme miktarı, geçerli hedefler, tamamlanan şişe, kazanma, kilitlenme, geri alma.
- Sis: birimlerin açığa çıkması, gizli birimlerin dökülmemesi.
- Karışım: tüm kombinasyonlar, geçersiz karışımlar, miktar korunumu.
- Çözücü: bilinen küçük bulmacalarda doğru en kısa çözüm.
- Yıldız ve ekonomi hesapları, kayıt göçleri, tarif ağacı bütünlüğü, palet renk farkı.

**Bölüm paketi doğrulaması**

- Her bölüm çözülebilir olmalı, saklı çözüm motorda kazanmalı ve zorluk eğrisi kurallara uymalı.

**Uçtan uca testler (Playwright, 360×800 ve 412×915 mobil görünüm)**

- Öğreticiyi bitirme, bir bölümü çözme, geri alma, ipucu alma.
- Uygulama yeniden açılınca kaldığı yerden devam etme.
- "Çok büyük" yazı boyutunda ekranların bozulmaması.
- Ekran görüntülerini kaydet ve kendin incele.

**Erişilebilirlik denetimi**

- Otomatik kontrast denetimi (ör. axe) ve dokunma alanı boyutlarını ölçen bir test.

**Genel kurallar**

- Her commit'ten önce lint, typecheck ve test komutları temiz geçmeli.
- `docs/TEST-KONTROL-LISTESI.md` dosyasında gerçek telefonda yapacağım kontrollerin listesi olsun: kurulum, ilk açılış, öğretici, geri tuşu, uygulamayı kapatıp açma, güneşte okunabilirlik, ses ve titreşim, güncelleme kurulumunda ilerlemenin korunması.

**1. aşama "bitti" sayılır, eğer:**

- 60 bölümün tamamı (3 oda × 20 bölüm) eksiksiz çalışıyor.
- Şu özelliklerin hepsi eksiksiz çalışıyor:
  - üç mekanik,
  - yıldızlar, kusursuz çözüm ve rekorlar,
  - simya tozu ve 4 güç,
  - simya masası, piramit (1. aşama tarifleriyle), defter ve hikâye,
  - öğretici, ayarlar, ses ve titreşim.
- Tüm testler geçiyor.
- İmzalı release APK üretilmiş ve gerçek cihaz test listesi hazır.
- `DURUM.md` güncel ve sürüm `v0.1.0` olarak etiketlenmiş.

## B14. Kilometre taşları (1. aşama)

Her kilometre taşının sonunda testler geçer, `DURUM.md` güncellenir, commit ve push yapılır, kısa bir özet verilir.

- **K0 – Kurulum:** Proje iskeleti; lint, format, test ve e2e araçları; `CLAUDE.md`, `DURUM.md`, `docs/TASARIM.md`. Boş uygulamanın Android'de açıldığı görülür. Amaç, araç zincirini erkenden doğrulamak.
- **K1 – Motor:** Klasik kurallar ve testleri.
- **K2 – Çözücü ve üretici:** 1. odanın bölümleri ve doğrulama testleri.
- **K3 – Oyun ekranı:** Şişeler, seçim, dökme animasyonu, tamamlanan şişe, kilitlenme paneli, geri al ve yeniden başla. Mobil ekran görüntüleriyle görsel kontrol.
- **K4 – İlerleme:** Ana ekran, oda haritası, bölüm sonu ekranı; yıldız, rekor ve kusursuz çözüm; kayıt ve yükleme; geri tuşu. → **Test APK'sını üret ve haber ver (bkz. A4).**
- **K5 – Ekonomi ve güçler:** Simya tozu, geri al, ipucu (Web Worker'da), ekstra şişe.
- **K6 – Sis ve karışım:** İki mekanik, tanıtım kartları, 2. ve 3. odaların bölümleri, sis kaldır gücü.
- **K7 – Hikâye ve keşif:** Açılış hikâyesi, defter, simya masası, piramit, oda anahtarları.
- **K8 – Öğretici ve cila:** Öğretici, ayarlar, ses, titreşim, erişilebilirlik denetimi, metinlerin son okuması, performans.
- **K9 – Teslim:** Release APK, imzalama belgeleri, test kontrol listesi, sürüm notu ve `v0.1.0` etiketi.

## B15. Kapsam dışı (1. aşama)

- Günün iksiri ve seri takvimi
- Defterdeki kelime bulmacaları
- Rozetler
- Diğer mekanikler
- Play Store yayını
- Hesaplar ve bulut senkronizasyonu
- Çok oyunculu özellikler
- İnternet gerektiren her şey
- Reklam ve satın alma

## B16. Sonraki aşamalar (mimariyi bunlara göre kur)

- **2. aşama:**
  - Defterde WOW tarzı kelime bulmacaları. Bulunan kelimeler hikâyeyi açar. Bunun için bir Türkçe kelime listesi gerekecek.
  - Günün iksiri: tarihten türetilen bir tohumla her gün bir bulmaca. Yanında seri takvimi.
  - Rozetler.
  - Yeni odalar ve mekanikler: mühürlü şişeler, donmuş katmanlar, hamle sınırı, raf düzeni, huni.
  - Piramidin metal katmanları.
- **3. aşama:**
  - Haftalık özel raflar.
  - Yeni sezon: dükkânın üst katı.
  - Kayıp rengin sırrı.

---

## Değişiklik günlüğü

- 2026-11-19: İlk sürüm (başlangıç talimatından olduğu gibi alındı).
