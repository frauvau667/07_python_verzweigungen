/* ==========================================================
   Inhalte der Lernseite „14 Funktionen“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { highlight, pyFloat } = L.util;
  const F = (x) => pyFloat(x);
  const round2 = (x) => L.util.pyRound(x, 2);
  const FN = ['<Funktion>', 'function'];

  /* ==========================================================
     Die vier Arten von Funktionen
     ========================================================== */
  const TYPES = [
    { code:
`def berechne_volumen():
    laenge = 4.5
    breite = 1.2
    hoehe = 2.3
    volumen = laenge * breite * hoehe
    print(volumen)

berechne_volumen()`,
      info: '<b>Ohne Parameter, ohne Rückgabewert:</b> Die Funktion bekommt keine Werte und gibt nichts zurück. Sie rechnet immer mit denselben festen Werten und zeigt das Ergebnis nur mit <code>print()</code> an. Weiterrechnen kann das Programm mit dem Ergebnis nicht.' },
    { code:
`def berechne_durchmesser():
    radius = 25
    durchmesser = 2 * radius
    return durchmesser

ergebnis = berechne_durchmesser()
print(ergebnis)     # 50`,
      info: '<b>Ohne Parameter, mit Rückgabewert:</b> Mit <code>return</code> gibt die Funktion das Ergebnis an den Aufrufer zurück. Dort wird es in einer Variablen gespeichert (<code>ergebnis = …</code>) und kann weiterverwendet werden.' },
    { code:
`def berechne_gesamtkosten(anzahl, preis):
    gesamtkosten = anzahl * preis
    print(gesamtkosten)

berechne_gesamtkosten(3, 17.5)     # 52.5`,
      info: '<b>Mit Parametern, ohne Rückgabewert:</b> Beim Aufruf werden zwei Werte übergeben. Sie werden in der angegebenen <b>Reihenfolge</b> den Parametern zugeordnet: <code>anzahl = 3</code>, <code>preis = 17.5</code>. Dieselbe Funktion kann so mit beliebigen Werten rechnen.' },
    { code:
`def berechne_gesamtpreis(preise, rabatt=0):
    gesamt = sum(preise)
    gesamt = gesamt * (1 - rabatt / 100)
    return round(gesamt, 2)

einkauf = [4.99, 12.50, 3.29]
preis = berechne_gesamtpreis(einkauf, 10)`,
      info: '<b>Mit Parametern, mit Rückgabewert:</b> Die vielseitigste Art. Der erste Parameter ist hier eine Liste, der zweite hat den <b>Standardwert</b> 0: Ruft man <code>berechne_gesamtpreis(einkauf)</code> nur mit einem Argument auf, wird ohne Rabatt gerechnet. Das Ergebnis wird gerundet zurückgegeben.' }
  ];

  function initTypes() {
    const code = document.getElementById('types-code');
    if (!code) return;
    const info = document.getElementById('types-info');
    const btns = document.querySelectorAll('#types [data-t]');
    const show = (i) => {
      btns.forEach((b) => b.classList.toggle('primary', +b.dataset.t === i));
      code.innerHTML = TYPES[i].code.split('\n').map(highlight).join('\n');
      info.innerHTML = '<p>' + TYPES[i].info + '</p>';
    };
    btns.forEach((b) => b.addEventListener('click', () => show(+b.dataset.t)));
    show(0);
  }
  L.onInit(initTypes);

  /* ==========================================================
     Beispiele mit Speicheranzeige (global / lokal)
     ========================================================== */
  L.addExamples({

    volumen: {
      memory: true, scopes: true,
      code:
`def kaffee_kochen():
    tassen = 2
    pulver = tassen * 7
    wasser = tassen * 125
    print(f"{pulver} g Pulver und {wasser} ml Wasser – los geht's!")

kaffee_kochen()
print("Jetzt kann programmiert werden.")`,
      lineNotes: {
        1: '<b>Definition:</b> Python merkt sich nur, dass es eine Funktion <code>kaffee_kochen</code> gibt. Der eingerückte Block wird jetzt <b>noch nicht</b> ausgeführt – es gibt also noch keinen Kaffee.',
        2: '<b>Lokale Variable:</b> <code>tassen</code> wird innerhalb der Funktion angelegt und existiert nur, solange die Funktion läuft.',
        3: '<b>Lokale Variable</b> <code>pulver</code>: 7 g Kaffeepulver pro Tasse.',
        4: '<b>Lokale Variable</b> <code>wasser</code>: 125 ml Wasser pro Tasse.',
        5: '<b>Ausgabe</b> mit einem f-String. Da es keinen Rückgabewert gibt, sieht der Aufrufer das Ergebnis nur auf dem Bildschirm.',
        7: '<b>Aufruf:</b> Erst jetzt springt das Programm in die Funktion und führt ihren Block aus. Danach geht es in der nächsten Zeile weiter.',
        8: '<b>Nach dem Aufruf:</b> Die lokalen Variablen der Funktion sind wieder gelöscht – der Kaffee hoffentlich noch nicht.'
      },
      inputs: [],
      run() {
        return [
          { lines: [1], vars: { kaffee_kochen: FN }, check: 'Funktion definiert – noch nicht ausgeführt' },
          { lines: [7], localName: 'kaffee_kochen()', check: 'Aufruf → Sprung in die Funktion' },
          { lines: [2], local: { tassen: ['2', 'int'] } },
          { lines: [3], local: { pulver: ['14', 'int'] }, check: 'tassen * 7  →  2 * 7  →  14' },
          { lines: [4], local: { wasser: ['250', 'int'] }, check: 'tassen * 125  →  2 * 125  →  250' },
          { lines: [5], print: "14 g Pulver und 250 ml Wasser – los geht's!" },
          { lines: [7], endLocal: true, check: 'Funktion beendet → zurück zum Aufruf, lokale Variablen werden gelöscht' },
          { lines: [8], print: 'Jetzt kann programmiert werden.' }
        ];
      }
    },

    gesamtpreis: {
      memory: true, scopes: true,
      code:
`def berechne_gesamtpreis(preise, rabatt=0):
    gesamt = sum(preise)
    gesamt = gesamt * (1 - rabatt / 100)
    return round(gesamt, 2)

einkauf = [4.99, 12.50, 3.29]
ohne = berechne_gesamtpreis(einkauf)
mit = berechne_gesamtpreis(einkauf, 10)
print(f"Ohne Rabatt: {ohne} €, mit Rabatt: {mit} €")`,
      lineNotes: {
        1: '<b>Definition</b> mit zwei Parametern. <code>rabatt=0</code> ist ein <b>Standardwert</b>: Fehlt das zweite Argument beim Aufruf, ist <code>rabatt</code> 0.',
        2: '<b>sum()</b> addiert alle Preise der Liste.',
        3: '<b>Rabatt abziehen:</b> Bei 10 % Rabatt wird mit 0.9 multipliziert.',
        4: '<b>return</b> gibt das gerundete Ergebnis an den Aufrufer zurück und beendet die Funktion.',
        6: '<b>Globale Liste</b> mit den Einzelpreisen.',
        7: '<b>Aufruf mit einem Argument:</b> <code>preise</code> bekommt die Liste, <code>rabatt</code> den Standardwert 0. Der Rückgabewert wird in <code>ohne</code> gespeichert.',
        8: '<b>Aufruf mit zwei Argumenten:</b> Jetzt ist <code>rabatt</code> 10.',
        9: '<b>Ausgabe</b> beider Ergebnisse.'
      },
      inputs: [],
      run() {
        const e = [4.99, 12.5, 3.29];
        const lst = '[4.99, 12.5, 3.29]';
        const steps = [
          { lines: [1], vars: { berechne_gesamtpreis: FN }, check: 'Funktion definiert – noch nicht ausgeführt' },
          { lines: [6], vars: { einkauf: [lst, 'list'] } }
        ];
        const call = (line, rabatt, target) => {
          const sum = e.reduce((a, b) => a + b, 0);
          const red = sum * (1 - rabatt / 100);
          const r = round2(red);
          steps.push({ lines: [line], localName: 'berechne_gesamtpreis(' + (rabatt ? 'einkauf, 10' : 'einkauf') + ')', check: 'Aufruf → Argumente werden den Parametern zugeordnet' });
          steps.push({ lines: [1], local: { preise: [lst, 'list'], rabatt: [String(rabatt), 'int'] }, check: 'preise = einkauf, rabatt = ' + rabatt + (rabatt ? '' : ' (Standardwert)') });
          steps.push({ lines: [2], local: { gesamt: [F(sum), 'float'] }, check: 'sum(preise)  →  ' + F(sum) });
          steps.push({ lines: [3], local: { gesamt: [F(red), 'float'] }, check: F(sum) + ' * (1 - ' + rabatt + ' / 100)  →  ' + F(red) });
          steps.push({ lines: [4], check: 'return round(' + F(red) + ', 2)  →  Rückgabewert ' + F(r) });
          steps.push({ lines: [line], endLocal: true, vars: { [target]: [F(r), 'float'] }, check: 'Rückgabewert wird in ' + target + ' gespeichert, lokale Variablen werden gelöscht' });
          return r;
        };
        const a = call(7, 0, 'ohne');
        const b = call(8, 10, 'mit');
        steps.push({ lines: [9], print: 'Ohne Rabatt: ' + F(a) + ' €, mit Rabatt: ' + F(b) + ' €' });
        return steps;
      }
    },

    scope: {
      memory: true, scopes: true,
      code:
`song = "Global Song"

def play_music():
    song = "Lokaler Song"
    print(f"Innen: {song}")

def show_song():
    print(f"Gelesen: {song}")

play_music()
show_song()
print(f"Außen: {song}")`,
      lineNotes: {
        1: '<b>Globale Variable:</b> Sie steht außerhalb jeder Funktion.',
        3: '<b>Definition</b> von <code>play_music</code>.',
        4: '<b>Lokale Variable mit gleichem Namen:</b> Sie <b>verdeckt</b> die globale Variable innerhalb der Funktion. Die globale Variable wird dadurch nicht verändert!',
        5: '<b>Ausgabe:</b> Innerhalb der Funktion ist die lokale Variable sichtbar.',
        7: '<b>Definition</b> von <code>show_song</code>.',
        8: '<b>Globale Variable lesen:</b> <code>show_song</code> hat keine eigene Variable <code>song</code>. Deshalb wird die globale Variable gelesen.',
        10: '<b>Aufruf</b> von <code>play_music</code>.',
        11: '<b>Aufruf</b> von <code>show_song</code>.',
        12: '<b>Außerhalb der Funktionen:</b> Die globale Variable hat immer noch ihren ursprünglichen Wert.'
      },
      inputs: [],
      run() {
        return [
          { lines: [1], vars: { song: ["'Global Song'", 'str'] } },
          { lines: [3], vars: { play_music: FN }, check: 'Funktion definiert' },
          { lines: [7], vars: { show_song: FN }, check: 'Funktion definiert' },
          { lines: [10], localName: 'play_music()', check: 'Aufruf von play_music()' },
          { lines: [4], local: { song: ["'Lokaler Song'", 'str'] }, check: 'neue LOKALE Variable song – die globale bleibt unverändert' },
          { lines: [5], print: 'Innen: Lokaler Song' },
          { lines: [10], endLocal: true, check: 'play_music() beendet → lokales song wird gelöscht' },
          { lines: [11], localName: 'show_song()', check: 'Aufruf von show_song()' },
          { lines: [8], print: 'Gelesen: Global Song', check: 'kein lokales song vorhanden → globales song wird gelesen' },
          { lines: [11], endLocal: true, check: 'show_song() beendet' },
          { lines: [12], print: 'Außen: Global Song' }
        ];
      }
    }
  });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Was passiert beim Ausführen dieses Programms?', code: 'def gruesse():\n    print("Hallo")', opts: ['Es wird "Hallo" ausgegeben', 'Es passiert nichts Sichtbares', 'Fehlermeldung', '"Hallo" wird zurückgegeben'], a: 1,
      ex: 'Die Funktion wird nur <b>definiert</b>, aber nie aufgerufen. Dafür fehlt <code>gruesse()</code>.' },
    { q: 'Was gibt das Programm aus?', code: 'def doppelt(x):\n    return x * 2\n\nergebnis = doppelt(4)\nprint(ergebnis + 1)', opts: ['8', '9', '5', 'None'], a: 1,
      ex: '<code>doppelt(4)</code> gibt 8 zurück. 8 + 1 = 9.' },
    { q: 'Welchen Wert hat rabatt beim Aufruf berechne_gesamtpreis(liste)?', code: 'def berechne_gesamtpreis(preise, rabatt=0):\n    ...', opts: ['None', '0', 'Fehlermeldung, weil ein Argument fehlt', 'liste'], a: 1,
      ex: 'Fehlt das Argument, gilt der <b>Standardwert</b> 0.' },
    { q: 'Was gibt das Programm aus?', code: 'def f():\n    return 1\n    print("A")\n\nprint(f())', opts: ['A', '1', '1 und A', 'None'], a: 1,
      ex: '<code>return</code> beendet die Funktion sofort – <code>print("A")</code> wird nie erreicht.' },
    { q: 'Was gibt das Programm aus?', code: 'x = 5\n\ndef aendern():\n    x = 10\n\naendern()\nprint(x)', opts: ['5', '10', 'None', 'NameError'], a: 0,
      ex: 'Das <code>x</code> in der Funktion ist eine neue <b>lokale</b> Variable. Die globale Variable <code>x</code> bleibt 5.' },
    { q: 'Was liefert eine Funktion ohne return?', code: 'def hallo():\n    print("Hi")\n\nwert = hallo()', opts: ['"Hi"', '0', 'None', 'Fehlermeldung'], a: 2,
      ex: 'Ohne <code>return</code> gibt eine Funktion automatisch <code>None</code> zurück. „Hi“ wird nur ausgegeben, nicht zurückgegeben.' },
    { q: 'Was passiert hier?', code: 'def rechne():\n    ergebnis = 42\n\nrechne()\nprint(ergebnis)', opts: ['42', 'None', 'NameError', '0'], a: 2,
      ex: '<code>ergebnis</code> ist lokal und existiert außerhalb der Funktion nicht. Richtig wäre <code>return ergebnis</code> und <code>wert = rechne()</code>.' }
  ]);
})();
