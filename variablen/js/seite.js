/* ==========================================================
   Inhalte der Lernseite „03 Variablen und Datentypen“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, esc, pyFloat } = L.util;

  /* ==========================================================
     Beispiele
     ========================================================== */
  L.addExamples({

    /* ---------- 1 Variablen im Speicher ---------- */
    speicher: {
      memory: true,
      code:
`name = "Mia"
alter = 16
alter = alter + 1
groesse = 1.68
volljaehrig = False
print(f"{name} ist jetzt {alter} Jahre alt.")`,
      lineNotes: {
        1: '<b>Zuweisung:</b> Im Arbeitsspeicher wird ein Kästchen mit dem Namen <code>name</code> angelegt. Hinein kommt der Text <code>"Mia"</code>. Wegen der Anführungszeichen erkennt Python den Datentyp <b>str</b> (Text).',
        2: '<b>Zuweisung:</b> <code>alter</code> bekommt die ganze Zahl 16. Python erkennt den Datentyp <b>int</b> – ohne dass man ihn angeben muss.',
        3: '<b>Neuer Wert:</b> Zuerst wird rechts gerechnet: alter + 1 = 16 + 1 = 17. Dann wird das Ergebnis in <code>alter</code> gespeichert. Der alte Wert 16 ist danach <b>überschrieben</b>.',
        4: '<b>Kommazahl:</b> 1.68 hat einen Punkt, also erkennt Python den Datentyp <b>float</b>. Der Name lautet <code>groesse</code> statt <code>größe</code> – Umlaute vermeidet man.',
        5: '<b>Wahrheitswert:</b> <code>False</code> (großes F!) ist ein Wert vom Datentyp <b>bool</b>. Es gibt nur die beiden Werte <code>True</code> und <code>False</code>.',
        6: '<b>Ausgabe mit f-String:</b> Das <code>f</code> vor dem Text sorgt dafür, dass in den geschweiften Klammern die aktuellen Werte von <code>name</code> und <code>alter</code> aus dem Speicher eingesetzt werden.'
      },
      inputs: [],
      run() {
        return [
          { lines: [1], vars: { name: ["'Mia'", 'str'] }, check: 'Neue Variable name = "Mia"' },
          { lines: [2], vars: { alter: ['16', 'int'] }, check: 'Neue Variable alter = 16' },
          { lines: [3], vars: { alter: ['17', 'int'] }, check: 'alter + 1  →  16 + 1  →  17  →  in alter speichern (16 wird überschrieben)' },
          { lines: [4], vars: { groesse: ['1.68', 'float'] }, check: 'Neue Variable groesse = 1.68' },
          { lines: [5], vars: { volljaehrig: ['False', 'bool'] }, check: 'Neue Variable volljaehrig = False' },
          { lines: [6], print: 'Mia ist jetzt 17 Jahre alt.' }
        ];
      }
    },

    /* ---------- 3 Beispiele mit allen Datentypen ---------- */
    alle_typen: {
      memory: true,
      code:
`x = 3
anzahl_monate = 12
y = 3.0
preis = 12.34
z = 3+4j
b = False
b = bool(1)
s = 'abc'
s2 = "abc"

# Ausgabe von Variablen:
print(s)
print(b)
print(preis)`,
      lineNotes: {
        1: '<b>int:</b> Eine ganze Zahl ohne Punkt.',
        2: '<b>int:</b> Ein aussagekräftiger Name mit Unterstrich: <code>anzahl_monate</code>.',
        3: '<b>float:</b> Obwohl 3.0 denselben Zahlenwert wie 3 hat, ist es wegen des Punktes eine Kommazahl.',
        4: '<b>float:</b> Kommazahlen schreibt man mit Punkt.',
        5: '<b>complex:</b> Eine komplexe Zahl mit Realteil 3 und Imaginärteil 4. Das <code>j</code> steht für die imaginäre Einheit (in der Mathematik meist <i>i</i>).',
        6: '<b>bool:</b> Der Wahrheitswert <code>False</code>.',
        7: '<b>Umwandlung mit bool():</b> <code>bool(1)</code> wandelt die Zahl 1 in einen Wahrheitswert um und ergibt <code>True</code> (nur 0 ergibt False). Der alte Wert von <code>b</code> wird überschrieben.',
        8: '<b>str:</b> Ein Text in einfachen Anführungszeichen.',
        9: '<b>str:</b> Derselbe Text in doppelten Anführungszeichen – das macht keinen Unterschied.',
        11: '<b>Kommentar:</b> Alles hinter <code>#</code> ignoriert Python. Kommentare erklären den Code für Menschen.',
        12: '<b>Ausgabe:</b> Gibt den Inhalt von <code>s</code> aus – ohne Anführungszeichen.',
        13: '<b>Ausgabe:</b> Gibt den aktuellen Wert von <code>b</code> aus. Das ist inzwischen <code>True</code>!',
        14: '<b>Ausgabe:</b> Gibt den Inhalt von <code>preis</code> aus.'
      },
      inputs: [],
      run() {
        return [
          { lines: [1], vars: { x: ['3', 'int'] } },
          { lines: [2], vars: { anzahl_monate: ['12', 'int'] } },
          { lines: [3], vars: { y: ['3.0', 'float'] } },
          { lines: [4], vars: { preis: ['12.34', 'float'] } },
          { lines: [5], vars: { z: ['(3+4j)', 'complex'] } },
          { lines: [6], vars: { b: ['False', 'bool'] } },
          { lines: [7], vars: { b: ['True', 'bool'] }, check: 'bool(1)  →  True  →  b wird überschrieben' },
          { lines: [8], vars: { s: ["'abc'", 'str'] } },
          { lines: [9], vars: { s2: ["'abc'", 'str'] } },
          { lines: [12], print: 'abc' },
          { lines: [13], print: 'True' },
          { lines: [14], print: '12.34' }
        ];
      }
    }
  });

  /* ==========================================================
     Werte so lesen, wie Python sie im Code verstehen würde
     ========================================================== */
  const KEYWORDS = ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
    'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
    'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];

  const RE_INT = /^[+-]?\d+$/;
  const RE_FLOAT = /^[+-]?(\d+\.\d*|\.\d+|\d+(\.\d*)?[eE][+-]?\d+)$/;
  const RE_COMPLEX = /^([+-]?\d+(\.\d+)?)?\s*([+-])?\s*(\d+(\.\d+)?)?j$/;

  function fmtComplex(re, im) {
    const imS = (Number.isInteger(im) ? String(Math.abs(im)) : String(Math.abs(im))) + 'j';
    if (re === 0) return (im < 0 ? '-' : '') + imS;
    const reS = Number.isInteger(re) ? String(re) : String(re);
    return '(' + reS + (im < 0 ? '-' : '+') + imS + ')';
  }

  // Liefert { type, value, repr } oder { error, hint }
  function parseLiteral(raw) {
    const s = raw.trim();
    if (!s) return { error: 'Leere Eingabe', hint: 'Gib einen Wert ein.' };
    if (RE_INT.test(s)) { const v = parseInt(s, 10); return { type: 'int', value: v, repr: String(v) }; }
    if (RE_FLOAT.test(s)) { const v = parseFloat(s); return { type: 'float', value: v, repr: pyFloat(v) }; }
    const c = s.replace(/\s+/g, '').match(RE_COMPLEX);
    if (c && (c[1] || c[4] || s === 'j')) {
      if (s === 'j') return { error: "NameError: name 'j' is not defined", hint: 'Für die imaginäre Einheit schreibt man 1j.' };
      let re = 0, im;
      if (c[3]) { re = c[1] ? parseFloat(c[1]) : 0; im = parseFloat(c[4] || '1') * (c[3] === '-' ? -1 : 1); }
      else { im = parseFloat(c[1] || c[4]); }
      return { type: 'complex', value: { re, im }, repr: fmtComplex(re, im) };
    }
    if (s === 'True' || s === 'False') return { type: 'bool', value: s === 'True', repr: s };
    if (s === 'true' || s === 'false') {
      return { error: "NameError: name '" + s + "' is not defined", hint: 'Wahrheitswerte schreibt man mit großem Anfangsbuchstaben: True und False.' };
    }
    const qm = s.match(/^(['"])(.*)\1$/);
    if (qm) return { type: 'str', value: qm[2], repr: "'" + qm[2] + "'" };
    if (/^['"]/.test(s) || /['"]$/.test(s)) {
      return { error: 'SyntaxError: unterminated string literal', hint: 'Ein Text braucht am Anfang und am Ende das gleiche Anführungszeichen.' };
    }
    if (/^[+-]?\d+(\.\d+)?\s*,\s*\d+/.test(s)) {
      return { tuple: true, hint: 'Python liest das Komma als Trennzeichen zwischen <b>zwei</b> Werten und speichert (' + esc(s.split(',').map((x) => x.trim()).join(', ')) + ') – ein sogenanntes Tupel (Datentyp <code>tuple</code>). Für eine Kommazahl musst du einen <b>Punkt</b> verwenden: <code>' + esc(s.replace(',', '.').replace(/\s/g, '')) + '</code>.' };
    }
    if (/^[A-Za-z_äöüÄÖÜß][\wäöüÄÖÜß]*$/.test(s)) {
      return { error: "NameError: name '" + s + "' is not defined", hint: 'Ohne Anführungszeichen hält Python <code>' + esc(s) + '</code> für einen <b>Variablennamen</b>. Soll es ein Text sein, schreibe <code>"' + esc(s) + '"</code>.' };
    }
    return { error: 'SyntaxError: invalid syntax', hint: 'Diesen Wert versteht Python so nicht.' };
  }

  const TYPE_INFO = {
    int: 'eine <b>ganze Zahl</b>',
    float: 'eine <b>Kommazahl</b> (Gleitkommazahl)',
    complex: 'eine <b>komplexe Zahl</b>',
    bool: 'ein <b>Wahrheitswert</b>',
    str: 'eine <b>Zeichenkette</b> (Text) – auch wenn Ziffern darin stehen'
  };

  function badge(t) { return '<span class="mem-type type-' + t + '">' + t + '</span>'; }

  /* ==========================================================
     Namens-Prüfer
     ========================================================== */
  function initNameCheck() {
    const inp = document.getElementById('nc-in');
    const out = document.getElementById('nc-out');
    if (!inp) return;
    const update = () => {
      const n = inp.value;
      const errs = [], warns = [], oks = [];
      if (!n.length) { out.innerHTML = 'Gib einen Namen ein.'; return; }
      if (/^\d/.test(n)) errs.push('Beginnt mit einer Zahl – das ist nicht erlaubt.');
      if (/\s/.test(n)) errs.push('Enthält ein Leerzeichen – Python würde zwei getrennte Wörter sehen.');
      if (/-/.test(n)) errs.push('Enthält einen Bindestrich – Python liest ihn als Minus-Zeichen.');
      const bad = n.replace(/[\w\säöüÄÖÜß-]/g, '');
      if (bad) errs.push('Enthält Sonderzeichen: ' + esc(Array.from(new Set(bad)).join(' ')));
      if (KEYWORDS.includes(n)) errs.push('<code>' + esc(n) + '</code> ist ein Schlüsselwort von Python und als Name verboten.');
      if (!errs.length) {
        if (/^_/.test(n)) warns.push('Beginnt mit <code>_</code> – das ist für Python-interne Daten vorgesehen.');
        if (/^[A-ZÄÖÜ]/.test(n)) warns.push('Beginnt mit einem Großbuchstaben – Variablen beginnen laut Konvention klein.');
        if (/[äöüÄÖÜß]/.test(n)) warns.push('Enthält Umlaute oder ß – das funktioniert, ist aber unüblich (besser ae, oe, ue, ss).');
        if (/^[a-z]+\d+$/i.test(n) && n.length < 8) warns.push('Ist der Name aussagekräftig? Namen wie <code>zahl23</code> verraten nicht, was gespeichert wird.');
        if (n.length === 1) warns.push('Einbuchstabige Namen sind nur für kurze Rechnungen oder Zähler (z. B. <code>i</code>) üblich.');
        if (KEYWORDS.map((k) => k.toLowerCase()).includes(n.toLowerCase()) && !KEYWORDS.includes(n)) warns.push('Sieht aus wie das Schlüsselwort <code>' + KEYWORDS.find((k) => k.toLowerCase() === n.toLowerCase()) + '</code> – erlaubt, weil Groß-/Kleinschreibung unterschieden wird, aber verwirrend.');
        if (/[a-z]_[a-z]/.test(n) || /[a-z][A-Z]/.test(n)) oks.push('Wörter sind gut lesbar getrennt.');
        oks.push('Nach den Regeln von Python ist der Name gültig.');
      }
      let head;
      if (errs.length) head = '<span class="verdict bad">✗ Ungültig</span> Python meldet einen <code>SyntaxError</code>.';
      else if (warns.length) head = '<span class="verdict warn">! Gültig, aber nicht gut</span>';
      else head = '<span class="verdict ok">✓ Guter Name</span>';
      const li = (arr, cls) => arr.map((t) => '<li class="' + cls + '">' + t + '</li>').join('');
      out.innerHTML = head + '<ul class="check-list">' + li(errs, 'bad') + li(warns, 'warn') + (errs.length ? '' : li(oks, 'ok')) + '</ul>';
    };
    inp.addEventListener('input', update);
    document.querySelectorAll('#name-check [data-name]').forEach((b) => b.addEventListener('click', () => { inp.value = b.dataset.name; update(); }));
    update();
  }

  /* ==========================================================
     Typ-Detektor
     ========================================================== */
  function initTypeCheck() {
    const inp = document.getElementById('tc-in');
    const out = document.getElementById('tc-out');
    if (!inp) return;
    const update = () => {
      const r = parseLiteral(inp.value);
      if (r.tuple) {
        out.innerHTML = '<span class="verdict warn">Keine Kommazahl!</span><p class="tool-note">' + r.hint + '</p>';
      } else if (r.error) {
        out.innerHTML = '<span class="bad">' + esc(r.error) + '</span><p class="tool-note">' + r.hint + '</p>';
      } else {
        out.innerHTML = 'type(' + esc(inp.value.trim()) + ')  →  <span class="ok">&lt;class \'' + r.type + '\'&gt;</span> ' + badge(r.type) +
          '<p class="tool-note">Das ist ' + TYPE_INFO[r.type] + '.</p>';
      }
    };
    inp.addEventListener('input', update);
    document.querySelectorAll('#type-check [data-val]').forEach((b) => b.addEventListener('click', () => { inp.value = b.dataset.val; update(); }));
    update();
  }

  /* ==========================================================
     Umwandlungs-Labor
     ========================================================== */
  function convert(fn, r) {
    const t = r.type, v = r.value;
    if (fn === 'int') {
      if (t === 'int') return { type: 'int', repr: String(v), note: 'Ist schon eine ganze Zahl.' };
      if (t === 'float') { const x = Math.trunc(v); return { type: 'int', repr: String(x), note: 'Die Nachkommastellen werden <b>abgeschnitten</b>, nicht gerundet!' }; }
      if (t === 'bool') return { type: 'int', repr: v ? '1' : '0', note: 'True wird zu 1, False zu 0.' };
      if (t === 'complex') return { error: "TypeError: int() argument must be a string, a bytes-like object or a real number, not 'complex'", note: 'Komplexe Zahlen kann man nicht in ganze Zahlen umwandeln.' };
      if (/^\s*[+-]?\d+\s*$/.test(v)) return { type: 'int', repr: String(parseInt(v, 10)), note: 'Der Text enthält nur Ziffern und wird zur ganzen Zahl.' };
      return { error: "ValueError: invalid literal for int() with base 10: '" + v + "'", note: /[.,]/.test(v) ? 'int() kann aus einem Text mit Komma oder Punkt keine ganze Zahl machen.' : 'Der Text besteht nicht nur aus Ziffern.' };
    }
    if (fn === 'float') {
      if (t === 'int') return { type: 'float', repr: pyFloat(v), note: 'Aus der ganzen Zahl wird eine Kommazahl.' };
      if (t === 'float') return { type: 'float', repr: pyFloat(v), note: 'Ist schon eine Kommazahl.' };
      if (t === 'bool') return { type: 'float', repr: v ? '1.0' : '0.0', note: 'True wird zu 1.0, False zu 0.0.' };
      if (t === 'complex') return { error: "TypeError: float() argument must be a string or a real number, not 'complex'", note: 'Komplexe Zahlen kann man nicht in Kommazahlen umwandeln.' };
      if (/^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/.test(v)) return { type: 'float', repr: pyFloat(parseFloat(v)), note: 'Der Text wird zur Kommazahl.' };
      return { error: "ValueError: could not convert string to float: '" + v + "'", note: /,/.test(v) ? 'Mit Komma klappt es nicht – Kommazahlen schreibt man mit Punkt.' : 'Der Text ist keine Zahl.' };
    }
    if (fn === 'str') {
      const txt = t === 'str' ? v : t === 'complex' ? r.repr : r.repr;
      return { type: 'str', repr: "'" + txt + "'", note: 'Jeder Wert lässt sich in einen Text umwandeln. Danach kann man nicht mehr damit rechnen.' };
    }
    // bool
    let b;
    if (t === 'str') b = v.length > 0;
    else if (t === 'complex') b = v.re !== 0 || v.im !== 0;
    else b = !!v;
    return { type: 'bool', repr: b ? 'True' : 'False', note: 'Nur 0, 0.0 und der leere Text "" ergeben False – alles andere ergibt True.' };
  }

  function initConvert() {
    const fn = document.getElementById('cv-fn');
    const inp = document.getElementById('cv-in');
    const out = document.getElementById('cv-out');
    if (!fn) return;
    const update = () => {
      const call = fn.value + '(' + esc(inp.value.trim()) + ')';
      const r = parseLiteral(inp.value);
      if (r.tuple || r.error) {
        out.innerHTML = call + '  →  <span class="bad">' + esc(r.error || 'Mehrere Werte') + '</span><p class="tool-note">' + r.hint + '</p>';
        return;
      }
      const c = convert(fn.value, r);
      if (c.error) out.innerHTML = call + '<br><span class="bad">' + esc(c.error) + '</span><p class="tool-note">' + c.note + '</p>';
      else out.innerHTML = call + '  →  <span class="ok">' + esc(c.repr) + '</span> ' + badge(c.type) + '<p class="tool-note">' + c.note + '</p>';
    };
    fn.addEventListener('change', update);
    inp.addEventListener('input', update);
    document.querySelectorAll('#convert [data-fn]').forEach((b) => b.addEventListener('click', () => {
      fn.value = b.dataset.fn; inp.value = b.dataset.val; update();
    }));
    update();
  }

  L.onInit(() => { initNameCheck(); initTypeCheck(); initConvert(); });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Welchen Datentyp hat der Wert 3.0?', opts: ['int', 'float', 'str', 'bool'], a: 1,
      ex: 'Wegen des Punktes ist <code>3.0</code> eine Kommazahl – also <code>float</code>, auch wenn der Wert „glatt“ ist.' },
    { q: 'Welcher Variablenname ist gültig und gut gewählt?', opts: ['2te_zahl', 'mein-alter', 'anzahl_schueler', 'False'], a: 2,
      ex: '<code>2te_zahl</code> beginnt mit einer Zahl, <code>mein-alter</code> enthält ein Minus und <code>False</code> ist ein Schlüsselwort.' },
    { q: 'Was gibt dieses Programm aus?', code: 'x = 5\nx = 8\nprint(x)', opts: ['5', '8', '5 8', '13'], a: 1,
      ex: 'Der zweite Wert <b>überschreibt</b> den ersten. In <code>x</code> steht danach nur noch 8.' },
    { q: 'Welchen Datentyp hat "42"?', opts: ['int', 'float', 'str', 'bool'], a: 2,
      ex: 'Wegen der Anführungszeichen ist <code>"42"</code> ein Text (<code>str</code>), auch wenn nur Ziffern darin stehen.' },
    { q: 'Was passiert bei dieser Zeile?', code: 'preis = 12,34', opts: ['preis wird zu 12.34', 'preis enthält zwei Zahlen: 12 und 34', 'preis wird zu 1234', 'Es gibt immer einen Fehler'], a: 1,
      ex: 'Das Komma trennt zwei Werte. Python speichert <code>(12, 34)</code>. Für eine Kommazahl braucht man einen Punkt.' },
    { q: 'Was passiert bei diesem Programm?', code: 'alter = 16\nprint(Alter)', opts: ['Es gibt 16 aus', 'Es gibt Alter aus', 'NameError – Alter ist unbekannt', 'Es gibt nichts aus'], a: 2,
      ex: 'Python unterscheidet Groß- und Kleinschreibung. <code>Alter</code> ist eine andere, noch unbekannte Variable.' },
    { q: 'Was ergibt int(7.9)?', opts: ['8', '7', '7.9', 'Fehlermeldung'], a: 1,
      ex: '<code>int()</code> schneidet die Nachkommastellen einfach ab – es wird <b>nicht</b> gerundet.' }
  ]);
})();
