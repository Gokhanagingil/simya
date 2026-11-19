# Bölüm üretimi ve zorluk puanı

Üretici: `scripts/generate-levels.ts` (`npm run levels [oda...]`). Çıktı: `src/levels/room<N>.json`.
Bölümler elle tasarlanmaz; her oda yuvası için tohumlu adaylar üretilir.

## Aday üretimi

- **Klasik / sis:** Yuvanın renk sayısı kadar renk seçilir, birimler karıştırılıp şişelere dağıtılır, boş
  şişeler eklenir. Sisli odada her şişenin üst birimi dışındaki birimler yuvanın olasılığıyla gizlenir.
- **Karışım:** Hedefte olması istenen ikincil renkler (turuncu, yeşil, mor) ana renk birimlerine bölünür
  (bazen hazır ikincil birimlerle), kalan hedefler saf renklerdir; sonra birimler karıştırılır.
- Başlangıçta tamamlanmış şişe olan, 10'dan fazla şişe ya da 8'den fazla renk içeren aday atılır.

## En kısa çözüm kanıtı

Her aday `src/solver/solver.ts` içindeki A* ile çözülür. Sezgisel fonksiyon **kabul edilebilir ve
tutarlıdır**, bu yüzden bulunan ilk çözüm kanıtlanmış en kısa çözümdür:

- Klasik/sis: `(renk koşuları − hedefte dolu şişe) + tabanında rengi olmayan renk sayısı`.
- Karışım: `max(⌈(R − F)/2⌉, ⌈Rn + Ra/2 − F⌉) + tabanı eksik sabit renkler` (Rn: ana renk olmayan,
  Ra: ana renk koşuları). Gerekçe dosyadaki yorumlarda; doğruluk BFS testleriyle (`tests/solver.test.ts`).
- Düğüm sınırı aşılırsa aday **atılır** (klasik/sis 1,5 M, karışım 250 B düğüm).

## Zorluk puanı (0–1)

`src/levels/difficulty.ts`:

| Özellik                                                          | Ağırlık | Normalleştirme                    |
| ---------------------------------------------------------------- | ------- | --------------------------------- |
| En kısa çözüm uzunluğu                                           | 0,30    | 3 → 34 hamle                      |
| Renk sayısı                                                      | 0,15    | 2 → 8                             |
| Boş şişe azlığı                                                  | 0,10    | 1 boş = 1, 2 boş = 0,5, 3+ = 0,15 |
| Dallanma (çözüm yolundaki ortalama geçerli hamle)                | 0,10    | 2 → 14                            |
| Tuzak yoğunluğu (rastgele oyunların çözümsüz duruma düşme oranı) | 0,20    | 0 → 1                             |
| Gizli birim oranı                                                | 0,10    | 0 → 0,6                           |
| Karışması gereken ana renk oranı                                 | 0,05    | 0 → 0,6                           |

**Kalibrasyon:** Ağırlıklar, aynı odadaki adayların puan sırası ile çözüm uzunluğu ve tuzak oranının
sezgisel sırası uyuşacak şekilde seçildi (ör. 1 boş şişeli 5 renk, 2 boş şişeli 6 renkten daha zor
puanlanır; bu, oyun deneyiminde de böyledir). Tuzak yoğunluğu, aynı uzunluktaki iki bölümden
"yanlış hamlenin cezalandırıldığı" bölümü ayırır. Puanlar yalnızca oda içinde sıralama için
kullanılır; odalar arası mutlak karşılaştırma amaçlanmaz.

## Zorluk eğrisi

Her yuvanın bir rolü vardır: `intro` (en kolay aday), `easy` (%20), `mid` (%55), `hard` (%85), `peak`
(en zor). Rol sırası testere dişidir: zor bir bölümün ardından 1–2 rahat bölüm gelir; son bölümler
odanın en zorlarıdır. 2. ve 3. odalarda klasik kurallar yeni mekanikle harmanlanır.

Testler (`tests/levels.test.ts`): ilk bölüm odanın en kolayı; en zor bölüm son üç bölümden biri; en az
4 düşüş (testere dişi); son 5 bölümün ortalaması ilk 5'ten yüksek; ilk bölüm ≤ 6 hamle ve ≤ 4 şişe.

## Ödüller

`src/levels/rewards.ts` — bkz. `docs/TARIFLER.md`.
