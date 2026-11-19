/**
 * Tüm arayüz metinleri. Kodun içinde sabit metin bulunmaz.
 * Dil: sade, kısa, yetişkin okura saygılı Türkçe. Övgü yerine zarif tespitler.
 */

export const LOCALE = 'tr-TR';

/** Türkçe büyük harf (i → İ, ı → I). */
export function upper(text: string): string {
  return text.toLocaleUpperCase(LOCALE);
}

export function formatNumber(n: number): string {
  return n.toLocaleString(LOCALE);
}

export const tr = {
  appName: 'Simyacının Sırrı',

  common: {
    back: 'Geri',
    close: 'Kapat',
    continue: 'Devam',
    cancel: 'Vazgeç',
    ok: 'Tamam',
    skip: 'Atla',
    next: 'İleri',
    yes: 'Evet',
    locked: 'Kilitli',
    dust: 'Simya tozu',
    dustShort: 'toz',
    stars: 'Yıldız',
    perfect: 'Kusursuz',
    free: 'Ücretsiz',
    cost: (n: number) => `${n} toz`,
  },

  rooms: {
    1: { name: 'Vitrin', tagline: 'Dükkânın ön rafları', mechanic: 'Klasik' },
    2: { name: 'Mahzen', tagline: 'Merdivenin altındaki serin oda', mechanic: 'Sis' },
    3: { name: 'Laboratuvar', tagline: 'Simyacının çalışma odası', mechanic: 'Karışım' },
  } as Record<number, { name: string; tagline: string; mechanic: string }>,

  home: {
    title: 'Dükkân',
    continue: 'Devam Et',
    continueLevel: (room: string, index: number) => `${room} · ${index}. bölüm`,
    continueKey: 'Simya masasında anahtar maddeyi bulun',
    allDone: 'Tüm raflar düzende',
    allDoneSub: 'Bölümleri yeniden oynayıp rekorlarınızı geliştirebilirsiniz.',
    rooms: 'Odalar',
    table: 'Simya Masası',
    notebook: 'Defter',
    settings: 'Ayarlar',
    starsLabel: 'Toplam yıldız',
    perfectLabel: 'Kusursuz çözüm',
    dustLabel: 'Simya tozu',
    exitTitle: 'Oyundan çıkmak istiyor musunuz?',
    exitBody: 'İlerlemeniz kaydedildi.',
    exitYes: 'Evet, çık',
    exitNo: 'Oyunda kal',
    newMaterial: 'Yeni malzeme var',
  },

  map: {
    title: 'Odalar',
    level: (n: number) => `${n}. bölüm`,
    roomLocked: 'Bu oda henüz kilitli.',
    roomLockedHow: (key: string) =>
      `Açmak için önceki odayı bitirin ve “${key}” maddesini keşfedin.`,
    levelLocked: 'Önce bir önceki bölümü tamamlayın.',
    progress: (done: number, total: number) => `${done} / ${total} bölüm`,
    stars: (n: number, max: number) => `${n} / ${max} yıldız`,
  },

  game: {
    title: (room: string, index: number) => `${room} · ${index}`,
    moves: 'Hamle',
    target: '3★ hedef',
    targetValue: (n: number) => `≤ ${n}`,
    undo: 'Geri al',
    undoFree: (n: number) => `${n} ücretsiz`,
    restart: 'Yeniden',
    hint: 'İpucu',
    extra: 'Ekstra şişe',
    fogClear: 'Sis kaldır',
    paidNote: 'Ücretli güç: en fazla 2★',
    notEnoughDust: 'Yeterli simya tozunuz yok.',
    extraUsed: 'Bu bölümde ekstra şişe kullanıldı.',
    noUndo: 'Geri alınacak hamle yok.',
    invalidTarget: 'Sıvı yalnızca boş bir şişeye ya da üstte aynı renk olan bir şişeye dökülür.',
    invalidTargetMix:
      'Sıvı boş şişeye, aynı rengin üstüne ya da farklı bir ana rengin üstüne dökülür.',
    completedBottle: 'Mühürlü şişeler düzenli kalır; seçilemez.',
    pickFogBottle: 'Sisini kaldırmak istediğiniz şişeye dokunun.',
    noFogHere: 'Bu şişede gizli birim yok. Başka bir şişe seçin.',
    noFogLeft: 'Bu bölümde gizli birim kalmadı.',
    fogCancel: 'Vazgeç',
    hintThinking: 'Düşünülüyor…',
    hintNoExit: 'Bu durumdan çıkış yok, birkaç hamle geri almayı deneyin.',
    hintTimeout: 'Bu kez bir öneri bulunamadı. Birkaç hamle geri alıp yeniden deneyin.',
    hintShown: 'Ok, önerilen hamleyi gösteriyor.',
    stuckTitle: 'Hamle kalmadı',
    stuckBody: 'Raf bu hâliyle ilerlemiyor. Şunlardan birini seçebilirsiniz:',
    restartTitle: 'Bölüm yeniden başlasın mı?',
    restartBody: 'Şişeler ilk hâline döner. Hamle sayınız sıfırlanır.',
    restartYes: 'Evet, yeniden başla',
    paidConfirmTitle: (power: string) => `${power} kullanılsın mı?`,
    paidConfirmBody: (cost: number) =>
      `Bedeli ${cost} simya tozu. Ücretli güç kullanılan bölümde en fazla 2 yıldız alınır.`,
    paidConfirmYes: (cost: number) => `Evet, ${cost} toz harca`,
    undoPaidConfirmBody: (cost: number) =>
      `Ücretsiz geri alma hakkınız bitti. Bu geri alma ${cost} simya tozu. Ücretli güç kullanılan bölümde en fazla 2 yıldız alınır.`,
    srBottle: (i: number, desc: string) => `Şişe ${i}: ${desc}`,
    srEmpty: 'boş',
    srHidden: 'gizli',
    srSealed: 'mühürlü',
    mixPreview: (c: string) => `Karışım: ${c}`,
  },

  result: {
    title: 'Raf düzenlendi',
    perfect: 'Kusursuz çözüm',
    yourMoves: 'Hamleniz',
    bestSolution: 'En iyi çözüm',
    record: 'Rekorunuz',
    newRecord: (n: number) => `Rekorunuzu ${n} hamle geliştirdiniz`,
    firstRecord: 'İlk rekorunuz kaydedildi',
    recordStays: (n: number) => `Rekorunuz: ${n} hamle`,
    extraNoRecord: 'Ekstra şişeyle yapılan çözüm rekora sayılmaz.',
    paidCap: 'Ücretli güç kullanıldı: en fazla 2 yıldız.',
    dustEarned: 'Kazanılan simya tozu',
    breakdownFirst: 'İlk kez tamamlama',
    breakdownStars: 'Yeni yıldızlar',
    breakdownPerfect: 'İlk kusursuz çözüm',
    breakdownRoom: 'Oda tamamlandı',
    noNewDust: 'Bu kez yeni ödül yok. Yeni yıldız ya da kusursuz çözüm ödül getirir.',
    materials: 'Yeni malzeme',
    materialsHint: 'Simya masasında deneyebilirsiniz.',
    next: 'Sonraki bölüm',
    replay: 'Tekrar oyna',
    toMap: 'Odalara dön',
    toTable: 'Simya masası',
    roomDone: (room: string) => `${room} tamamlandı`,
    starsAria: (n: number) => `${n} yıldız`,
  },

  table: {
    title: 'Simya Masası',
    intro: 'İki malzeme seçin, sonra “Birleştir”e dokunun.',
    slotEmpty: 'Boş yuva',
    combine: 'Birleştir',
    clear: 'Temizle',
    inventory: 'Malzemeleriniz',
    nothing: 'Bu ikisi bir şey oluşturmadı.',
    already: (name: string) => `Bunu zaten biliyorsunuz: ${name}.`,
    discovered: 'Yeni keşif',
    discoveredBody: (name: string) => `${name} deftere yazıldı, piramitte yerini aldı.`,
    keyFound: 'Anahtar madde bulundu',
    hintTitle: 'Defterden bir not',
    noMaterials: 'Henüz malzemeniz yok. Malzemeler bölümlerden kazanılır.',
    pyramid: 'Piramit',
    selectedSlot: (n: number) => `${n}. yuva`,
    removeFromSlot: 'Yuvadan çıkar',
    keyRiddleTitle: 'Kapıyı açacak madde',
  },

  pyramid: {
    title: 'Keşif Piramidi',
    base: 'Temel maddeler',
    layers: { 1: 'Doğa', 2: 'Zanaat', 3: 'Işık' } as Record<number, string>,
    apex: 'Kayıp renk',
    apexLocked: 'Tepe hâlâ karanlık. Bu renk başka bir mevsimde açılacak.',
    unknown: 'Bilinmeyen madde',
    discovered: (n: number, total: number) => `${n} / ${total} madde keşfedildi`,
  },

  notebook: {
    title: 'Defter',
    tabs: { story: 'Hikâye', recipes: 'Tarifler', riddles: 'İpuçları', howto: 'Nasıl oynanır' },
    storyLocked: 'Bu sayfa henüz okunmuyor.',
    noRecipes: 'Henüz keşif yok. Simya masasında iki malzemeyi birleştirmeyi deneyin.',
    noRiddles: 'Tüm bilmeceler çözüldü.',
    principles: 'Simyacının ilkeleri',
    riddlesIntro: 'Keşfedilmemiş maddeler için Nuri Usta’nın notları:',
    clueLabel: 'Açık not',
    keyBadge: 'Anahtar',
    recipeLine: (a: string, b: string) => `${a} + ${b}`,
  },

  principles: [
    { id: 'ates', text: 'Ateşle birleşen ısınır ya da sertleşir.' },
    { id: 'su', text: 'Suyla birleşen yumuşar ya da çözülür.' },
    { id: 'hava', text: 'Havayla birleşen hafifler ya da dağılır.' },
    { id: 'toprak', text: 'Toprakla birleşen ağırlaşır ya da çöker.' },
    { id: 'tuz', text: 'Tuzla birleşen billurlaşır.' },
    { id: 'civa', text: 'Cıvayla birleşen parlar.' },
  ],

  settings: {
    title: 'Ayarlar',
    textSize: 'Yazı boyutu',
    textSizes: { normal: 'Normal', large: 'Büyük', xlarge: 'Çok büyük' },
    symbols: 'Renk sembolleri',
    symbolsHint: 'Her rengin içinde bir şekil görünür.',
    sound: 'Ses efektleri',
    music: 'Müzik',
    volume: 'Ses düzeyi',
    volumeLevels: { low: 'Kısık', mid: 'Orta', high: 'Yüksek' },
    vibration: 'Titreşim',
    slowAnimation: 'Yavaş animasyon',
    slowAnimationHint: 'Dökme hareketi daha yavaş oynar.',
    on: 'Açık',
    off: 'Kapalı',
    tutorial: 'Öğreticiyi yeniden göster',
    tutorialDone: 'Öğretici, Vitrin’in ilk bölümünde başlıyor.',
    reset: 'İlerlemeyi sıfırla',
    resetTitle: 'Tüm ilerleme silinsin mi?',
    resetBody: 'Yıldızlar, rekorlar, simya tozu ve keşifler silinir. Bu işlem geri alınamaz.',
    resetYes: 'Evet, sıfırla',
    resetConfirmTitle: 'Emin misiniz?',
    resetConfirmBody: 'Son kez soruyoruz: dükkân ilk günkü hâline dönecek.',
    resetConfirmYes: 'Evet, her şeyi sil',
    resetDone: 'İlerleme sıfırlandı.',
    about: 'Hakkında',
    sample: 'Örnek yazı: Raflar düzene girdikçe defter konuşur.',
  },

  about: {
    title: 'Hakkında',
    version: (v: string) => `Sürüm ${v}`,
    body: 'Simyacının Sırrı, eski bir İstanbul dükkânında geçen bir renk ve mantık bulmacasıdır. İnternet bağlantısı, reklam ya da satın alma yoktur.',
    licenses:
      'Kullanılan yazı tipi: Atkinson Hyperlegible Next (SIL Open Font License 1.1). Tüm görseller ve sesler bu oyun için özgün olarak üretildi.',
    devLeft: (n: number) => `Geliştirici menüsüne ${n} dokunuş kaldı.`,
  },

  dev: {
    title: 'Geliştirici menüsü',
    jump: 'Bölüme atla',
    addDust: '+100 toz',
    showSolution: 'Çözümü göster',
    solutionEmpty: 'Önce bir bölüm açın.',
    resetTutorial: 'Öğreticiyi sıfırla',
    unlockAll: 'Tüm bölümleri aç',
    grantMaterials: 'Tüm malzemeleri ver',
    export: 'Kaydı dışa aktar',
    import: 'Kaydı içe aktar',
    importPlaceholder: 'Kayıt JSON metnini buraya yapıştırın',
    importApply: 'İçe aktar',
    importOk: 'Kayıt içe aktarıldı.',
    importFail: 'Kayıt okunamadı.',
    copied: 'Panoya kopyalandı.',
    close: 'Menüyü kapat',
  },

  intro: {
    pages: [
      {
        title: 'Bir mektup',
        body: 'Noterden gelen zarfta adınız yazıyordu. Kuledibi’nde, yokuşun ortasında küçük bir dükkân: Nuri Usta’nın simya dükkânı. Kırk yıldır kapalıymış. Artık sizin.',
      },
      {
        title: 'Dükkân',
        body: 'Kapı gıcırdayarak açılıyor. Raflar renk renk şişelerle dolu, ama hepsi birbirine karışmış. Sanki biri aceleyle çıkıp gitmiş.',
      },
      {
        title: 'Defter',
        body: 'Tezgâhta deri kaplı bir defter duruyor. Sayfalar okunmayan işaretlerle dolu. Yalnızca son sayfa açık seçik: “Kimsenin görmediği bir renk buldum.”',
      },
      {
        title: 'İlk raf',
        body: 'Belki düzen, defterin dilini çözer. Vitrindeki raftan başlayalım.',
      },
    ],
    start: 'Başla',
  },

  story: {
    oda1: {
      title: 'Birinci sayfa',
      body: 'Vitrin düzene girdiğinde defterin ilk sayfasındaki işaretler yerine oturdu. Nuri Usta’nın eğik el yazısı:\n\n“Dört madde her şeyin anasıdır: su, ateş, toprak, hava. Çırak olan bunları ezberler. Usta olan, aralarındaki konuşmayı dinler. Su havayla konuşunca hafifler; görüneni saklar, saklıyı gösterir. Mahzenin kapısı yalnızca onu tanır. Aşağıda, rafların ardında bir şey bıraktım. Sisin içinden bakmayı öğrenen onu görür.”',
    },
    oda2: {
      title: 'Mahzendeki not',
      body: 'Mahzenin en dip rafında, mumla mühürlenmiş bir zarf buldunuz. İçinde iki satır ve kurumuş bir menekşe:\n\n“Saadet’e: Renkleri ancak ışığı bölünce gördük. Bir billur gerek, ışığı yedi parçaya ayıracak. Laboratuvarı ona göre kurdum. Sen resimlerine yedi renk sürdün; ben sekizinciyi aradım.”\n\nSaadet. Büyükannenizin adı.',
    },
    oda3: {
      title: 'Aynadaki satır',
      body: 'Laboratuvarın son rafı da düzene girince, köşedeki örtülü aynayı açtınız. Camın üstünde, ters yazılmış bir satır vardı. Defteri aynaya tuttunuz ve okudunuz:\n\n“Yedi rengin hepsi ışıkta. Sekizincisi gölgede saklı. Üç ilkeden ikisi masada: tuz ve cıva. Üçüncüsü üst katta, Saadet’in bıraktığı yerde.”\n\nDükkânın bir üst katı olduğunu bilmiyordunuz. Merdivenin başında kilitli bir kapı duruyor.',
    },
    keyRiddles: {
      2: {
        title: 'Mahzenin anahtarı',
        body: 'Su, havanın kollarında hafifler. Yere değmeden yürür; görüneni saklar, saklıyı gösterir. Mahzenin kapısı bu maddeyi bekliyor.',
      },
      3: {
        title: 'Laboratuvarın anahtarı',
        body: 'Kumdan doğan billur, ışıkla buluşunca onu yedi parçaya böler. Laboratuvarın kapısı bu camı bekliyor.',
      },
    } as Record<number, { title: string; body: string }>,
    unlock: {
      2: {
        title: 'Mahzen açıldı',
        body: 'Sis merdivenden aşağı süzüldü ve mahzenin kapısı kendiliğinden aralandı. Aşağıdaki raflarda bazı şişelerin içi görünmüyor.',
      },
      3: {
        title: 'Laboratuvar açıldı',
        body: 'Prizmayı kapının üstündeki yuvaya yerleştirdiniz. Işık yedi renge bölündü ve kilit döndü. Laboratuvarda renkler birbirine karışabiliyor.',
      },
    } as Record<number, { title: string; body: string }>,
    unlockGo: 'Odaya gir',
  },

  mechanics: {
    classic: {
      title: 'Raf düzeni',
      body: 'Bir şişeye, sonra hedef şişeye dokunun. Üstteki aynı renkli sıvı dökülür. Her rengi kendi şişesinde toplayın.',
      rules: [
        'Sıvı boş bir şişeye ya da üstte aynı renk olan bir şişeye dökülür.',
        'Dolu ve tek renkli şişe mühürlenir.',
        'Tüm şişeler mühürlü ya da boş olunca raf düzenlenir.',
      ],
    },
    fog: {
      title: 'Yeni kural: Sis',
      body: 'Mahzende bazı birimler sisle örtülü ve “?” ile görünür. Üstündeki sıvı dökülünce sis kalkar.',
      rules: [
        'Şişenin en üstü her zaman görünür.',
        'Sisli birim dökülemez; en üste gelince açığa çıkar.',
        'Yıldız hedefleri sisli bölümlerde daha esnektir.',
      ],
    },
    mix: {
      title: 'Yeni kural: Karışım',
      body: 'Laboratuvarda ana renkler karışır. Bir ana rengi, başka bir ana rengin üstüne dökebilirsiniz.',
      rules: [
        'Kırmızı + sarı = turuncu',
        'Sarı + mavi = yeşil',
        'Kırmızı + mavi = mor',
        'Karışan renkler bir daha karışmaz. Sonucu dökmeden önce şişenin üstünde görürsünüz.',
      ],
    },
    start: 'Anladım',
  },

  tutorial: {
    tapSource: 'Bu şişeye dokunun.',
    tapTarget: 'Şimdi parlayan şişeye dokunun. Sıvı oraya dökülür.',
    keepGoing: 'Aynı renkleri bir şişede toplayın. Dolan şişe mühürlenir.',
    sealed: 'Şişe mühürlendi. Mühürlü şişeler bozulmaz.',
    undoTip: 'Yanlış bir hamle mi? “Geri al” her bölümde 3 kez ücretsizdir.',
    deselect: 'Seçimi bırakmak için aynı şişeye ya da boş bir yere dokunun.',
    done: 'Öğretici tamamlandı. Sonraki raflar daha düşündürücü.',
    skip: 'Öğreticiyi atla',
  },

  tips: {
    gotIt: 'Anladım',
    undo: 'Yanlış bir hamle mi? “Geri al” her bölümde 3 kez ücretsizdir. “Yeniden” her zaman ücretsizdir.',
    stars: 'Daha az hamle, daha çok yıldız. 3 yıldız hedefi üst çubukta yazıyor.',
    firstResult: 'Bölümleri istediğiniz zaman yeniden oynayıp rekorunuzu geliştirebilirsiniz.',
    firstMaterial:
      'Malzeme kazandınız. Simya masasında iki malzemeyi birleştirip yeni maddeler keşfedebilirsiniz.',
    firstFail3: 'Defter yeni bir not ekledi.',
  },

  howto: {
    intro: 'Kuralların hepsi burada. İstediğiniz zaman yeniden okuyabilirsiniz.',
    powersTitle: 'Güçler',
    powers: [
      {
        id: 'undo',
        text: 'Geri al: son hamleyi geri alır. Her bölümde 3 kez ücretsiz, sonra 5 toz.',
      },
      { id: 'restart', text: 'Yeniden: bölümü baştan başlatır. Her zaman ücretsiz.' },
      { id: 'hint', text: 'İpucu: sıradaki doğru hamleyi okla gösterir. 20 toz.' },
      { id: 'extra', text: 'Ekstra şişe: rafa boş bir şişe ekler. Bölüm başına bir kez, 30 toz.' },
      { id: 'fog', text: 'Sis kaldır: seçtiğiniz şişedeki tüm gizli birimleri açar. 15 toz.' },
    ],
    powersNote:
      'Ücretli bir güç kullanılan bölümde en fazla 2 yıldız alınır. Ücretsiz geri almalar sayılmaz.',
    starsTitle: 'Yıldızlar',
    stars: [
      '3 yıldız: en iyi çözüme çok yakın hamle sayısı.',
      '2 yıldız: en iyi çözümün yarısı kadar fazla hamleye kadar.',
      '1 yıldız: rafı düzenlemek.',
      'Kusursuz çözüm: en iyi çözümle aynı hamle sayısı. Altın taç ve ek toz kazandırır.',
    ],
    tableTitle: 'Simya masası',
    table: [
      'Bölümlerden malzeme kazanırsınız.',
      'Masada iki malzemeyi birleştirin. Tarif varsa yeni bir madde keşfedersiniz.',
      'Yanlış denemenin cezası yoktur; malzemeler tükenmez.',
      'Her odanın sonunda bir anahtar madde sonraki odayı açar.',
    ],
  },

  colors: {
    red: 'kırmızı',
    orange: 'turuncu',
    yellow: 'sarı',
    green: 'yeşil',
    blue: 'mavi',
    purple: 'mor',
    pink: 'pembe',
    brown: 'kahverengi',
    gray: 'gri',
  } as Record<string, string>,

  materials: {
    su: { name: 'Su', riddle: '', clue: '', text: 'Akar, yumuşatır, çözer.' },
    ates: { name: 'Ateş', riddle: '', clue: '', text: 'Isıtır, sertleştirir.' },
    toprak: { name: 'Toprak', riddle: '', clue: '', text: 'Taşır, ağırlaştırır.' },
    hava: { name: 'Hava', riddle: '', clue: '', text: 'Hafifletir, dağıtır.' },
    tuz: {
      name: 'Tuz',
      riddle: '',
      clue: '',
      text: 'Simyanın ilk ilkesi: beden. Tuzla birleşen billurlaşır.',
    },
    civa: {
      name: 'Cıva',
      riddle: '',
      clue: '',
      text: 'İkinci ilke: ruh. Cıvayla birleşen parlar.',
    },
    buhar: {
      name: 'Buhar',
      riddle: 'Ateşe dokunan su kabına sığmaz olur; yükselir, camı buğular.',
      clue: 'Su gerekir. Ateşle birleşen ısınır.',
      text: 'Isınan suyun göğe yürüyüşü.',
    },
    camur: {
      name: 'Çamur',
      riddle: 'Toprak suyla buluşunca yumuşar; çömlekçinin ilk sevdiği.',
      clue: 'Toprak gerekir. Suyla birleşen yumuşar.',
      text: 'Yumuşamış toprak; her biçime hazır.',
    },
    lav: {
      name: 'Lav',
      riddle: 'Toprak ateşle ısınınca dağların içinden akan bir nehre döner.',
      clue: 'Toprak gerekir. Ateşle birleşen ısınır.',
      text: 'Eriyen kaya, yavaş ve kızıl.',
    },
    kum: {
      name: 'Kum',
      riddle: 'Toprak havaya karışınca dağılır; tane tane, çöl olur.',
      clue: 'Toprak gerekir. Havayla birleşen dağılır.',
      text: 'Rüzgârın öğüttüğü toprak.',
    },
    kivilcim: {
      name: 'Kıvılcım',
      riddle: 'Ateş havada dağılır; küçük, parlak, bir anlık.',
      clue: 'Ateş gerekir. Havayla birleşen dağılır.',
      text: 'Ateşin havaya savrulan parçası.',
    },
    sis: {
      name: 'Sis',
      riddle:
        'Su, havanın kollarında hafifler. Yere değmeden yürür; görüneni saklar, saklıyı gösterir.',
      clue: 'Su gerekir. Havayla birleşen hafifler.',
      text: 'Hafiflemiş su. Mahzenin kapısını açtı.',
    },
    tas: {
      name: 'Taş',
      riddle: 'Toprak kendi üstüne çöker, ağırlaşır; yüzyıllar geçse de yerinden oynamaz.',
      clue: 'Toprakla birleşen ağırlaşır. Toprağın kendisi bile.',
      text: 'Kendi ağırlığıyla sıkışmış toprak.',
    },
    tugla: {
      name: 'Tuğla',
      riddle: 'Çamur ateşte sertleşir; evlerin, fırınların ilk taşı olur.',
      clue: 'Çamur gerekir. Ateşle birleşen sertleşir.',
      text: 'Ateşte pişmiş çamur.',
    },
    cam: {
      name: 'Cam',
      riddle: 'Kum ateşte erir ve ışığı geçiren bir duvara dönüşür. Raflardaki her şişe bundan.',
      clue: 'Kum gerekir. Ateşle birleşen ısınır.',
      text: 'Işığı geçiren erimiş kum.',
    },
    kurum: {
      name: 'Kurum',
      riddle: 'Kıvılcım toprağa düşünce söner; geriye kara bir iz kalır.',
      clue: 'Kıvılcım gerekir. Toprakla birleşen çöker.',
      text: 'Sönmüş ateşin bıraktığı karalık.',
    },
    billur: {
      name: 'Billur',
      riddle: 'Kum tuzla buluşunca billurlaşır; içinden bakan dünyayı başka görür.',
      clue: 'Kum gerekir. Tuzla birleşen billurlaşır.',
      text: 'Kumun en saf, en duru hâli.',
    },
    murekkep: {
      name: 'Mürekkep',
      riddle: 'Kurum suda çözülür; defterin her satırı bununla yazıldı.',
      clue: 'Kurum gerekir. Suyla birleşen çözülür.',
      text: 'Nuri Usta’nın defterindeki koyu mavi-siyah.',
    },
    bulut: {
      name: 'Bulut',
      riddle: 'Buhar havayla hafifler, yükselir; gökyüzünde yüzen bir göl olur.',
      clue: 'Buhar gerekir. Havayla birleşen hafifler.',
      text: 'Gökte asılı duran su.',
    },
    isik: {
      name: 'Işık',
      riddle: 'Kıvılcım havada dağıldıkça dağılır; sonunda yalnızca parıltısı kalır.',
      clue: 'Kıvılcım gerekir. Havayla birleşen dağılır.',
      text: 'Ateşin geriye kalan özü.',
    },
    gokkusagi: {
      name: 'Gökkuşağı',
      riddle: 'Işık suya düşer ve çözülür; içinde sakladığı renkler göğe yayılır.',
      clue: 'Işık gerekir. Suyla birleşen çözülür.',
      text: 'Işığın içindeki yedi renk.',
    },
    mercek: {
      name: 'Mercek',
      riddle: 'Cam bir kez daha ateşe girer ve biçim alır; uzağı yakına getirir.',
      clue: 'Cam gerekir. Ateşle birleşen sertleşir, biçim alır.',
      text: 'Uzağı yakına getiren cam.',
    },
    prizma: {
      name: 'Prizma',
      riddle: 'Kumdan doğan billur ışığı tutar ve onu yedi parçaya böler.',
      clue: 'Billur gerekir. Işıkla birleştirin.',
      text: 'Işığı yedi renge ayıran billur. Laboratuvarın kapısını açtı.',
    },
    ayna: {
      name: 'Ayna',
      riddle: 'Cam, cıvanın gümüşüyle kaplanınca kendine bakanı geri gösterir.',
      clue: 'Cam gerekir. Cıvayla birleşen parlar.',
      text: 'Kendine bakanı gösteren cam. Ters yazılanı düz okutur.',
    },
    'kayip-renk': {
      name: 'Kayıp renk',
      riddle: 'Yedi rengin hepsi ışıkta. Sekizincisi gölgede saklı.',
      clue: '',
      text: 'Kimsenin görmediği renk. Henüz değil.',
    },
  },

  saveRecovered: 'Kayıt dosyası okunamadı; yedekten geri yüklendi.',
  saveReset: 'Kayıt dosyası okunamadı; dükkân yeniden açıldı.',
} as const;

export type Tr = typeof tr;
