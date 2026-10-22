/* ==========================================================
   Inhalte der Lernseite „12 Dictionaries“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, py } = L.util;

  /* ---------- Dictionary als Paare [[schlüssel, wert], …] ---------- */
  const reprD = (d) => '{' + d.map(([k, v]) => py.repr(k) + ': ' + py.repr(v)).join(', ') + '}';
  const find = (d, k) => d.findIndex(([x]) => py.eq(x, k));

  function renderDict(table, d, opt) {
    opt = opt || {};
    table.innerHTML = '';
    const head = el('tr');
    head.append(el('th', null, 'Schlüssel'), el('th'), el('th', null, 'Wert'));
    table.appendChild(head);
    if (!d.length) {
      const tr = el('tr'); const td = el('td', null, '{ }  leeres Dictionary'); td.colSpan = 3; tr.appendChild(td); table.appendChild(tr);
      return;
    }
    d.forEach(([k, v], i) => {
      const tr = el('tr');
      if (opt.hl === i) tr.classList.add('is-hl');
      if (opt.neu === i) tr.classList.add('is-new');
      const a = el('td'); a.textContent = py.repr(k);
      const b = el('td', 'arrow', '→');
      const c = el('td'); c.textContent = py.repr(v);
      tr.append(a, b, c);
      table.appendChild(tr);
    });
  }

  /* ==========================================================
     Dictionary-Labor
     ========================================================== */
  const START = [['"Ada Lovelace"', '"0681 1815"'], ['"Alan Turing"', '"06831 1912"'], ['"Grace Hopper"', '"0176 1906"']];

  const OPS = {
    get: { label: 'd[schlüssel]', k: true, call: (k) => 'telefonbuch[' + k + ']',
      run(d, k) { const i = find(d, k); if (i < 0) throw new Error('KeyError: ' + py.repr(k)); return { ret: d[i][1], hl: i }; } },
    set: { label: 'd[schlüssel] = wert', k: true, v: 'Wert', call: (k, v) => 'telefonbuch[' + k + '] = ' + v,
      run(d, k, v) {
        const i = find(d, k);
        if (i >= 0) { const old = d[i][1]; d[i][1] = v; return { mut: true, neu: i, note: 'Schlüssel gab es schon → alter Wert ' + py.repr(old) + ' wurde überschrieben.' }; }
        d.push([k, v]); return { mut: true, neu: d.length - 1, note: 'Schlüssel war neu → Paar wurde hinzugefügt.' };
      } },
    del: { label: 'del d[schlüssel]', k: true, call: (k) => 'del telefonbuch[' + k + ']',
      run(d, k) { const i = find(d, k); if (i < 0) throw new Error('KeyError: ' + py.repr(k)); d.splice(i, 1); return { mut: true }; } },
    pop: { label: 'd.pop(schlüssel)', k: true, call: (k) => 'telefonbuch.pop(' + k + ')',
      run(d, k) { const i = find(d, k); if (i < 0) throw new Error('KeyError: ' + py.repr(k)); const v = d.splice(i, 1)[0][1]; return { ret: v, mut: true }; } },
    getm: { label: 'd.get(schlüssel, standard)', k: true, v: 'Standardwert (optional)', optional: true, call: (k, v) => 'telefonbuch.get(' + k + (v ? ', ' + v : '') + ')',
      run(d, k, v) { const i = find(d, k); if (i >= 0) return { ret: d[i][1], hl: i }; return { ret: v === undefined ? null : v, showNone: true, note: 'Schlüssel nicht vorhanden → kein Fehler, sondern ' + (v === undefined ? 'None' : 'der Standardwert') + '.' }; } },
    in: { label: 'schlüssel in d', k: true, call: (k) => k + ' in telefonbuch',
      run(d, k) { const i = find(d, k); return { ret: i >= 0, hl: i >= 0 ? i : undefined }; } },
    len: { label: 'len(d)', call: () => 'len(telefonbuch)', run(d) { return { ret: py.int(d.length) }; } },
    keys: { label: 'd.keys()', call: () => 'telefonbuch.keys()', run(d) { return { raw: 'dict_keys([' + d.map(([k]) => py.repr(k)).join(', ') + '])' }; } },
    values: { label: 'd.values()', call: () => 'telefonbuch.values()', run(d) { return { raw: 'dict_values([' + d.map(([, v]) => py.repr(v)).join(', ') + '])' }; } },
    items: { label: 'd.items()', call: () => 'telefonbuch.items()', run(d) { return { raw: 'dict_items([' + d.map(([k, v]) => '(' + py.repr(k) + ', ' + py.repr(v) + ')').join(', ') + '])' }; } },
    clear: { label: 'd.clear()', call: () => 'telefonbuch.clear()', run(d) { d.splice(0, d.length); return { mut: true }; } }
  };
  const DEF = { get: ['"Alan Turing"'], set: ['"Konrad Zuse"', '"06861 1910"'], del: ['"Grace Hopper"'], pop: ['"Ada Lovelace"'], getm: ['"Hedy Lamarr"', '"unbekannt"'], in: ['"Grace Hopper"'] };

  function initLab() {
    const table = document.getElementById('dl-table');
    if (!table) return;
    const op = document.getElementById('dl-op');
    const fk = document.getElementById('dl-k'), fv = document.getElementById('dl-v');
    const kw = document.getElementById('dl-kw'), vw = document.getElementById('dl-vw'), vl = document.getElementById('dl-vl');
    const call = document.getElementById('dl-call');
    const log = document.getElementById('dl-log');
    let d;
    Object.entries(OPS).forEach(([k, o]) => { const opt = el('option'); opt.value = k; opt.textContent = o.label; op.appendChild(opt); });
    op.value = 'get';
    const line = (cls, t) => { const x = el('div', cls); x.textContent = t; log.appendChild(x); log.scrollTop = log.scrollHeight; };
    const preview = () => {
      const o = OPS[op.value];
      kw.hidden = !o.k; vw.hidden = !o.v;
      if (o.v) vl.textContent = o.v;
      call.textContent = o.call(fk.value.trim() || '…', fv.value.trim() || (o.optional ? '' : '…'));
    };
    const choose = () => { const x = DEF[op.value] || []; fk.value = x[0] || ''; fv.value = x[1] || ''; preview(); };
    const reset = () => {
      d = START.map(([k, v]) => [py.parse(k).value, py.parse(v).value]);
      log.innerHTML = '';
      line('c-muted', '>>> telefonbuch = ' + reprD(d));
      renderDict(table, d);
    };
    const parse = (raw, isKey) => {
      const r = py.parse(raw);
      if (r.error) throw new Error(r.error + (r.hint ? '  (' + r.hint + ')' : ''));
      if (isKey && Array.isArray(r.value)) throw new Error("TypeError: unhashable type: 'list'  (Listen können keine Schlüssel sein)");
      return r.value;
    };
    const run = () => {
      const o = OPS[op.value];
      const rk = fk.value.trim(), rv = fv.value.trim();
      line('c-in', '>>> ' + o.call(rk, rv));
      try {
        const k = o.k ? parse(rk, true) : undefined;
        const v = o.v ? (rv === '' && o.optional ? undefined : parse(rv)) : undefined;
        const r = o.run(d, k, v);
        if (r.raw) line('', r.raw);
        else if (r.ret !== undefined && (r.ret !== null || r.showNone)) line('', py.repr(r.ret));
        if (r.note) line('c-muted', '# ' + r.note);
        if (r.mut) line('c-muted', '# telefonbuch ist jetzt ' + reprD(d));
        renderDict(table, d, { hl: r.hl, neu: r.neu });
      } catch (e) {
        line('c-err', e.message);
        renderDict(table, d);
      }
    };
    op.addEventListener('change', choose);
    [fk, fv].forEach((f) => {
      f.addEventListener('input', preview);
      f.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    });
    document.getElementById('dl-run').addEventListener('click', run);
    document.getElementById('dl-reset').addEventListener('click', reset);
    reset();
    choose();
  }

  L.onInit(initLab);

  /* ==========================================================
     Beispiel: Zählen mit einem Dictionary
     ========================================================== */
  L.addExamples({
    zaehlen: {
      memory: true,
      code:
`farben = ["rot", "blau", "rot", "gelb", "blau", "rot"]
zaehler = {}
for farbe in farben:
    zaehler[farbe] = zaehler.get(farbe, 0) + 1
print(zaehler)
print(f"rot kam {zaehler['rot']} mal vor.")`,
      lineNotes: {
        1: '<b>Liste</b> mit den Werten, die gezählt werden sollen.',
        2: '<b>Leeres Dictionary:</b> Für jede Farbe wird später ein Paar <i>Farbe → Anzahl</i> angelegt.',
        3: '<b>Schleife</b> über alle Farben der Liste.',
        4: '<b>Zählen:</b> <code>zaehler.get(farbe, 0)</code> liefert die bisherige Anzahl – oder 0, wenn die Farbe noch nicht vorkam. Plus 1, dann wird der Wert gespeichert (neu angelegt oder überschrieben).',
        5: '<b>Ausgabe</b> des ganzen Dictionarys.',
        6: '<b>Zugriff über den Schlüssel</b> <code>"rot"</code>.'
      },
      inputs: [],
      run() {
        const farben = ['rot', 'blau', 'rot', 'gelb', 'blau', 'rot'];
        const z = [];
        const rz = () => '{' + z.map(([k, v]) => "'" + k + "': " + v).join(', ') + '}';
        const s = [
          { lines: [1], vars: { farben: ['[' + farben.map((f) => "'" + f + "'").join(', ') + ']', 'list'] } },
          { lines: [2], vars: { zaehler: ['{}', 'dict'] } }
        ];
        farben.forEach((f, n) => {
          s.push({ lines: [3], vars: { farbe: ["'" + f + "'", 'str'] }, check: 'Durchlauf ' + (n + 1) + ': farbe = ' + "'" + f + "'" });
          const i = z.findIndex(([k]) => k === f);
          const old = i < 0 ? 0 : z[i][1];
          if (i < 0) z.push([f, 1]); else z[i][1] += 1;
          s.push({ lines: [4], vars: { zaehler: [rz(), 'dict'] }, check: 'zaehler.get(' + "'" + f + "'" + ', 0) = ' + old + (i < 0 ? ' (noch nicht vorhanden)' : '') + '  →  ' + old + ' + 1 = ' + (old + 1) });
        });
        s.push({ lines: [3], check: 'Alle Farben gezählt  →  Schleife endet' });
        s.push({ lines: [5], print: rz() });
        s.push({ lines: [6], print: 'rot kam 3 mal vor.' });
        return s;
      }
    }
  });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Wie greift man auf die Nummer von Grace Hopper zu?', code: 'telefonbuch = {"Ada Lovelace": "0681 1815", "Grace Hopper": "0176 1906"}',
      opts: ['telefonbuch[1]', 'telefonbuch["Grace Hopper"]', 'telefonbuch.Grace Hopper', 'telefonbuch("Grace Hopper")'], a: 1,
      ex: 'Der Schlüssel steht in eckigen Klammern hinter dem Namen des Dictionarys.' },
    { q: 'Was passiert bei dieser Zeile, wenn es "Ada Lovelace" schon gibt?', code: 'telefonbuch["Ada Lovelace"] = "0681 999"',
      opts: ['Ein zweiter Eintrag "Ada Lovelace" entsteht', 'Der alte Wert wird überschrieben', 'KeyError', 'Nichts'], a: 1,
      ex: 'Jeder Schlüssel kommt nur einmal vor. Eine Zuweisung an einen vorhandenen Schlüssel überschreibt den Wert.' },
    { q: 'Was liefert d.get("x", 0), wenn es den Schlüssel "x" nicht gibt?', opts: ['KeyError', 'None', '0', '"x"'], a: 2,
      ex: '<code>get()</code> liefert den angegebenen Standardwert statt eines Fehlers.' },
    { q: 'Welcher dieser Werte kann KEIN Schlüssel sein?', opts: ['42', '"Name"', '[1, 2]', '3.5'], a: 2,
      ex: 'Schlüssel müssen unveränderlich sein. Listen können verändert werden: <code>TypeError: unhashable type: \'list\'</code>.' },
    { q: 'Was gibt das Programm aus?', code: 'd = {"a": 1, "b": 2, "c": 3}\nprint(len(d))', opts: ['3', '6', '9', '2'], a: 0,
      ex: '<code>len()</code> zählt die Schlüssel-Wert-Paare.' },
    { q: 'Was liefert die Schleife in name?', code: 'for name in telefonbuch:\n    print(name)', opts: ['Die Werte (Nummern)', 'Die Schlüssel (Namen)', 'Paare (Name, Nummer)', 'Die Indizes 0, 1, 2 …'], a: 1,
      ex: 'Eine <code>for</code>-Schleife über ein Dictionary liefert die Schlüssel. Für Paare nimmt man <code>items()</code>.' },
    { q: 'Wie löscht man den Eintrag "Alan Turing"?', opts: ['telefonbuch.remove("Alan Turing")', 'del telefonbuch["Alan Turing"]', 'telefonbuch["Alan Turing"] = 0', 'telefonbuch.clear("Alan Turing")'], a: 1,
      ex: 'Mit <code>del</code> (oder <code>pop()</code>) wird ein Paar gelöscht. <code>remove()</code> gibt es nur bei Listen.' }
  ]);
})();
