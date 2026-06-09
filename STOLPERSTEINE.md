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
