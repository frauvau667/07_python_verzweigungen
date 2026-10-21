# Verzweigungen in Python – interaktive Lernseite

Interaktive Webseite zum Thema **Verzweigungen (Selektion)** in Python für Einsteiger:
einseitige und zweiseitige Verzweigung, verschachtelte Verzweigung, Mehrfachauswahl mit `match` und mit `elif`.

## Funktionen

- **Klickbare Struktogramme:** Ein Klick auf ein Feld markiert die passenden Codezeilen und zeigt eine Erklärung.
- **Klickbarer Code:** Ein Klick auf eine Codezeile markiert das passende Feld im Struktogramm.
- **Ausprobieren:** Eigene Eingaben machen, das Programm läuft Schritt für Schritt; der durchlaufene Weg wird grün markiert, die Auswertung der Bedingungen erscheint in der Konsole.
- Bedingungs-Tester, `and`/`or`/`not`-Schalter, typische Fehler und ein kurzes Quiz.
- Responsiv (Smartphone, Tablet, PC), heller und dunkler Modus, ohne externe Abhängigkeiten.

## Dateien

```
index.html      Inhalt der Seite (Texte, Abschnitte)
css/style.css   Gestaltung
js/main.js      Struktogramme, Beispiele, Interaktion, Quiz
.nojekyll       sorgt dafür, dass GitHub Pages die Dateien unverändert ausliefert
```

## Veröffentlichen mit GitHub Pages

1. Auf GitHub ein neues Repository anlegen (z. B. `python-verzweigungen`), Sichtbarkeit **Public**.
2. **Add file → Upload files** und alle Dateien und Ordner hochladen (die Ordnerstruktur muss erhalten bleiben: `index.html` liegt direkt im Hauptverzeichnis). Danach **Commit changes**.
3. **Settings → Pages** öffnen. Unter *Build and deployment* bei *Source* **Deploy from a branch** wählen, Branch **main** und Ordner **/ (root)**, dann **Save**.
4. Nach ein bis zwei Minuten ist die Seite erreichbar unter
   `https://<benutzername>.github.io/<repository-name>/`

Hinweis: `.nojekyll` beginnt mit einem Punkt und wird deshalb auf manchen Rechnern ausgeblendet. Die Seite funktioniert auch ohne diese Datei.

Lokal testen: einfach `index.html` im Browser öffnen.

## Beispiele anpassen

Alle interaktiven Beispiele stehen in `js/main.js` im Objekt `EXAMPLES`. Jedes Beispiel hat:

| Eintrag   | Bedeutung |
|-----------|-----------|
| `code`    | der Python-Quelltext (Zeilen werden ab 1 gezählt) |
| `diagram` | das Struktogramm aus Bausteinen `stmt`, `empty`, `if`, `case` |
| `lines`   | bei jedem Baustein: welche Codezeilen dazugehören |
| `info`    | Erklärtext, der beim Anklicken erscheint |
| `inputs`  | Eingabefelder für „Ausprobieren“ |
| `run(v)`  | simuliert das Programm und liefert die Schritte für die Animation |

Im HTML wird ein Beispiel mit `<div class="example" data-example="name"></div>` eingebunden.

Die Programme werden im Browser simuliert, es wird kein echter Python-Interpreter ausgeführt. `match` benötigt in echtem Python mindestens Version 3.10.
