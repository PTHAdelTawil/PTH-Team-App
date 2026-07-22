# PTH Team-Hub — Desktop-App

Diese App verwandelt euer bestehendes Web-Tool in ein eigenständiges Programm mit
eigenem Fenster und Icon (mit Electron, demselben Ansatz, den z.B. Slack, Discord
oder VS Code selbst nutzen). **Alle Team-Funktionen bleiben unverändert** — die App
verbindet sich weiterhin mit eurem Supabase-Server, braucht also weiterhin Internet.

## Was hier drin ist

```
pth-desktop/
├── index.html      ← euer Wiki/Team-Hub, unverändert
├── main.js         ← startet das Fenster, lädt index.html
├── package.json    ← Projekt- und Build-Konfiguration
└── build/
    └── icon.png     ← Platzhalter-Icon (bitte durch euer echtes Logo ersetzen!)
```

## Einmalig einrichten

Node.js muss installiert sein ([nodejs.org](https://nodejs.org), die LTS-Version reicht).

Im `pth-desktop`-Ordner:

```bash
npm install
```

Das lädt Electron herunter (einmalig, ca. 100-200 MB) und ist bereits erfolgreich
getestet worden — die App startet zuverlässig.

## Zum Testen starten (ohne zu installieren)

```bash
npm start
```

Öffnet sofort ein Fenster mit eurem Team-Hub — perfekt zum schnellen Ausprobieren
oder für Entwicklungszwecke.

## Eine echte, installierbare Version bauen

```bash
npm run dist
```

Erstellt im Ordner `release/` eine fertige Installationsdatei:
- **Windows:** eine `.exe`-Installationsdatei (Doppelklick, Installations-Assistent)
- **Mac:** eine `.dmg`-Datei (draufklicken, in den Programme-Ordner ziehen)
- **Linux:** eine `.AppImage` (direkt ausführbar) und eine `.deb`-Paketdatei

**Wichtig:** Ihr müsst dafür jeweils **auf dem Zielsystem selbst bauen** — eine
Windows-`.exe` lässt sich zuverlässig nur auf einem Windows-Rechner bauen, eine
Mac-`.dmg` nur auf einem Mac (Apples eigene Einschränkung, kein Electron-Problem).
Für Linux und Windows lässt sich das mit etwas Zusatzaufwand auch über einen
GitHub-Actions-Workflow automatisieren, falls ihr das später für alle drei
Plattformen auf einmal wollt — sagt Bescheid, dann bauen wir das ein.

## Euer eigenes Logo einsetzen

Aktuell liegt unter `build/icon.png` ein Platzhalter (eure Akzentfarben, "PT"
als Initialen). Für ein sauberes Ergebnis:

1. Euer Logo als quadratisches PNG (mind. 512×512 Pixel) besorgen
2. Für beste Ergebnisse auf allen Plattformen zusätzlich umwandeln in:
   - `build/icon.ico` (Windows) — z.B. über [icoconvert.com](https://icoconvert.com)
   - `build/icon.icns` (Mac) — z.B. über [cloudconvert.com/png-to-icns](https://cloudconvert.com/png-to-icns)
3. Dateien im `build/`-Ordner ersetzen, dann neu bauen (`npm run dist`)

## Auto-Update einrichten (einmalig)

Die App prüft jetzt bei jedem Start automatisch, ob eine neuere Version verfügbar
ist (über GitHub Releases), lädt sie im Hintergrund runter und fragt dann kurz,
ob sie sich neu starten und installieren darf. Dafür einmalig nötig:

1. In `package.json` unter `"build" → "publish"` euren echten GitHub-Benutzernamen
   und Repository-Namen eintragen (aktuell stehen dort Platzhalter):
   ```json
   "publish": {
     "provider": "github",
     "owner": "euer-github-name",
     "repo": "euer-repo-name"
   }
   ```
2. `npm install` einmal neu ausführen (holt den Update-Baustein `electron-updater`)

## Eine neue Version veröffentlichen (ab jetzt bei jedem Update)

1. Versionsnummer in `package.json` hochzählen (z.B. `"version": "1.0.1"`)
2. `npm run dist` wie gewohnt ausführen
3. Im `release`-Ordner liegen jetzt neben der `.exe` auch zwei weitere Dateien:
   `latest.yml` und die `.exe.blockmap` — **alle drei zusammen** als neues
   GitHub Release hochladen (nicht nur die `.exe` allein!), sonst findet die
   Auto-Update-Prüfung die neue Version nicht
4. Fertig — alle, die die App bereits installiert haben, bekommen die neue
   Version automatisch beim nächsten Start angeboten, ganz ohne dass ihr den
   Download-Link erneut verteilen müsst

**Wichtig:** Ohne bezahltes Code-Signing-Zertifikat funktioniert Auto-Update
technisch trotzdem einwandfrei — nur der allererste manuelle Download/Install
zeigt weiterhin die bekannte Windows-Warnung, spätere automatische Updates
laufen im Hintergrund ohne erneute Bestätigung.

## Falls beim Bauen was klemmt

Meistens hilft:
```bash
rm -rf node_modules package-lock.json
npm install
```

Sonst gerne die genaue Fehlermeldung schicken.
