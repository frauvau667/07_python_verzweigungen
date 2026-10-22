# Python-Lernseiten

Interaktive Lernseiten zu den Infoblättern mit klickbaren Struktogrammen, Schritt-für-Schritt-Ausführung, Quiz und je einem Jupyter-Notebook mit Übungsaufgaben.

Alle Themen liegen in diesem Repository, **veröffentlicht werden aber nur die Ordner, die in `freigabe.txt` stehen.** Nicht freigegebene Seiten liefern „Seite nicht gefunden“ (404). Ein Zurück-Link oder eine Übersichtsseite gibt es bewusst nicht – die Links werden einzeln weitergegeben.

## Aufbau

```
freigabe.txt                     Liste der freigegebenen Themen
.github/workflows/freigabe.yml   veröffentlicht automatisch nur diese Themen
variablen/                       03 Variablen und Datentypen
operatoren/                      04 Operatoren
eva/                             05 EVA-Prinzip
verzweigungen/                   07 Verzweigungen
schleifen/                       09 Schleifen
listen/                          10 Eindimensionale Listen
mehrdimensionale_listen/         11 Mehrdimensionale Listen
dictionaries/                    12 Dictionaries
bibliotheken/                    13 Bibliotheken
funktionen/                      14 Funktionen
textdateien/                     15 Textdateien
strings/                         16 Strings
```

Jeder Themenordner enthält `index.html` (die Seite), `css/`, `js/` und das Notebook `NN_Thema_Aufgaben.ipynb`.

## Einmalig einrichten

1. Auf GitHub ein neues Repository anlegen, z. B. `python-lernseiten`, Sichtbarkeit **Public**.
2. **Settings → Pages**: Unter *Build and deployment* bei *Source* **GitHub Actions** auswählen.
3. **Add file → Upload files**: alle Ordner und Dateien aus dem ZIP hineinziehen und **Commit changes**.
4. Die Workflow-Datei anlegen. Ordner, die mit einem Punkt beginnen (`.github`), werden beim Hochladen oft nicht mitgenommen, weil der Rechner sie versteckt. Deshalb sicherheitshalber so:
   **Add file → Create new file**, als Dateiname `.github/workflows/freigabe.yml` eintippen (die Schrägstriche legen die Ordner an), den Inhalt unten hineinkopieren, **Commit changes**.
   (Falls die Datei beim Hochladen doch mitgekommen ist, sieht man das im Repository am Ordner `.github` – dann entfällt dieser Schritt.)
5. Unter dem Reiter **Actions** läuft jetzt „Freigegebene Seiten veröffentlichen“. Wenn er grün ist (ca. 1 Minute), sind die Seiten online.

## Adressen

```
https://<benutzername>.github.io/<repository>/<ordner>/
```
Beispiel: `https://maxmuster.github.io/python-lernseiten/schleifen/`

Die Hauptadresse ohne Ordner zeigt absichtlich nichts an.

## Ein Thema freigeben oder sperren

1. Im Repository auf `freigabe.txt` klicken, dann auf den Stift (Bearbeiten).
2. Ordnernamen in eine neue Zeile schreiben (freigeben) oder die Zeile löschen bzw. ein `#` davorsetzen (sperren).
3. **Commit changes**. Nach ein bis zwei Minuten ist die Änderung online.

Zum Freigeben bitte den Ordnernamen genau so schreiben, wie er im Repository heißt (klein, mit Unterstrich, z. B. `mehrdimensionale_listen`).

**Wichtig zu wissen:** Die Sperre betrifft die Webseiten. Weil das Repository öffentlich ist, könnte jemand, der es auf github.com findet, dort den Quelltext aller Themen ansehen. Für den Unterricht reicht das in aller Regel; eine echte Passwortsperre bietet GitHub Pages nicht.

## Notebooks weitergeben

- **Download** (nur freigegebene Themen):
  `https://<benutzername>.github.io/<repository>/listen/10_Listen_Aufgaben.ipynb`
- **Direkt in Google Colab öffnen:**
  `https://colab.research.google.com/github/<benutzername>/<repository>/blob/main/listen/10_Listen_Aufgaben.ipynb`

Die Lernenden speichern in Colab mit **Datei → Kopie in Drive speichern** ihre eigene Version.

## Inhalt der Workflow-Datei `.github/workflows/freigabe.yml`

```yaml
# Veröffentlicht nur die Ordner, die in freigabe.txt stehen.
# Läuft automatisch bei jeder Änderung im Repository.
name: Freigegebene Seiten veröffentlichen

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - name: Freigegebene Ordner zusammenstellen
        run: |
          mkdir _site
          touch _site/.nojekyll
          while IFS= read -r line || [ -n "$line" ]; do
            name="$(printf '%s' "$line" | sed 's/#.*//' | tr -d '[:space:]')"
            [ -z "$name" ] && continue
            case "$name" in
              *[!a-z0-9_-]*) echo "::warning::Ungültiger Eintrag '$name' wird ignoriert"; continue ;;
            esac
            if [ -d "$name" ]; then
              cp -r "$name" "_site/$name"
              echo "freigegeben: $name"
            else
              echo "::warning::Ordner '$name' gibt es nicht"
            fi
          done < freigabe.txt

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

      - id: deployment
        uses: actions/deploy-pages@v4
```

## Lokal ansehen

Einfach `index.html` in einem Themenordner im Browser öffnen – es wird keine Internetverbindung und keine Installation benötigt.

## Inhalte anpassen

Beispiele, Werkzeuge und Quizfragen stehen in `js/seite.js` (bei Verzweigungen und Schleifen in `js/main.js`). Wie ein Beispiel aufgebaut ist, steht am Anfang von `js/engine.js`. Die „Nice to know“-Kästen stehen direkt in `index.html`:
`<aside class="ntk" data-title="Überschrift"> … </aside>`
