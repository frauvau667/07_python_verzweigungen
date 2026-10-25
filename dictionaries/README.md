# Dictionaries in Python – interaktive Lernseite

Interaktive Webseite zum Infoblatt „12 Dictionaries“ für Einsteiger: Schlüssel-Wert-Paare anlegen, lesen, ändern, löschen, durchlaufen und mit `keys()`, `values()`, `items()` und `get()` verarbeiten.

## Funktionen

- **Dictionary-Labor:** Alle wichtigen Operationen an einem Telefonbuch ausprobieren – inklusive KeyError.
- **Arbeitsspeicher-Ansicht:** Zählen mit einem Dictionary Schritt für Schritt.
- Klickbare Codezeilen mit Erklärungen, Programme Schritt für Schritt ausführen.
- Typische Fehler und ein kurzes Quiz.
- Alle Kapitel sind zunächst zugeklappt und lassen sich einzeln oder alle zusammen öffnen.
- Responsiv (Smartphone, Tablet, PC), heller und dunkler Modus, ohne externe Abhängigkeiten.

## Dateien

```
index.html        Inhalt der Seite (Texte, Abschnitte)
css/style.css     Gestaltung
js/engine.js      Programmkern (Struktogramme, Ausführen, Speicheranzeige, Quiz, Kapitel) – auf allen Lernseiten gleich
js/seite.js       Inhalte dieser Seite: Beispiele, Werkzeuge, Quizfragen
12_Dictionaries_Aufgaben.ipynb   Jupyter-Notebook mit Übungsaufgaben
.nojekyll         sorgt dafür, dass GitHub Pages die Dateien unverändert ausliefert
```

## Veröffentlichen mit GitHub Pages

1. Auf GitHub ein neues Repository anlegen (z. B. `python-dictionaries`), Sichtbarkeit **Public**.
2. **Add file → Upload files** und alle Dateien und Ordner hochladen (die Ordnerstruktur muss erhalten bleiben: `index.html` liegt direkt im Hauptverzeichnis). Danach **Commit changes**.
3. **Settings → Pages** öffnen. Unter *Build and deployment* bei *Source* **Deploy from a branch** wählen, Branch **main** und Ordner **/ (root)**, dann **Save**.
4. Nach ein bis zwei Minuten ist die Seite erreichbar unter
   `https://<benutzername>.github.io/<repository-name>/`

Hinweis: `.nojekyll` beginnt mit einem Punkt und wird deshalb auf manchen Rechnern ausgeblendet. Die Seite funktioniert auch ohne diese Datei.

Lokal testen: einfach `index.html` im Browser öffnen.

## Inhalte anpassen

Alle Beispiele, Werkzeuge und Quizfragen stehen in `js/seite.js`. Ein Beispiel wird im HTML mit `<div class="example" data-example="name"></div>` eingebunden. Wie ein Beispiel aufgebaut ist (Code, Struktogramm, Erklärungen, Eingaben, Programmablauf, Speicheranzeige), ist am Anfang von `js/engine.js` beschrieben.

Die Programme werden im Browser simuliert, es wird kein echter Python-Interpreter ausgeführt.

## Übungsaufgaben (Jupyter-Notebook)

`12_Dictionaries_Aufgaben.ipynb` enthält zu jedem Kapitel kleine Aufgaben mit aufklappbaren Hinweisen. Es lässt sich in Jupyter, JupyterLab, VS Code oder Google Colab öffnen. Liegt es im GitHub-Repository, kann man es in Colab direkt über
`https://colab.research.google.com/github/<benutzername>/<repository-name>/blob/main/12_Dictionaries_Aufgaben.ipynb` öffnen.
