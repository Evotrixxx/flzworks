import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedPhoto = "/seed/marketplace-cars.png";

const starterDetails = {
  seats: 5,
  doors: 5,
  climate: "Digitális klíma",
  historyInternationalEnabled: true,
  historyDomesticEnabled: true,
  availableImmediately: true,
  interiorFeatures: ["fedélzeti komputer", "állítható kormány", "ISOFIX rendszer"].join("\n"),
  technicalFeatures: ["ABS", "ESP", "tempomat", "tolatóradar"].join("\n"),
  exteriorFeatures: ["elektromos ablak elöl", "elektromos tükör", "könnyűfém felni"].join("\n"),
  multimediaFeatures: ["rádió", "bluetooth-os kihangosító", "USB csatlakozó"].join("\n"),
  extraInfo: ["rendszeresen karbantartott", "vezetett szervizkönyv"].join("\n"),
};

const premiumDetails = {
  yearMonth: "2025/9",
  priceEur: 127037,
  financingDetails: "60%-tól elvihető",
  financeTermMonths: 25,
  seats: 5,
  doors: 5,
  color: "Sárga",
  upholsteryPrimary: "Világosszürke",
  upholsterySecondary: "Sötétszürke",
  curbWeightKg: 2550,
  grossWeightKg: 3050,
  trunkVolumeLiters: 500,
  climate: "Digitális többzónás klíma",
  roof: "Panorámatető",
  engineDisplacementCcm: 4395,
  powerKw: 430,
  powerHp: 585,
  cylinderLayout: "V",
  driveType: "Összkerék",
  gearboxDetail: "Automata (8 fokozatú tiptronic)",
  batteryCapacityPercent: 100,
  acChargerType: "Type 2",
  fastCharging: true,
  wltpRangeKm: 65,
  systemPowerKw: 535,
  systemPowerHp: 727,
  documentsType: "Forgalomból ideiglenesen kivont, magyar okmányokkal",
  inspectionValidUntil: "2029/9",
  frontTireSize: "285/40 R 20",
  rearTireSize: "295/35 R 21",
  vatDeductible: true,
  tradeInAvailable: true,
  availableImmediately: true,
  interiorFeatures: [
    "bőr belső",
    "memóriás utasülés",
    "dönthető utasülések",
    "fűthető első ülés",
    "memóriás vezetőülés",
    "ülésmagasság állítás",
    "fűthető kormány",
    "középső kartámasz",
    "üléshűtés/szellőztetés",
    "álló helyzeti klíma",
    "automatikusan sötétedő belső tükör",
    "multifunkciós kormánykerék",
    "elektromosan állítható fejtámlák",
    "állítható combtámasz",
    "deréktámasz",
    "elektromos ülésállítás vezetőoldal",
    "elektromos ülésállítás utasoldal",
    "fűthető első és hátsó ülések",
    "bőrkormány",
    "digitális műszeregység",
    "gesztusvezérlés",
    "csomag rögzítő",
    "ISOFIX rendszer",
    "hátsó fejtámlák",
    "állítható kormány",
    "fedélzeti komputer",
    "kormányváltó",
    "sportülések",
    "HUD / Head-Up Display",
  ].join("\n"),
  technicalFeatures: [
    "kulcsnélküli nyitórendszer",
    "kulcs nélküli indítás",
    "tolatóradar",
    "tolatókamera",
    "távolsági fényszóró asszisztens",
    "360 fokos kamerarendszer",
    "első-hátsó parkolóradar",
    "ABS (blokkolásgátló)",
    "ASR (kipörgésgátló)",
    "ESP (menetstabilizátor)",
    "elektronikus rögzítőfék",
    "automatikus segélyhívó",
    "ütközés veszélyre felkészítő rendszer",
    "EBD/EBV (elektronikus fékerő-elosztó)",
    "EDS (elektronikus differenciálzár)",
    "tempomat",
    "sávtartó rendszer",
    "ARD (automatikus távolságtartó)",
    "tábla-felismerő funkció",
    "holttér-figyelő rendszer",
    "guminyomás-ellenőrző rendszer",
    "indításgátló (immobiliser)",
    "sávváltó asszisztens",
    "visszagurulás-gátló",
    "fáradtságérzékelő",
    "radaros fékasszisztens",
    "hátsó keresztirányú forgalomra figyelmeztetés",
    "távolságtartó tempomat",
    "koccanásgátló",
    "parkolóasszisztens",
    "vészfék asszisztens",
    "centrálzár",
    "riasztó",
    "szervokormány",
    "állítható felfüggesztés",
    "sportfutómű",
    "start-stop/motormegállító rendszer",
    "vonóhorog - elektromosan kihajtható",
    "Type2 töltőkábel",
  ].join("\n"),
  exteriorFeatures: [
    "automatikusan sötétedő külső tükör",
    "elektromos csomagtérajtó-mozgatás",
    "elektromosan behajtható külső tükrök",
    "automata fényszórókapcsolás",
    "automata távfény",
    "menetfény",
    "esőszenzor",
    "LED fényszóró",
    "elektromos ablak elöl",
    "elektromos ablak hátul",
    "elektromos tükör",
    "fűthető tükör",
    "könnyűfém felni",
    "színezett üveg",
    "vonóhorog",
    "defektjavító készlet",
  ].join("\n"),
  multimediaFeatures: [
    "rádió",
    "GPS (navigáció)",
    "kihangosító",
    "bluetooth-os kihangosító",
    "USB csatlakozó",
    "MP3 lejátszás",
    "érintőkijelző",
    "12 hangszóró",
    "Hi-Fi",
    "Android Auto",
    "Apple CarPlay",
    "kormányról vezérelhető hifi",
    "multifunkcionális kijelző",
    "vezeték nélküli telefontöltés",
  ].join("\n"),
  extraInfo: [
    "ÁFA visszaigényelhető",
    "autóbeszámítás lehetséges",
    "azonnal elvihető",
    "első forgalomba helyezés Magyarországon",
    "első tulajdonostól",
    "frissen szervizelt",
    "garanciális",
    "garantált km futás",
    "keveset futott",
    "nem dohányzó",
    "rendszeresen karbantartott",
    "törzskönyv",
    "végig vezetett szervizkönyv",
    "vezetett szervizkönyv",
    "60%-tól elvihető",
  ].join("\n"),
};

async function main() {
  const resetSeedData = process.env.RESET_SEED_DATA === "true";
  const productionResetAllowed = process.env.ALLOW_PRODUCTION_SEED_RESET === "true";

  if (resetSeedData && process.env.NODE_ENV === "production" && !productionResetAllowed) {
    throw new Error(
      "Refusing to reset seed data in production. Set ALLOW_PRODUCTION_SEED_RESET=true only for an intentional emergency reset.",
    );
  }

  const buyerPasswordHash = await bcrypt.hash("autopiac123", 12);
  const sellerPasswordHash = await bcrypt.hash("Lionessey", 12);

  const seller = await prisma.user.upsert({
    where: { email: "seller@autopiac.test" },
    update: {
      name: "Pentagon Automotive Hungary",
      passwordHash: sellerPasswordHash,
      role: "ADMIN",
    },
    create: {
      email: "seller@autopiac.test",
      name: "Pentagon Automotive Hungary",
      passwordHash: sellerPasswordHash,
      role: "ADMIN",
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@autopiac.test" },
    update: {},
    create: {
      email: "buyer@autopiac.test",
      name: "AutoPiac Demo Vevo",
      passwordHash: buyerPasswordHash,
    },
  });

  if (resetSeedData) {
    await prisma.favorite.deleteMany({});
    await prisma.savedSearch.deleteMany({});
    await prisma.listingPhoto.deleteMany({});
    await prisma.listing.deleteMany({});
  }

  const listings = [
    {
      ...premiumDetails,
      make: "Porsche",
      model: "Panamera",
      trim: "Turbo S E-Hybrid Sport Turismo",
      year: 2025,
      price: 44990000,
      mileage: 6730,
      fuel: "HYBRID" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "WAGON" as const,
      condition: "LIKE_NEW" as const,
      location: "Budapest",
      description:
        "Ujszeru, gazdagon felszerelt plug-in hibrid kombi magyar okmanyokkal, panoramatetovel, teljes asszisztens csomaggal es vezetheto szervizeloelettel.",
    },
    {
      ...starterDetails,
      yearMonth: "2021/5",
      color: "Fehér",
      engineDisplacementCcm: 1798,
      powerKw: 90,
      powerHp: 122,
      driveType: "Elsőkerék",
      gearboxDetail: "Automata e-CVT",
      make: "Toyota",
      model: "Corolla",
      trim: "1.8 Hybrid Comfort",
      year: 2021,
      price: 7390000,
      mileage: 64200,
      fuel: "HYBRID" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "WAGON" as const,
      condition: "WELL_KEPT" as const,
      location: "Budapest XI.",
      description:
        "Magyarorszagi, rendszeresen szervizelt csaladi kombi. Friss muszaki vizsga, ket kulcs, tiszta beltér.",
    },
    {
      ...starterDetails,
      yearMonth: "2019/3",
      color: "Szürke",
      engineDisplacementCcm: 1968,
      powerKw: 110,
      powerHp: 150,
      driveType: "Elsőkerék",
      gearboxDetail: "Manuális (6 fokozatú)",
      make: "Skoda",
      model: "Octavia",
      trim: "2.0 TDI Style",
      year: 2019,
      price: 6290000,
      mileage: 118400,
      fuel: "DIESEL" as const,
      transmission: "MANUAL" as const,
      bodyType: "WAGON" as const,
      condition: "NORMAL" as const,
      location: "Gyor",
      description:
        "Takarékos dízel, nagy csomagtartóval. Céges múlt után átvizsgálva, azonnal elvihető.",
    },
    {
      ...starterDetails,
      yearMonth: "2020/8",
      color: "Kék",
      engineDisplacementCcm: 1498,
      powerKw: 96,
      powerHp: 131,
      driveType: "Elsőkerék",
      gearboxDetail: "Manuális (6 fokozatú)",
      make: "Volkswagen",
      model: "Golf",
      trim: "1.5 TSI Life",
      year: 2020,
      price: 6890000,
      mileage: 73500,
      fuel: "PETROL" as const,
      transmission: "MANUAL" as const,
      bodyType: "HATCHBACK" as const,
      condition: "EXCELLENT" as const,
      location: "Szekesfehervar",
      description:
        "Kulturalt allapot, vezetett szervizkonyv, adaptiv tempomat, LED fenyszoro, frissen cserelt gumik.",
    },
    {
      ...starterDetails,
      yearMonth: "2022/2",
      color: "Fehér",
      batteryCapacityPercent: 96,
      acChargerType: "Type 2",
      fastCharging: true,
      wltpRangeKm: 484,
      powerKw: 150,
      powerHp: 204,
      driveType: "Elsőkerék",
      gearboxDetail: "Automata",
      make: "Hyundai",
      model: "Kona",
      trim: "64 kWh Premium",
      year: 2022,
      price: 10990000,
      mileage: 41200,
      fuel: "ELECTRIC" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "SUV" as const,
      condition: "LIKE_NEW" as const,
      location: "Debrecen",
      description:
        "Nagy akkumulátoros elektromos SUV, otthoni töltővel. Garanciális, hibátlan beltérrel.",
    },
    {
      ...starterDetails,
      yearMonth: "2018/11",
      color: "Piros",
      engineDisplacementCcm: 999,
      powerKw: 92,
      powerHp: 125,
      driveType: "Elsőkerék",
      gearboxDetail: "Manuális (6 fokozatú)",
      make: "Ford",
      model: "Focus",
      trim: "1.0 EcoBoost Titanium",
      year: 2018,
      price: 4380000,
      mileage: 96500,
      fuel: "PETROL" as const,
      transmission: "MANUAL" as const,
      bodyType: "HATCHBACK" as const,
      condition: "WELL_KEPT" as const,
      location: "Pecs",
      description:
        "Jo felszereltseg, parkoloradar, futheto szelvedo. Varosi es orszaguti hasznalatra is praktikus.",
    },
    {
      ...starterDetails,
      yearMonth: "2017/6",
      color: "Fekete",
      engineDisplacementCcm: 2143,
      powerKw: 125,
      powerHp: 170,
      driveType: "Hátsókerék",
      gearboxDetail: "Automata (9 fokozatú)",
      make: "Mercedes-Benz",
      model: "C 220",
      trim: "d Avantgarde",
      year: 2017,
      price: 7990000,
      mileage: 151000,
      fuel: "DIESEL" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "SEDAN" as const,
      condition: "EXCELLENT" as const,
      location: "Budapest III.",
      description:
        "Automata premium szedan, bőr belterrel, navigacioval, vezetett eloelet igazolassal.",
    },
  ];

  const sellerListingCount = await prisma.listing.count({ where: { sellerId: seller.id } });
  const shouldCreateDemoListings = resetSeedData || sellerListingCount === 0;

  if (!shouldCreateDemoListings) {
    console.log(
      `Seed kept ${sellerListingCount} existing seller listing(s). Set RESET_SEED_DATA=true for an intentional local reset.`,
    );
  }

  for (const [index, listing] of shouldCreateDemoListings ? listings.entries() : []) {
    const created = await prisma.listing.create({
      data: {
        ...listing,
        sellerId: seller.id,
        photos: {
          create: {
            path: seedPhoto,
            sortOrder: 0,
          },
        },
      },
    });

    if (index < 2) {
      await prisma.favorite.create({
        data: {
          userId: buyer.id,
          listingId: created.id,
        },
      });
    }
  }

  const savedSearch = await prisma.savedSearch.findFirst({
    where: {
      userId: buyer.id,
      name: "Hibrid kombik 8M alatt",
    },
  });

  if (!savedSearch) {
    await prisma.savedSearch.create({
      data: {
        userId: buyer.id,
        name: "Hibrid kombik 8M alatt",
        query: "fuel=HYBRID&bodyType=WAGON&priceMax=8000000",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
