/* ==========================================================
   Inhalte der Lernseite „13 Bibliotheken“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, esc, highlight, pyFloat, pyRound, py } = L.util;

  /* ==========================================================
     Import-Labor
     ========================================================== */
  const IMPORTS = {
    mod: { code: 'import math', names: ['math'] },
    from: { code: 'from math import sqrt', names: ['sqrt'] },
    from2: { code: 'from math import sqrt, pi', names: ['sqrt', 'pi'] },
    alias: { code: 'import math as m', names: ['m'] },
    none: { code: '', names: [] }
  };
  const CALLS = {
    'math.sqrt': { need: 'math', code: 'print(math.sqrt(16))', out: '4.0' },
    'sqrt': { need: 'sqrt', code: 'print(sqrt(16))', out: '4.0' },
    'm.sqrt': { need: 'm', code: 'print(m.sqrt(16))', out: '4.0' },
    'pi': { need: 'pi', code: 'print(pi)', out: '3.141592653589793' },
    'math.pi': { need: 'math', code: 'print(math.pi)', out: '3.141592653589793' }
  };

  function initImport() {
    const si = document.getElementById('imp-i');
    if (!si) return;
    const sc = document.getElementById('imp-c');
    const code = document.getElementById('imp-code');
    const out = document.getElementById('imp-out');
    const update = () => {
      const imp = IMPORTS[si.value], c = CALLS[sc.value];
      code.innerHTML = (imp.code ? highlight(imp.code) + '\n' : '') + highlight(c.code);
      if (imp.names.includes(c.need)) {
        out.innerHTML = '<span class="verdict ok">✓ funktioniert</span> Ausgabe: <span class="ok">' + c.out + '</span>' +
          '<p class="tool-note">' + (c.need === 'math' ? 'Nach <code>import math</code> spricht man alles über den Modulnamen an: <code>math.…</code>' :
            c.need === 'm' ? 'Der Alias <code>m</code> steht jetzt für das Modul math.' :
              'Mit <code>from … import</code> stehen die importierten Namen direkt zur Verfügung – ohne Modulnamen davor.') + '</p>';
      } else {
        let hint;
        if (si.value === 'none') hint = 'Ohne Import kennt Python weder <code>math</code> noch seine Funktionen.';
        else if (c.need === 'math' && si.value === 'alias') hint = 'Nach <code>import math as m</code> heißt das Modul im Programm nur noch <code>m</code>. Richtig wäre <code>m.' + (sc.value === 'math.pi' ? 'pi' : 'sqrt(16)') + '</code>.';
        else if (c.need === 'math') hint = 'Mit <code>from math import …</code> wird nur die Funktion importiert, nicht der Name <code>math</code>. Richtig wäre <code>' + (sc.value === 'math.pi' ? 'pi' : 'sqrt(16)') + '</code> – ' + (sc.value === 'math.pi' && si.value === 'from' ? 'dafür muss <code>pi</code> aber auch importiert werden.' : 'ohne Modulnamen.');
        else if (c.need === 'm') hint = 'Den Namen <code>m</code> gibt es nur nach <code>import math as m</code>.';
        else if (si.value === 'mod') hint = 'Nach <code>import math</code> muss der Modulname davorstehen: <code>math.' + c.need + (c.need === 'sqrt' ? '(16)' : '') + '</code>.';
        else if (si.value === 'alias') hint = 'Nach <code>import math as m</code> schreibt man <code>m.' + c.need + (c.need === 'sqrt' ? '(16)' : '') + '</code>.';
        else hint = 'Importiert wurde nur <code>' + IMPORTS[si.value].names.join(', ') + '</code>. <code>' + c.need + '</code> müsste zusätzlich importiert werden: <code>from math import sqrt, pi</code>.';
        out.innerHTML = '<span class="verdict bad">✗ Fehler</span> <span class="bad">NameError: name \'' + c.need + '\' is not defined</span><p class="tool-note">' + hint + '</p>';
      }
    };
    [si, sc].forEach((s) => s.addEventListener('change', update));
    update();
  }

  /* ==========================================================
     math ausprobieren
     ========================================================== */
  function initMath() {
    const f = document.getElementById('ml-f');
    if (!f) return;
    const x = document.getElementById('ml-x');
    const out = document.getElementById('ml-out');
    const update = () => {
      const r = py.parse(x.value);
      const fn = f.value;
      if (r.error || !py.isNum(r.value)) { out.innerHTML = '<span class="bad">Bitte eine Zahl eingeben (Kommazahlen mit Punkt).</span>'; return; }
      const v = r.value.v, xs = py.repr(r.value);
      let call, res, err;
      switch (fn) {
        case 'sqrt': call = 'math.sqrt(' + xs + ')'; if (v < 0) err = 'ValueError: math domain error'; else res = pyFloat(Math.sqrt(v)); break;
        case 'ceil': call = 'math.ceil(' + xs + ')'; res = String(Math.ceil(v)); break;
        case 'floor': call = 'math.floor(' + xs + ')'; res = String(Math.floor(v)); break;
        case 'sin (Grad)': call = 'math.sin(math.radians(' + xs + '))'; res = pyFloat(Math.sin(v * (Math.PI / 180))); break;
        case 'cos (Grad)': call = 'math.cos(math.radians(' + xs + '))'; res = pyFloat(Math.cos(v * (Math.PI / 180))); break;
        case 'log10': call = 'math.log10(' + xs + ')'; if (v <= 0) err = 'ValueError: math domain error'; else res = pyFloat(Math.log10(v)); break;
      }
      out.innerHTML = esc(call) + '  →  ' + (err ? '<span class="bad">' + err + '</span><p class="tool-note">Für diesen Wert ist die Funktion mathematisch nicht definiert.</p>'
        : '<span class="ok">' + res + '</span>' + (fn.includes('Grad') ? '<p class="tool-note">Die Winkelfunktionen erwarten das Bogenmaß – deshalb wird mit <code>math.radians()</code> umgerechnet. Kleine Abweichungen wie 0.49999999999999994 statt 0.5 entstehen, weil Kommazahlen nicht exakt gespeichert werden.</p>' : fn === 'ceil' || fn === 'floor' ? '<p class="tool-note">Das Ergebnis ist eine ganze Zahl (<code>int</code>).</p>' : ''));
    };
    f.addEventListener('change', update);
    x.addEventListener('input', update);
    update();
  }

  /* ==========================================================
     statistics ausprobieren
     ========================================================== */
  function initStat() {
    const inp = document.getElementById('sl-d');
    if (!inp) return;
    const code = document.getElementById('sl-code');
    const out = document.getElementById('sl-out');
    const row = (l, r, bad) => { const d = el('div'); const a = el('span'); a.textContent = l; const b = el('span', 'res' + (bad ? ' bad' : '')); b.textContent = r; d.append(a, b); out.appendChild(d); };
    const update = () => {
      out.innerHTML = '';
      const parts = inp.value.split(',').map((s) => s.trim()).filter((s) => s !== '');
      const data = [];
      for (const p of parts) {
        const r = py.parse(p);
        if (r.error || !py.isNum(r.value)) { code.textContent = ''; row('Fehler', '„' + p + '“ ist keine Zahl. Zahlen mit Komma trennen, Kommazahlen mit Punkt schreiben.', true); return; }
        data.push(r.value);
      }
      code.innerHTML = highlight('import statistics') + '\n' + highlight('daten = ' + py.repr(data));
      if (!data.length) { row('statistics.mean(daten)', 'StatisticsError: mean requires at least one data point', true); return; }
      const allInt = data.every((d) => d.t === 'int');
      const vals = data.map((d) => d.v);
      const n = vals.length, sum = vals.reduce((a, b) => a + b, 0);
      // Mittelwert
      const mean = allInt && sum % n === 0 ? String(sum / n) : pyFloat(sum / n);
      row('statistics.mean(daten)', mean);
      // Median
      const s = data.slice().sort((a, b) => a.v - b.v);
      const med = n % 2 ? py.repr(s[(n - 1) / 2]) : pyFloat((s[n / 2 - 1].v + s[n / 2].v) / 2);
      row('statistics.median(daten)', med);
      // Modus
      const cnt = new Map(); let best = null, bestN = 0;
      data.forEach((d) => { const k = d.v; const c = (cnt.get(k) || 0) + 1; cnt.set(k, c); if (c > bestN) { bestN = c; best = d; } });
      row('statistics.mode(daten)', py.repr(best) + (bestN === 1 ? '  (alle gleich oft → erster Wert)' : '  (' + bestN + '×)'));
      // Standardabweichung
      if (n < 2) row('round(statistics.stdev(daten), 4)', 'StatisticsError: stdev requires at least two data points', true);
      else {
        const m = sum / n;
        const sd = Math.sqrt(vals.reduce((a, b) => a + (b - m) * (b - m), 0) / (n - 1));
        row('round(statistics.stdev(daten), 4)', pyFloat(pyRound(sd, 4)));
      }
    };
    inp.addEventListener('input', update);
    update();
  }

  /* ==========================================================
     random ausprobieren
     ========================================================== */
  function initRandom() {
    const log = document.getElementById('rnd-log');
    if (!log) return;
    let ausreden = ['Bei mir funktioniert es.', 'Das ist kein Bug, das ist ein Feature.', 'Das war schon so.', 'Das muss am Compiler liegen.'];
    const line = (cls, t) => { const d = el('div', cls); d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    line('c-muted', '>>> import random');
    line('c-muted', '>>> ausreden = ' + py.repr(ausreden));
    document.querySelectorAll('#rnd-lab [data-r]').forEach((b) => b.addEventListener('click', () => {
      const r = b.dataset.r;
      line('c-in', '>>> ' + b.textContent);
      if (r === 'randint') line('', String(1 + Math.floor(Math.random() * 6)));
      if (r === 'uniform') line('', pyFloat(1 + Math.random() * 19));
      if (r === 'random') line('', pyFloat(Math.random()));
      if (r === 'choice') line('', py.repr(ausreden[Math.floor(Math.random() * ausreden.length)]));
      if (r === 'shuffle') {
        for (let i = ausreden.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ausreden[i], ausreden[j]] = [ausreden[j], ausreden[i]]; }
        line('c-muted', '# shuffle() gibt nichts zurück, verändert aber die Liste:');
        line('c-in', '>>> print(ausreden)');
        line('', py.repr(ausreden));
      }
    }));
  }

  /* ==========================================================
     datetime und time
     ========================================================== */
  const two = (n) => String(n).padStart(2, '0');
  const pyDate = (d, micro) => d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()) + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()) + '.' + String(d.getMilliseconds()).padStart(3, '0') + micro;
  const fmtDe = (d) => two(d.getDate()) + '.' + two(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + two(d.getHours()) + ':' + two(d.getMinutes());

  function initDate() {
    const inp = document.getElementById('dt-d');
    if (!inp) return;
    const out = document.getElementById('dt-out');
    const micro = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const update = () => {
      const now = new Date();
      const r = py.parse(inp.value);
      let txt = esc('jetzt = dt.datetime.now()') + '<br>print(jetzt)  →  <span class="ok">' + pyDate(now, micro) + '</span><br>' +
        esc('print(jetzt.strftime("%d.%m.%Y %H:%M"))') + '  →  <span class="ok">' + fmtDe(now) + '</span><br><br>';
      if (r.error || !(r.value && r.value.t === 'int')) txt += '<span class="bad">Bitte eine ganze Zahl für days eingeben.</span>';
      else {
        const later = new Date(now.getTime() + r.value.v * 86400000);
        const wd = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][later.getDay()];
        txt += esc('spaeter = jetzt + dt.timedelta(days=' + r.value.v + ')') + '<br>' + esc('print(spaeter.strftime("%d.%m.%Y"))') + '  →  <span class="ok">' + two(later.getDate()) + '.' + two(later.getMonth() + 1) + '.' + later.getFullYear() + '</span>  <span class="small">(' + wd + ')</span>';
      }
      out.innerHTML = txt;
    };
    inp.addEventListener('input', update);
    update();
    setInterval(update, 1000);
  }

  function initTime() {
    const bs = document.getElementById('tm-start');
    if (!bs) return;
    const be = document.getElementById('tm-stop');
    const log = document.getElementById('tm-log');
    let start = null;
    const line = (cls, t) => { const d = el('div', cls); d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    line('c-muted', '>>> import time');
    bs.addEventListener('click', () => {
      start = performance.timeOrigin + performance.now();
      line('c-in', '>>> start = time.time()');
      line('c-muted', '# start = ' + (start / 1000).toFixed(6) + '  (Sekunden seit 1.1.1970)');
      be.disabled = false;
    });
    be.addEventListener('click', () => {
      const end = performance.timeOrigin + performance.now();
      line('c-in', '>>> ende = time.time()');
      line('c-in', '>>> print(ende - start)');
      line('', pyFloat((end - start) / 1000));
      line('c-muted', '# So viele Sekunden lagen zwischen den beiden Klicks.');
      be.disabled = true;
    });
  }

  L.onInit(() => { initImport(); initMath(); initStat(); initRandom(); initDate(); initTime(); });

  /* ==========================================================
     Beispiel: Kreis mit math.pi
     ========================================================== */
  L.addExamples({
    kreis: {
      code:
`import math

radius = float(input("Radius in cm: "))
flaeche = math.pi * radius ** 2
umfang = 2 * math.pi * radius
print(f"Fläche: {round(flaeche, 2)} cm²")
print(f"Umfang: {round(umfang, 2)} cm")`,
      lineNotes: { 1: '<b>import math:</b> Bindet das Modul ein. Danach stehen alle Funktionen und Konstanten über <code>math.</code> zur Verfügung. Im Struktogramm erscheint der Import nicht, weil dabei noch nichts berechnet wird.' },
      diagram: [
        { t: 'stmt', id: 'e', tag: 'E', text: 'Eingabe radius', lines: [3], info: '<b>Eingabe</b> des Radius als Kommazahl.' },
        { t: 'stmt', id: 'v1', tag: 'V', text: 'flaeche = π · radius²', lines: [4], info: '<b>math.pi</b> ist eine Konstante (ohne Klammern) mit dem Wert 3.141592653589793 – viel genauer als 3.14.' },
        { t: 'stmt', id: 'v2', tag: 'V', text: 'umfang = 2 · π · radius', lines: [5], info: '<b>Verarbeitung:</b> Umfang mit <code>math.pi</code>.' },
        { t: 'stmt', id: 'a1', tag: 'A', text: 'Ausgabe flaeche', lines: [6], info: '<b>Ausgabe</b> auf zwei Nachkommastellen gerundet mit <code>round(flaeche, 2)</code>.' },
        { t: 'stmt', id: 'a2', tag: 'A', text: 'Ausgabe umfang', lines: [7], info: '<b>Ausgabe</b> des Umfangs.' }
      ],
      inputs: [{ name: 'radius', type: 'float', value: '5' }],
      run(v) {
        const r = v.radius, f = Math.PI * r ** 2, u = 2 * Math.PI * r;
        return [
          { id: 'e', ask: ['Radius in cm: ', document.getElementById('f-kreis-radius').value.trim()], vars: { radius: pyFloat(r) } },
          { id: 'v1', check: 'math.pi * ' + pyFloat(r) + ' ** 2  →  ' + pyFloat(f), vars: { flaeche: pyFloat(f) } },
          { id: 'v2', check: '2 * math.pi * ' + pyFloat(r) + '  →  ' + pyFloat(u), vars: { umfang: pyFloat(u) } },
          { id: 'a1', print: 'Fläche: ' + pyFloat(pyRound(f, 2)) + ' cm²' },
          { id: 'a2', print: 'Umfang: ' + pyFloat(pyRound(u, 2)) + ' cm' }
        ];
      }
    }
  });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Was muss man tun, bevor man ein Modul der Standardbibliothek nutzen kann?', opts: ['Es mit pip installieren', 'Es mit import einbinden', 'Nichts', 'Python neu installieren'], a: 1,
      ex: 'Die Standardbibliothek ist schon installiert, muss aber im Programm mit <code>import</code> eingebunden werden.' },
    { q: 'Welcher Aufruf funktioniert nach "from math import sqrt"?', opts: ['math.sqrt(9)', 'sqrt(9)', 'm.sqrt(9)', 'math(sqrt(9))'], a: 1,
      ex: 'Mit <code>from … import</code> steht <code>sqrt</code> direkt zur Verfügung. Der Name <code>math</code> selbst ist dabei nicht bekannt.' },
    { q: 'Was liefert random.randint(1, 6)?', opts: ['Eine Zahl von 1 bis 5', 'Eine Zahl von 1 bis 6', 'Eine Kommazahl zwischen 1 und 6', 'Immer 6'], a: 1,
      ex: 'Bei <code>randint</code> sind <b>beide</b> Grenzen möglich – anders als bei <code>range()</code>.' },
    { q: 'Was bewirkt "import datetime as dt"?', opts: ['Es importiert nur die Funktion dt', 'Das Modul datetime ist im Programm unter dem Kurznamen dt erreichbar', 'Es erzeugt eine Variable mit dem aktuellen Datum', 'Es benennt die Datei um'], a: 1,
      ex: 'Ein Alias ist ein Kurzname für das Modul: <code>dt.datetime.now()</code>.' },
    { q: 'Was ergibt statistics.median([3, 1, 2])?', opts: ['2', '3', '1', '2.0'], a: 0,
      ex: 'Sortiert: [1, 2, 3] – der mittlere Wert ist 2.' },
    { q: 'Welches Modul eignet sich, um die Laufzeit eines Programms zu messen?', opts: ['math', 'random', 'time', 'statistics'], a: 2,
      ex: 'Mit <code>time.time()</code> vor und nach dem Programmteil misst man die vergangenen Sekunden.' },
    { q: 'Wie schreibt man π in Python korrekt?', opts: ['math.pi()', 'math.pi', 'math.PI', 'pi(math)'], a: 1,
      ex: '<code>math.pi</code> ist eine Konstante, keine Funktion – deshalb ohne Klammern und klein geschrieben.' }
  ]);
})();
