# Stolpersteine — Netlify Deploy mit Next.js

Probleme und Lösungen beim Aufsetzen des Next.js-Portfolios mit Netlify und GitHub.

---

## 1. Git-Repo im falschen Verzeichnis initialisiert

**Problem:** `git init` wurde im Home-Verzeichnis (`/Users/andrinnyffeler`) statt im Projektordner ausgeführt. VS Code und git zeigten dadurch tausende Systemdateien als untracked "Changes" an.

**Lösung:** Neues `git init` direkt im Projektordner (`Last_Exercise/`) ausführen.

```bash
cd Last_Exercise
git init
```

---

## 2. Netlify findet `package.json` nicht

**Problem:**
```
npm error: Could not read package.json: No such file or directory
```
Netlify sucht `package.json` im Repo-Root, die Next.js-App liegt aber im Unterordner `portfolio-next/`.

**Lösung:** In `netlify.toml` den `base`-Pfad setzen:

```toml
[build]
  base = "portfolio-next"
```

---

## 3. Falsches Publish-Verzeichnis in `netlify.toml`

**Problem:** `publish = "dist"` war gesetzt — das ist für Vite/statische Sites, nicht für Next.js.

**Lösung:** Auf `.next` ändern (relativ zum `base`-Ordner):

```toml
[build]
  publish = ".next"
```

---

## 4. Fehlendes Netlify Next.js Plugin

**Problem:** Ohne `@netlify/plugin-nextjs` kann Netlify eine Next.js-App nicht korrekt deployen (SSR, API Routes, etc. funktionieren nicht).

**Lösung:** Plugin in `netlify.toml` eintragen:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 5. Grosse Videodateien blockieren den GitHub-Push

**Problem:** Videodateien bis 777 MB im Repo — GitHub lehnt Dateien über 100 MB ab und der Push schlägt fehl.

**Lösung:** Grosse Dateien ins `.gitignore` aufnehmen, bevor sie committed werden:

```
physical computing/web/ENDLESS_WISHLIST.mp4   # 777 MB
Digital Making/web/kampf.MOV.mov               # 97 MB
no water no tomorrow/web/NO_WATER-...mp4       # 61 MB
# usw.
```

**Tipp:** Vor dem ersten Commit immer prüfen:
```bash
find . -not -path "*/node_modules/*" -size +10M -type f
```

---

## 6. VS Code zeigt zu viele untracked Files

**Problem:** Schulprojekt-Ordner (`Digital Making/`, `Drohnenaufnahmen/`, etc.) tauchen als untracked Changes auf, obwohl sie nichts mit dem Netlify-Deploy zu tun haben.

**Lösung:** Diese Ordner ins `.gitignore` aufnehmen:

```
Digital Making/
Drohnenaufnahmen/
dynamik/
no water no tomorrow/
physical computing/
reactive-signs/
upcycling/
von 2D zu 3D/
zoom/
```

---

## 7. Netlify findet `package.json` nicht (weil `base` nicht gesetzt ist)

**Problem:**
```
npm error: Could not read package.json: No such file or directory, open '/opt/build/repo/package.json'
```
Netlify sucht `package.json` im Repo-Root (`/opt/build/repo/`), die Next.js-App liegt aber im Unterordner `portfolio-next/`. Ohne den `base`-Eintrag in `netlify.toml` findet der Build-Prozess die Datei nicht.

**Lösung:** `base` in `netlify.toml` korrekt setzen:

```toml
[build]
  base = "portfolio-next"
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Wichtig:** Alle Pfade in `netlify.toml` (z.B. `publish`) sind **relativ zum `base`-Ordner**, nicht zum Repo-Root.

---

## 8. Netlify UI-Feld versehentlich mit `netlify.toml`-Inhalt befüllt

**Problem:** Im Netlify-Dashboard wurde der Inhalt der `netlify.toml` irrtümlich in ein UI-Feld (z.B. "Functions directory") eingefügt. Das führt zu einem kaputten `functionsDirectory`-Pfad wie:

```
functionsDirectory: /opt/build/repo/# netlify.toml [build]   command = "npm run build" ...
```

Der Build schlägt dadurch fehl, auch wenn alle Umgebungsvariablen korrekt gesetzt sind.

**Lösung:** Im Netlify-Dashboard unter **Site Settings → Build & Deploy → Build settings** alle UI-Felder bereinigen:

- **Base directory:** leer lassen (oder korrekter Unterordner, z.B. `portfolio-next`)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** leer lassen

Die Konfiguration gehört in die `netlify.toml` im Repo — nicht ins UI.

**Tipp:** Wenn beide vorhanden sind (UI + `netlify.toml`), hat die `netlify.toml` Vorrang. Am besten alles in der Datei konfigurieren und das UI leer lassen.

---

## 9. `Cannot find module './vendor-chunks/...js'` im Dev-Server

**Problem:** Im Browser/Terminal erscheint plötzlich:
```
Cannot find module './vendor-chunks/next-sanity.js'
Require stack:
- .next/server/webpack-runtime.js
- .next/server/app/work/[slug]/page.js
...
```
Ursache: `npm run dev` und `npm run build` teilen sich **denselben `.next`-Ordner**. Wenn man `npm run build` ausführt, **während der Dev-Server noch läuft**, überschreibt der Build die Vendor-Chunks des Dev-Servers. Der laufende Prozess findet dann seine Module nicht mehr.

**Lösung:** Dev-Server stoppen, `.next` löschen, neu starten:

```bash
# laufende Dev-Server beenden
pkill -f "next dev"
# Cache löschen und neu starten
rm -rf .next && npm run dev
```

**Wichtig:** `npm run dev` und `npm run build` **nicht gleichzeitig** laufen lassen.

---

## 10. CSS `url("fonts/...")` findet Schriften nicht in Next.js

**Problem:** Die aus dem alten Portfolio übernommene CSS enthielt `@font-face`-Deklarationen mit relativen Pfaden:
```css
url("fonts/ITC Century Std Light.otf")
```
Next.js Webpack löst `url()`-Angaben in CSS-Dateien **relativ zur CSS-Datei** auf (nicht zum `public/`-Ordner). Die `.otf`-Dateien lagen aber nicht unter `src/app/fonts/`, sondern im Projektroot unter `fonts/` — der Build schlug deshalb lautlos fehl.

**Lösung:**
1. Schriftdateien in `portfolio-next/public/fonts/` kopieren (damit Next.js sie als statische Assets ausliefert).
2. CSS-Pfade auf root-relative URLs umstellen:
```css
url("/fonts/ITC Century Std Light.otf")
```
Mit führendem `/` sucht der Browser immer relativ zum Domain-Root — unabhängig vom Pfad der CSS-Datei.

---

## 11. Eigener Cursor auf Unterseiten unsichtbar

**Problem:** Das globale CSS setzt `cursor: none !important` auf allen `pointer:fine`-Geräten. Der JavaScript-Code für den Custom-Cursor-Dot lebte aber nur auf der Startseite (`HomeView`). Auf Projekt-Detailseiten (`/work/...`) war dadurch **gar kein Cursor sichtbar**.

**Lösung:** Cursor-Dot-Komponente in das Root-Layout (`layout.tsx`) verschieben, damit sie auf jeder Seite existiert:

```tsx
// layout.tsx
import { CursorDot } from "@/components/CursorDot";

<LanguageProvider>
  {children}
  <CursorDot />   {/* globaler Cursor für alle Seiten */}
</LanguageProvider>
```

Den Cursor-Dot-Code aus `HomeView` und `homeInteractions.ts` entfernen, um Doppelinitialisierung zu vermeiden.

---

## 12. Projektbilder zu gross / falsches Layout auf Detailseiten

**Problem:** Das Projekt-Hero-Cover (`proj-cover`) war als `<img width="100%">` implementiert. Das alte Portfolio verwendet dort einen **16/10-Aspect-Ratio-Container mit `background-image: cover`**. Das Resultat: Bilder wurden unkontrolliert gross und das Layout stimmte nicht.

**Lösung:** `ProjectView.tsx` komplett neu schreiben — Cover als CSS-Background:

```tsx
<div
  className="proj-cover"
  style={{ background: `linear-gradient(...), url(${imgUrl}) center/cover` }}
/>
```

Die alte CSS-Regel `.proj-cover { aspect-ratio: 16/10; }` übernimmt dann die korrekte Darstellung. Ausserdem darf kein Override-CSS-Block das `.proj-cover`-Verhalten nachträglich überschreiben — solche Blöcke aus `globals.css` entfernen.

---

## 13. Studio zeigt neue Schema-Typen nicht (ChunkLoadError)

**Problem:** Nach Schema-Änderungen (neue Block-Typen in `objects.ts`, `index.ts`, `project.ts`) erscheint im Browser beim Öffnen von `localhost:3001/studio` ein roter Fehler:
```
Runtime ChunkLoadError
Loading chunk _app-pages-browser_node_modules_next-sanity_dist__chunks-es_NextStudio_js failed.
```
Ursache: Das eingebettete Sanity Studio ist ein Next.js-Chunk. Der laufende Dev-Server hat die alten Chunks gecacht — nach einer Schema-Änderung muss er neu starten, damit Next.js die neuen Dateien compiliert.

**Lösung:** Dev-Server neu starten:
```bash
# Ctrl+C (laufenden Server stoppen)
npm run dev
```
Danach `localhost:3001/studio` (oder welcher Port auch immer Next.js belegt) neu laden.

---

## 14. `sanity dev` (Port 3333) lädt `.env.local` nicht

**Problem:** `npx sanity dev` startet den Sanity Studio standalone auf Port 3333. Die `sanity.cli.ts` liest Umgebungsvariablen via `process.env.NEXT_PUBLIC_SANITY_*` — diese sind aber nur in `.env.local` definiert, welches **nur Next.js automatisch lädt**. Beim direkten `sanity dev`-Aufruf erscheint deshalb:
```
Uncaught error: Missing environment variable: NEXT_PUBLIC_SANITY_DATASET
```

**Lösung:** Das eingebettete Studio unter `localhost:[PORT]/studio` verwenden statt des standalone Servers. Das Next.js-Dev-Server lädt `.env.local` korrekt. `npx sanity dev` nur einsetzen, wenn die Env-Variablen explizit übergeben werden:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx NEXT_PUBLIC_SANITY_DATASET=production npx sanity dev
```

**Merke:** Immer das Next.js-Studio (`/studio`-Route) bevorzugen — dort stimmen Schema und Env-Variablen immer überein.
