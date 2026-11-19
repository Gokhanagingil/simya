# Tarif ağacı — 1. aşama

Kaynak: `src/alchemy/recipes.ts` (veri), `src/i18n/tr.ts` (ad, bilmece, açık ipucu, açıklama).
Doğrulama: `tests/alchemy.test.ts`, `tests/table.test.ts`.

## Kurallar (oyuncunun çıkarım yapabilmesi için tutarlı)

| Birleşen    | Etki                   |
| ----------- | ---------------------- |
| Ateş        | ısınır ya da sertleşir |
| Su          | yumuşar ya da çözülür  |
| Hava        | hafifler ya da dağılır |
| Toprak      | ağırlaşır ya da çöker  |
| Tuz (ilke)  | billurlaşır            |
| Cıva (ilke) | parlar                 |

## Malzemeler ve kazanıldıkları yer

| Malzeme  | Tür   | Nereden               |
| -------- | ----- | --------------------- |
| Su, Ateş | temel | Vitrin 1. bölüm       |
| Toprak   | temel | Vitrin 10. bölüm      |
| Hava     | temel | Vitrin 20. bölüm      |
| Tuz      | ilke  | Mahzen 10. bölüm      |
| Cıva     | ilke  | Laboratuvar 10. bölüm |

## Tarifler (18)

| #   | Ürün          | Tarif             | Katman   | Kural                                               |
| --- | ------------- | ----------------- | -------- | --------------------------------------------------- |
| 1   | Buhar         | Su + Ateş         | 1 Doğa   | ateşle ısınır                                       |
| 2   | Çamur         | Toprak + Su       | 1        | suyla yumuşar                                       |
| 3   | Lav           | Toprak + Ateş     | 1        | ateşle ısınır                                       |
| 4   | Kum           | Toprak + Hava     | 1        | havayla dağılır                                     |
| 5   | Kıvılcım      | Ateş + Hava       | 1        | havayla dağılır                                     |
| 6   | **Sis** 🔑    | Su + Hava         | 1        | havayla hafifler → **Mahzen'i açar (sis mekaniği)** |
| 7   | Taş           | Toprak + Toprak   | 1        | toprakla ağırlaşır                                  |
| 8   | Tuğla         | Çamur + Ateş      | 2 Zanaat | ateşle sertleşir                                    |
| 9   | Cam           | Kum + Ateş        | 2        | ateşle ısınır (erir)                                |
| 10  | Kurum         | Kıvılcım + Toprak | 2        | toprakla çöker                                      |
| 11  | Billur        | Kum + Tuz         | 2        | tuzla billurlaşır                                   |
| 12  | Mürekkep      | Kurum + Su        | 2        | suyla çözülür                                       |
| 13  | Bulut         | Buhar + Hava      | 2        | havayla hafifler                                    |
| 14  | Işık          | Kıvılcım + Hava   | 3 Işık   | havayla dağılır                                     |
| 15  | Gökkuşağı     | Işık + Su         | 3        | suyla çözülür (renklerine ayrılır)                  |
| 16  | Mercek        | Cam + Ateş        | 3        | ateşle biçim alır                                   |
| 17  | **Prizma** 🔑 | Billur + Işık     | 3        | → **Laboratuvar'ı açar (karışım mekaniği)**         |
| 18  | Ayna          | Cam + Cıva        | 3        | cıvayla parlar                                      |

Tepe: **Kayıp renk** — 1. aşamada kilitli (son sezonda açılır).

## Kilit mantığı

- Mahzen: Vitrin'in 20. bölümü tamamlanmış **ve** Sis keşfedilmiş olmalı. Hava 20. bölümde geldiği için
  Sis ancak oda bitince keşfedilebilir.
- Laboratuvar: Mahzen'in 20. bölümü tamamlanmış **ve** Prizma keşfedilmiş olmalı. Prizma için Billur, onun
  için Tuz gerekir (Mahzen 10. bölüm); bu yüzden Prizma Mahzen'in ilk yarısında yapılamaz.
- Ayna, Cıva ile Laboratuvar'da açılır ve 1. aşamanın son defter sayfasına (aynadaki ters yazı) bağlanır.

## Testlerin garanti ettikleri

- 15–20 tarif, 4 temel madde, 3 katman.
- Çift tanım yok: her malzeme çifti ve her ürün tek bir tarifte.
- Yetim tarif yok: her girdi tanımlı ve 1. aşama ödülleriyle ulaşılabilir; her bileşiğin bir tarifi var.
- Her oda anahtarı önceki odanın ödülleriyle ulaşılabilir, ama odanın ilk yarısında ulaşılamaz.
- Her maddenin adı, bilmecesi, açık ipucu (3 başarısız denemeden sonra) ve açıklaması var.
