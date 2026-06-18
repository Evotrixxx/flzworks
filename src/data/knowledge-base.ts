import { ReactNode } from "react";

export type NodeConnection = {
  nodeId: string;
  label: string; // The branch label, e.g., "Igen", "Nem", "Tovább"
};

export type KnowledgeNode = {
  id: string;
  title: string;
  content: string | ReactNode;
  keywords: string[];
  media?: string;
  children: NodeConnection[];
};

export const knowledgeBaseData: KnowledgeNode[] = [
  {
    id: "start",
    title: "Ügyfélszolgálati Indító",
    content: "Üdvözlöm a Kocsi.hu ügyfélszolgálatánál! Miben segíthetek ma Önnek?",
    keywords: ["kezdőlap", "ügyfélszolgálat", "segítség", "indítás", "főmenü"],
    children: [
      { nodeId: "hirdetes_feladas", label: "Hirdetést szeretnék feladni" },
      { nodeId: "kereses", label: "Autót keresek" },
      { nodeId: "hiba", label: "Technikai hibát tapasztaltam" },
    ],
  },
  {
    id: "hirdetes_feladas",
    title: "Hirdetés Feladása",
    content: "A hirdetés feladásához először be kell jelentkezni. Ön regisztrált már az oldalon?",
    keywords: ["hirdetés", "feladás", "eladás", "autó eladása", "új hirdetés"],
    children: [
      { nodeId: "bejelentkezes", label: "Igen, regisztráltam" },
      { nodeId: "regisztracio", label: "Nem, még nem" },
    ],
  },
  {
    id: "regisztracio",
    title: "Regisztráció folyamata",
    content: "Kérem, kattintson a jobb felső sarokban található 'Regisztráció' gombra. Adja meg az email címét, majd kövesse az emailben kapott megerősítő linket.",
    keywords: ["regisztráció", "fiók", "létrehozás", "új fiók", "nem tudok belépni", "email"],
    children: [
      { nodeId: "bejelentkezes", label: "Sikeresen regisztráltam" },
    ],
  },
  {
    id: "bejelentkezes",
    title: "Bejelentkezés",
    content: "Kattintson a 'Bejelentkezés' gombra, adja meg az email címét és jelszavát. Ha elfelejtette a jelszavát, kattintson az 'Elfelejtett jelszó' hivatkozásra.",
    keywords: ["bejelentkezés", "belépés", "jelszó", "elfelejtett jelszó", "fiók", "login"],
    children: [
      { nodeId: "uj_hirdetes_urlap", label: "Beléptem, feladom a hirdetést" },
    ],
  },
  {
    id: "uj_hirdetes_urlap",
    title: "Új hirdetés űrlap kitöltése",
    content: "A hirdetés űrlapon adja meg a jármű márkáját, modelljét, évjáratát és árát. Minél több részletet ad meg (pl. felszereltség), annál vonzóbb lesz a hirdetés.",
    keywords: ["űrlap", "márka", "modell", "évjárat", "ár", "felszereltség"],
    children: [
      { nodeId: "kepek_feltoltese", label: "Tovább a képekhez" },
    ],
  },
  {
    id: "kepek_feltoltese",
    title: "Képek feltöltése",
    content: "Töltsön fel legalább 3 darab jó minőségű képet az autóról (kívülről, belülről, műszerfalról). Maximum 15 kép engedélyezett.",
    keywords: ["kép", "fotó", "feltöltés", "galéria", "képfeltöltés", "minőség"],
    children: [
      { nodeId: "hirdetes_vegesitese", label: "Képek feltöltve" },
    ],
  },
  {
    id: "hirdetes_vegesitese",
    title: "Hirdetés véglegesítése és publikálás",
    content: "Ellenőrizze az adatokat, majd kattintson a 'Publikálás' gombra. A hirdetés azonnal élesedik az oldalon.",
    keywords: ["publikálás", "véglegesítés", "élesítés", "kész", "mentés"],
    children: [],
  },
  {
    id: "kereses",
    title: "Autó Keresése",
    content: "Az oldalon részletes szűrőkkel kereshet. Milyen típusú jármű érdekli?",
    keywords: ["keresés", "szűrő", "találat", "böngészés", "vásárlás"],
    children: [
      { nodeId: "szurok_hasznalata", label: "Hogyan működik a részletes szűrő?" },
      { nodeId: "elado_kapcsolat", label: "Megvan az autó, hogyan hívjam az eladót?" },
    ],
  },
  {
    id: "szurok_hasznalata",
    title: "Szűrők használata",
    content: "A bal oldali sávban kiválaszthatja a márkát, modellt, ársávot és az évjáratot. A találati lista automatikusan frissül.",
    keywords: ["szűrő", "márka", "ár", "évjárat", "finomítás", "bal sáv"],
    children: [],
  },
  {
    id: "elado_kapcsolat",
    title: "Kapcsolatfelvétel az eladóval",
    content: "A hirdetés oldalán kattintson a 'Telefonszám mutatása' gombra, vagy küldjön üzenetet az űrlapon keresztül közvetlenül az eladónak.",
    keywords: ["kapcsolat", "telefon", "üzenet", "eladó", "hívás", "érdeklődés"],
    children: [],
  },
  {
    id: "hiba",
    title: "Technikai Hiba Bejelentése",
    content: "Sajnáljuk a kellemetlenséget! Milyen jellegű hibát tapasztalt?",
    keywords: ["hiba", "bug", "nem működik", "technikai", "probléma"],
    children: [
      { nodeId: "kep_hiba", label: "Nem tudok képet feltölteni" },
      { nodeId: "egyeb_hiba", label: "Egyéb hiba az oldalon" },
    ],
  },
  {
    id: "kep_hiba",
    title: "Képfeltöltési Hiba",
    content: "Kérjük, ellenőrizze, hogy a kép mérete nem haladja meg a 10MB-ot, és a formátuma JPG vagy PNG. Ha a probléma továbbra is fennáll, próbáljon meg másik böngészőt használni.",
    keywords: ["kép", "feltöltés", "hiba", "10MB", "méret", "formátum", "nem töltődik"],
    children: [],
  },
  {
    id: "egyeb_hiba",
    title: "Általános Hibajelentés Továbbítása",
    content: "Kérjük, rögzítse az ügyfél pontos problémáját, a használt böngészőt és az eszköz típusát (Mobil/PC), majd továbbítsa a jegyet a fejlesztői csapatnak.",
    keywords: ["jegy", "ticket", "fejlesztő", "továbbítás", "eszköz", "böngésző"],
    children: [],
  },
];
