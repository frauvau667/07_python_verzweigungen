/* ==========================================================
   Inhalte der Lernseite „05 Das EVA-Prinzip“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, esc, highlight, pyFloat, pyRound } = L.util;

  const fmt = (x) => (Number.isInteger(x) ? pyFloat(x) : pyFloat(x)); // float-Werte wie in Python

  /* ==========================================================
     Beispiele
     ========================================================== */
  L.addExamples({

    /* ---------- Tankkosten ---------- */
    tanken: {
      minWidth: 0,
      code:
`menge = float(input("Bitte geben Sie die getankte Menge in Litern ein: "))
preis = float(input("Bitte geben Sie den Preis pro Liter ein: "))
kosten = menge * preis
print(f"Die Tankkosten betragen {kosten} €.")`,
      diagram: [
        { t: 'stmt', id: 'e1', tag: 'E', text: 'Eingabe menge', lines: [1],
          info: '<b>Eingabe:</b> <code>input()</code> zeigt den Hinweistext an und wartet auf die Eingabe. <code>float()</code> wandelt den eingegebenen Text in eine Kommazahl um.' },
        { t: 'stmt', id: 'e2', tag: 'E', text: 'Eingabe preis', lines: [2],
          info: '<b>Eingabe:</b> Ein Preis ist eine Kommazahl – deshalb <code>float()</code>.' },
        { t: 'stmt', id: 'v', tag: 'V', text: 'kosten = menge * preis', lines: [3],
          info: '<b>Verarbeitung:</b> Aus den beiden Eingaben wird das Ergebnis berechnet und in der Variablen <code>kosten</code> gespeichert.' },
        { t: 'stmt', id: 'a', tag: 'A', text: 'Ausgabe kosten', lines: [4],
          info: '<b>Ausgabe:</b> Ein f-String setzt den Wert von <code>kosten</code> an der Stelle <code>{kosten}</code> in den Text ein.' }
      ],
      inputs: [
        { name: 'menge', type: 'float', value: '40' },
        { name: 'preis', type: 'float', value: '1.75' }
      ],
      run(v) {
        const k = v.menge * v.preis;
        return [
          { id: 'e1', ask: ['Bitte geben Sie die getankte Menge in Litern ein: ', document.getElementById('f-tanken-menge').value.trim()], vars: { menge: fmt(v.menge) } },
          { id: 'e2', ask: ['Bitte geben Sie den Preis pro Liter ein: ', document.getElementById('f-tanken-preis').value.trim()], vars: { preis: fmt(v.preis) } },
          { id: 'v', check: 'menge * preis  →  ' + fmt(v.menge) + ' * ' + fmt(v.preis) + '  →  ' + fmt(k), vars: { kosten: fmt(k) } },
          { id: 'a', print: 'Die Tankkosten betragen ' + fmt(k) + ' €.' }
        ];
      }
    },

    /* ---------- Rechteck ---------- */
    rechteck: {
      code:
`laenge = float(input("Länge in m: "))
breite = float(input("Breite in m: "))
flaeche = laenge * breite
umfang = 2 * (laenge + breite)
print(f"Fläche: {flaeche} m²")
print(f"Umfang: {umfang} m")`,
      diagram: [
        { t: 'stmt', id: 'e1', tag: 'E', text: 'Eingabe laenge', lines: [1], info: '<b>Eingabe</b> der Länge als Kommazahl.' },
        { t: 'stmt', id: 'e2', tag: 'E', text: 'Eingabe breite', lines: [2], info: '<b>Eingabe</b> der Breite als Kommazahl.' },
        { t: 'stmt', id: 'v1', tag: 'V', text: 'flaeche = laenge * breite', lines: [3], info: '<b>Verarbeitung:</b> Die Fläche wird berechnet.' },
        { t: 'stmt', id: 'v2', tag: 'V', text: 'umfang = 2 * (laenge + breite)', lines: [4], info: '<b>Verarbeitung:</b> Für den Umfang braucht man Klammern – sonst würde wegen „Punkt vor Strich“ falsch gerechnet.' },
        { t: 'stmt', id: 'a1', tag: 'A', text: 'Ausgabe flaeche', lines: [5], info: '<b>Ausgabe</b> mit einem f-String: Der Wert von <code>flaeche</code> wird an der Stelle <code>{flaeche}</code> eingesetzt.' },
        { t: 'stmt', id: 'a2', tag: 'A', text: 'Ausgabe umfang', lines: [6], info: '<b>Ausgabe</b> des Umfangs.' }
      ],
      inputs: [
        { name: 'laenge', type: 'float', value: '4' },
        { name: 'breite', type: 'float', value: '2.5' }
      ],
      run(v) {
        const f = v.laenge * v.breite, u = 2 * (v.laenge + v.breite);
        return [
          { id: 'e1', ask: ['Länge in m: ', document.getElementById('f-rechteck-laenge').value.trim()], vars: { laenge: fmt(v.laenge) } },
          { id: 'e2', ask: ['Breite in m: ', document.getElementById('f-rechteck-breite').value.trim()], vars: { breite: fmt(v.breite) } },
          { id: 'v1', check: 'laenge * breite  →  ' + fmt(v.laenge) + ' * ' + fmt(v.breite) + '  →  ' + fmt(f), vars: { flaeche: fmt(f) } },
          { id: 'v2', check: '2 * (laenge + breite)  →  2 * ' + fmt(v.laenge + v.breite) + '  →  ' + fmt(u), vars: { umfang: fmt(u) } },
          { id: 'a1', print: 'Fläche: ' + fmt(f) + ' m²' },
          { id: 'a2', print: 'Umfang: ' + fmt(u) + ' m' }
        ];
      }
    }
  });

  /* ==========================================================
     EVA-Schaubild mit markiertem Code
     ========================================================== */
  const EVA_CODE = [
    ['menge = float(input())    # Eingabe der Menge', 'E'],
    ['preis = float(input())    # Eingabe des Preises', 'E'],
    ['kosten = menge * preis    # Berechnung der Kosten', 'V'],
    ['print(kosten)             # Ausgabe der Kosten', 'A']
  ];
  const EVA_TEXT = {
    E: '<b>Eingabe:</b> Das Programm holt sich Daten – hier über die Tastatur mit <code>input()</code>. Daten können aber auch aus einer Datei, von einem Sensor oder aus dem Internet kommen.',
    V: '<b>Verarbeitung:</b> Mit den eingegebenen Daten wird etwas gemacht – hier wird gerechnet. Das Ergebnis wird in einer Variablen gespeichert.',
    A: '<b>Ausgabe:</b> Das Ergebnis wird dem Benutzer gezeigt – hier mit <code>print()</code> in der Konsole. Es könnte auch auf einem Display, in einer Datei oder auf einem Drucker landen.'
  };

  function initEva() {
    const code = document.querySelector('#eva-code .code-inner');
    const info = document.getElementById('eva-info');
    if (!code) return;
    const lines = EVA_CODE.map(([t, tag], i) => {
      const ln = el('span', 'ln tag-line-' + tag, '<span class="no">' + (i + 1) + '</span>' + highlight(t));
      ln.dataset.tag = tag;
      code.appendChild(ln);
      return ln;
    });
    const boxes = document.querySelectorAll('#eva-tool .eva-box');
    const choose = (tag) => {
      boxes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tag === tag)));
      lines.forEach((ln) => {
        ln.classList.toggle('dim', !!tag && ln.dataset.tag !== tag);
        ln.classList.toggle('is-sel', ln.dataset.tag === tag);
      });
      info.classList.toggle('is-sel', !!tag);
      info.innerHTML = '<p>' + (tag ? EVA_TEXT[tag] : 'Tippe oben auf einen Teil.') + '</p>';
    };
    let current = null;
    boxes.forEach((b) => b.addEventListener('click', () => {
      current = current === b.dataset.tag ? null : b.dataset.tag;
      choose(current);
    }));
    lines.forEach((ln) => { ln.style.cursor = 'pointer'; ln.addEventListener('click', () => { current = ln.dataset.tag; choose(current); }); });
  }

  /* ==========================================================
     input()-Labor
     ========================================================== */
  const RE_INT = /^\s*[+-]?\d+\s*$/;
  const RE_FLOAT = /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/;
  const badge = (t) => '<span class="mem-type type-' + t + '">' + t + '</span>';

  function initInputLab() {
    const inp = document.getElementById('il-in');
    const fn = document.getElementById('il-fn');
    const out = document.getElementById('il-out');
    if (!inp) return;
    const update = () => {
      const raw = inp.value;
      const f = fn.value;
      const call = f ? f + '(input())' : 'input()';
      let html = 'wert = ' + esc(call) + '<br>Benutzer tippt: <b>' + esc(raw) + '</b><br><br>';
      if (!f) {
        html += 'wert  →  <span class="ok">\'' + esc(raw) + '\'</span> ' + badge('str') +
          '<br>wert + wert  →  <span class="ok">\'' + esc(raw + raw) + '\'</span>' +
          '<p class="tool-note">Ohne Umwandlung ist die Eingabe ein <b>Text</b> – auch wenn nur Ziffern eingegeben wurden. <code>+</code> hängt Texte nur aneinander.</p>';
      } else if (f === 'int') {
        if (RE_INT.test(raw)) {
          const v = parseInt(raw, 10);
          html += 'wert  →  <span class="ok">' + v + '</span> ' + badge('int') + '<br>wert + wert  →  <span class="ok">' + (v + v) + '</span>' +
            '<p class="tool-note">Die Eingabe wurde in eine <b>ganze Zahl</b> umgewandelt – jetzt kann man damit rechnen.</p>';
        } else {
          html += '<span class="bad">ValueError: invalid literal for int() with base 10: \'' + esc(raw) + '\'</span>' +
            '<p class="tool-note">' + (RE_FLOAT.test(raw) ? 'int() akzeptiert keine Kommazahlen. Für Kommazahlen braucht man float().' : 'Die Eingabe ist keine ganze Zahl – das Programm bricht ab.') + '</p>';
        }
      } else {
        if (RE_FLOAT.test(raw)) {
          const v = parseFloat(raw);
          html += 'wert  →  <span class="ok">' + pyFloat(v) + '</span> ' + badge('float') + '<br>wert + wert  →  <span class="ok">' + pyFloat(v + v) + '</span>' +
            '<p class="tool-note">Die Eingabe wurde in eine <b>Kommazahl</b> umgewandelt.' + (RE_INT.test(raw) ? ' Auch eine ganze Zahl wird dabei zur Kommazahl (z. B. 5 → 5.0).' : '') + '</p>';
        } else {
          html += '<span class="bad">ValueError: could not convert string to float: \'' + esc(raw) + '\'</span>' +
            '<p class="tool-note">' + (/,/.test(raw) ? 'Mit Komma klappt es nicht – auch bei der Eingabe braucht Python einen <b>Punkt</b>.' : 'Die Eingabe ist keine Zahl – das Programm bricht ab.') + '</p>';
        }
      }
      out.innerHTML = html;
    };
    inp.addEventListener('input', update);
    fn.addEventListener('change', update);
    document.querySelectorAll('#input-lab [data-in]').forEach((b) => b.addEventListener('click', () => {
      inp.value = b.dataset.in; fn.value = b.dataset.fn; update();
    }));
    update();
  }

  /* ==========================================================
     Ausgabe-Baukasten
     ========================================================== */
  function initOutLab() {
    const inp = document.getElementById('ol-in');
    const out = document.getElementById('ol-out');
    if (!inp) return;
    const update = () => {
      out.innerHTML = '';
      if (!RE_FLOAT.test(inp.value)) {
        out.innerHTML = '<p class="tool-note">Bitte eine Zahl eingeben (Kommazahlen mit Punkt).</p>';
        return;
      }
      const k = parseFloat(inp.value);
      const s = pyFloat(k);
      const variants = [
        ['Mit Kommas', 'print("Die Tankkosten betragen", kosten, "€.")', 'Die Tankkosten betragen ' + s + ' €.', true],
        ['Mit str() und +', 'print("Die Tankkosten betragen " + str(kosten) + " €.")', 'Die Tankkosten betragen ' + s + ' €.', true],
        ['Mit f-String', 'print(f"Die Tankkosten betragen {kosten} €.")', 'Die Tankkosten betragen ' + s + ' €.', true, true],
        ['f-String mit round(kosten, 2)', 'print(f"Die Tankkosten betragen {round(kosten, 2)} €.")', 'Die Tankkosten betragen ' + pyFloat(pyRound(k, 2)) + ' €.', true],
        ['f-String mit :.2f – für Eurobeträge', 'print(f"Die Tankkosten betragen {kosten:.2f} €.")', 'Die Tankkosten betragen ' + pyRound(k, 2).toFixed(2) + ' €.', true, true],
        ['Fehler: str() vergessen', 'print("Die Tankkosten betragen " + kosten + " €.")', 'TypeError: can only concatenate str (not "float") to str', false],
        ['Fehler: f vergessen', 'print("Die Tankkosten betragen {kosten} €.")', 'Die Tankkosten betragen {kosten} €.', false]
      ];
      variants.forEach(([label, code, res, ok, rec]) => {
        const box = el('div', 'variant' + (ok ? '' : ' is-bad'));
        box.appendChild(el('div', 'variant-label', esc(label) + (rec ? '<span class="badge-rec">empfohlen</span>' : '')));
        const pre = el('pre', 'py');
        pre.innerHTML = 'kosten = ' + '<span class="t-num">' + esc(s) + '</span>\n' + highlight(code);
        box.appendChild(pre);
        const o = el('div', 'variant-out' + (ok ? '' : ' bad'));
        o.textContent = res;
        box.appendChild(o);
        out.appendChild(box);
      });
    };
    inp.addEventListener('input', update);
    update();
  }

  L.onInit(() => { initEva(); initInputLab(); initOutLab(); });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Wofür steht EVA?', opts: ['Eingabe – Verarbeitung – Ausgabe', 'Erfassen – Vergleichen – Abspeichern', 'Einlesen – Verzweigen – Abbrechen', 'Eingabe – Variable – Anweisung'], a: 0,
      ex: 'Die meisten Programme lesen etwas ein, verarbeiten es und geben das Ergebnis aus.' },
    { q: 'Zu welchem Teil des EVA-Prinzips gehört diese Zeile?', code: 'flaeche = laenge * breite', opts: ['Eingabe', 'Verarbeitung', 'Ausgabe'], a: 1,
      ex: 'Hier wird gerechnet – das ist die <b>Verarbeitung</b>.' },
    { q: 'Welchen Datentyp liefert input() ohne Umwandlung?', opts: ['int', 'float', 'str', 'Das hängt von der Eingabe ab'], a: 2,
      ex: '<code>input()</code> liefert <b>immer</b> einen Text (<code>str</code>), auch wenn nur Ziffern eingegeben werden.' },
    { q: 'Der Benutzer gibt 4 ein. Was wird ausgegeben?', code: 'zahl = input("Zahl: ")\nprint(zahl + zahl)', opts: ['8', '44', '4 4', 'Fehlermeldung'], a: 1,
      ex: 'Ohne Umwandlung ist <code>zahl</code> der Text <code>"4"</code>. <code>"4" + "4"</code> hängt die Texte aneinander: <code>"44"</code>.' },
    { q: 'Welche Zeile liest einen Preis richtig ein?', opts: ['preis = input("Preis: ")', 'preis = int(input("Preis: "))', 'preis = float(input("Preis: "))', 'preis = str(input("Preis: "))'], a: 2,
      ex: 'Preise sind Kommazahlen – deshalb <code>float()</code>. <code>int()</code> würde bei einer Eingabe wie 1.79 einen Fehler melden.' },
    { q: 'Was gibt diese Zeile aus, wenn kosten den Wert 12.5 hat?', code: 'print(f"Summe: {kosten} €")', opts: ['Summe: {kosten} €', 'Summe: 12.5 €', 'Summe: kosten €', 'Fehlermeldung'], a: 1,
      ex: 'Im f-String wird <code>{kosten}</code> durch den Wert der Variablen ersetzt.' },
    { q: 'Warum gibt diese Zeile einen Fehler?', code: 'print("Summe: " + kosten)', opts: ['Es fehlt ein f', 'Text und Zahl kann man nicht mit + verbinden', 'print braucht zwei Klammern', 'kosten ist ein Schlüsselwort'], a: 1,
      ex: 'Mit <code>+</code> lassen sich nur Texte verbinden. Die Zahl muss mit <code>str(kosten)</code> umgewandelt werden.' }
  ]);
})();
