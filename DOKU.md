# Portfolio – Technische Dokumentation

## Projektübersicht

Das Portfolio basiert auf **Next.js 15** (Frontend) kombiniert mit **Sanity** (CMS). Alle Inhalte – Projekte, Texte, Bilder, Videos – werden in Sanity gespeichert und vom Frontend zur Build-Zeit abgerufen. Das Studio (die CMS-Oberfläche) ist direkt in die Next.js-App eingebettet und läuft unter `/studio`.

---

## Lokales Studio aufrufen

### 1. Dev-Server starten

```bash
cd portfolio-next
npm run dev
```

### 2. Studio öffnen

```
http://localhost:3000/studio
```

Das Studio ist passwortgeschützt über den Sanity-Account. Du loggst dich mit dem Sanity-Konto ein, das mit dem Projekt verbunden ist (`dn3kpg18 / production`).

> Das Studio ist auch live unter deiner Deploy-URL erreichbar: `https://deine-url.vercel.app/studio`

---

## Umgebungsvariablen (.env.local)

Diese Datei muss im Ordner `portfolio-next/` liegen. Sie wird **nicht** ins Git eingecheckt.

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=dn3kpg18
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-05-15
```

| Variable | Bedeutung |
|---|---|
| `SANITY_PROJECT_ID` | Eindeutige ID deines Sanity-Projekts |
| `SANITY_DATASET` | Datensatz – `production` ist der Standard |
| `SANITY_API_VERSION` | Datum, ab dem die Sanity-API-Version fixiert ist |

Für den Deploy (z.B. Vercel) müssen diese Variablen auch dort unter *Environment Variables* eingetragen werden.

---

## Wichtige Packages

### Frontend

| Package | Version | Zweck |
|---|---|---|
| `next` | 15.x | React-Framework, Routing, Build, SSG/SSR |
| `react` / `react-dom` | 19.x | UI-Rendering |
| `next-sanity` | 10.x | Verbindet Next.js mit Sanity (Client, Live-Daten, Studio-Embed) |
| `@sanity/image-url` | 1.x | Baut optimierte Bild-URLs aus Sanity-Asset-Referenzen |

### CMS / Studio

| Package | Version | Zweck |
|---|---|---|
| `sanity` | 4.x | Sanity Studio – die CMS-Oberfläche und Schema-Definition |
| `@sanity/vision` | 4.x | GROQ-Query-Tester direkt im Studio (Dev-Tool) |
| `styled-components` | 6.x | Wird intern von Sanity Studio für das UI benötigt |

### Dev / Build

| Package | Version | Zweck |
|---|---|---|
| `@sanity/client` | 7.x | Direkter API-Client für Sanity (wird im Import-Script verwendet) |
| `typescript` | 5.x | Typsicherheit im ganzen Projekt |
| `dotenv` | 16.x | Lädt `.env`-Dateien für Scripts (z.B. `import-content.mjs`) |

---

## Datenstruktur (Schemas)

Das CMS hat folgende Dokumenttypen, definiert in `src/sanity/schemaTypes/documents/`:

| Schema | Zweck |
|---|---|
| `project` | Ein Portfolio-Projekt mit Medien, Beschreibung, Highlights |
| `siteSettings` | Globale Einstellungen: Name, Bio, Links, Journey |
| `workTopic` | Kategorie/Thema für Projekte (z.B. "Interaction Design") |
| `stackItem` | Tech-Stack-Einträge |
| `post` | Blog-/Textbeiträge |

### Objekt-Typen (wiederverwendbare Blöcke)

| Objekt | Zweck |
|---|---|
| `mediaSector` | Zweispaltig: Text links, Bild-/Video-Grid rechts |
| `mediaGallery` | Bildergalerie mit Karussell |
| `mediaVideo` | Einzelnes Video mit optionalem Autoplay/Loop |
| `mediaEmbed` | Eingebettete externe Seite (iframe, z.B. FlipHTML5) |
| `galleryImage` | Einzelbild mit Fit-Option und "Full width"-Toggle |
| `sectorVideo` | Video innerhalb eines Sektors |
| `highlight` | Titel + Kurztext (z.B. für Projekt-Steckbrief) |

---

## Inhalte bearbeiten

### Projekt editieren

1. Studio öffnen (`/studio`)
2. Links *Projects* wählen
3. Projekt anklicken
4. Tab **Core** → Titel, Cover, Jahr, etc.
5. Tab **Media** → Sektoren und Medien
6. Tab **Details** → Intro-Text, Highlights
7. **Publish** klicken — Änderungen sind sofort live (bei aktivem Revalidate-Cache ca. 1 Minute)

### Neuen Media-Sektor hinzufügen

1. Im **Media**-Tab → **Media blocks** → **Add item** → **Media sector**
2. Felder ausfüllen:
   - **Eyebrow**: kleine Beschriftung (z.B. `SECTOR 01 · BACKPACK`)
   - **Title**: Sektortitel (DE + EN)
   - **Brief**: Kurzbeschrieb (DE + EN)
   - **Media**: Bilder und Videos hinzufügen
3. Erstes Medium wird automatisch auf volle Breite gesetzt; mit **"Full width in sector grid"** kann das pro Element überschrieben werden

---

## CMS vs. Hardcoded – Vorteile

### Vorteile CMS (Sanity)

| | Hardcoded HTML | Mit Sanity CMS |
|---|---|---|
| **Inhalt ändern** | Code editieren, deployen | Studio öffnen, ändern, Publish |
| **Bilder/Videos** | Manuell hochladen, Pfad eintragen | Direkt im Studio hochladen |
| **Mehrsprachigkeit** | Überall im Code duplizieren | Ein Feld mit DE + EN Wert |
| **Reihenfolge ändern** | Code umschreiben | Drag & Drop im Studio |
| **Neue Projekte** | Neues HTML-File, CSS anpassen | Neues Dokument im Studio |
| **Struktur** | Verteilt über viele Dateien | Alles an einem Ort |

### Spezifische Vorteile für dieses Portfolio

- **Kein Redeploy nötig** für Textänderungen, neue Bilder oder Projektreihenfolge
- **Strukturierte Medien** – Bilder werden von Sanity automatisch optimiert und als WebP ausgeliefert
- **Lokalisierung** – jedes Textfeld hat DE/EN-Werte, die Sprache wird per URL-Slug gewählt
- **Portable Content** – die Daten sind API-fähig und können theoretisch für andere Ausgabekanäle genutzt werden (z.B. App)

---

## Build & Deploy

### Lokal bauen und testen

```bash
npm run build
npm run start
```

### Deploy auf Vercel

1. Push auf `main`-Branch
2. Vercel triggert automatisch einen neuen Build
3. Umgebungsvariablen müssen in Vercel unter *Settings → Environment Variables* eingetragen sein

### Build-Verhalten

- Projektseiten (`/work/[slug]`) werden zur Build-Zeit statisch generiert (SSG)
- Revalidate-Cache: 60 Sekunden – Änderungen im Studio erscheinen spätestens nach 1 Minute
- Das Studio selbst (`/studio`) wird client-seitig gerendert

---

## Nützliche Scripts

```bash
npm run dev          # Dev-Server starten
npm run build        # Produktions-Build
npm run typegen      # TypeScript-Typen aus Sanity-Schema generieren
npm run import       # Legacy-Inhalte importieren (scripts/import-content.mjs)
```

---

## Projektstruktur (vereinfacht)

```
portfolio-next/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Startseite
│   │   ├── work/[slug]/          # Projektdetailseite
│   │   ├── studio/[[...tool]]/   # Sanity Studio (eingebettet)
│   │   └── [slug]/               # Dynamische Seiten (About, etc.)
│   ├── components/               # UI-Komponenten
│   │   └── MediaBlocks.tsx       # Rendert alle Media-Block-Typen
│   ├── lib/
│   │   ├── types.ts              # TypeScript-Typen
│   │   └── queries.ts            # GROQ-Queries für Sanity
│   └── sanity/
│       ├── schemaTypes/          # Schema-Definitionen (Datenstruktur)
│       └── structure.ts          # Studio-Navigationsstruktur
├── sanity.config.ts              # Sanity-Konfiguration
├── .env.local                    # Umgebungsvariablen (nicht im Git)
└── package.json
```
