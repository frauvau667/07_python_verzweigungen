/* ==========================================================
   Inhalte der Lernseite „10 Eindimensionale Listen“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, esc, pyFloat, py } = L.util;
  const P = (s) => py.parse(s).value;

  /* ---------- Liste als Kästchen zeichnen ---------- */
  function renderList(box, arr, opt) {
    opt = opt || {};
    box.innerHTML = '';
    if (!arr.length) { box.appendChild(el('div', 'lv-empty', '[ ]  leere Liste')); return; }
    arr.forEach((v, i) => {
      const c = el('div', 'lv-cell');
      if (opt.hl && opt.hl.includes(i)) c.classList.add('is-hl');
      if (opt.neu && opt.neu.includes(i)) c.classList.add('is-new');
      c.appendChild(el('div', 'lv-idx', String(i)));
      const val = el('div', 'lv-val'); val.textContent = py.repr(v);
      c.appendChild(val);
      c.appendChild(el('div', 'lv-idx neg', String(i - arr.length)));
      if (opt.onClick) {
        c.tabIndex = 0;
        c.setAttribute('role', 'button');
        c.addEventListener('click', () => opt.onClick(i));
        c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.onClick(i); } });
      }
      box.appendChild(c);
    });
  }

  /* ---------- Hilfen für Indizes ---------- */
  function needInt(x, what) {
    if (!(x && x.t === 'int')) throw new Error('TypeError: ' + (what || 'list indices') + ' must be integers' + (what ? '' : ' or slices') + ', not ' + py.type(x));
    return x.v;
  }
  function norm(i, n, msg) {
    const j = i < 0 ? i + n : i;
    if (j < 0 || j >= n) throw new Error('IndexError: ' + (msg || 'list index out of range'));
    return j;
  }
  function findIdx(arr, x) { return arr.findIndex((v) => py.eq(v, x)); }

  /* ==========================================================
     1 Aufbau: monat1 anklicken
     ========================================================== */
  function initAufbau() {
    const box = document.getElementById('av-list');
    if (!box) return;
    const monat1 = [P('"Januar"'), P('1'), P('31'), P('8.4')];
    const out = document.getElementById('av-out');
    const draw = (sel) => renderList(box, monat1, {
      hl: sel == null ? [] : [sel],
      onClick: (i) => {
        draw(i);
        const v = monat1[i];
        out.innerHTML = 'monat1[' + i + ']  →  <b>' + esc(py.repr(v)) + '</b>   ·   monat1[' + (i - monat1.length) + ']  →  <b>' + esc(py.repr(v)) + '</b>' +
          '<br><span class="small">Datentyp: ' + py.type(v) + ' · Die Liste hat ' + monat1.length + ' Elemente, der letzte Index ist ' + (monat1.length - 1) + '.</span>';
      }
    });
    draw(null);
  }

  /* ==========================================================
     2 Index-Tester
     ========================================================== */
  function initIndex() {
    const box = document.getElementById('ix-list');
    if (!box) return;
    const monat2 = [P('"Februar"'), P('2'), P('28')];
    const inp = document.getElementById('ix-in');
    const out = document.getElementById('ix-out');
    const update = () => {
      const r = py.parse(inp.value);
      let hl = [];
      if (r.error) { out.innerHTML = '<span class="bad">' + esc(r.error) + '</span>'; }
      else {
        try {
          const i = needInt(r.value);
          const j = norm(i, monat2.length);
          hl = [j];
          out.innerHTML = 'monat2[' + esc(py.repr(r.value)) + ']  →  <span class="ok">' + esc(py.repr(monat2[j])) + '</span>' +
            (i < 0 ? '<br><span class="small">Negativer Index: ' + i + ' + ' + monat2.length + ' (Länge) = Index ' + j + '</span>' : '');
        } catch (e) {
          out.innerHTML = 'monat2[' + esc(inp.value.trim()) + ']  →  <span class="bad">' + esc(e.message) + '</span><br><span class="small">Gültig sind die Indizes 0 bis ' + (monat2.length - 1) + ' bzw. -1 bis -' + monat2.length + '.</span>';
        }
      }
      renderList(box, monat2, { hl, onClick: (i) => { inp.value = String(i); update(); } });
    };
    inp.addEventListener('input', update);
    document.querySelectorAll('#idx-lab [data-ix]').forEach((b) => b.addEventListener('click', () => { inp.value = b.dataset.ix; update(); }));
    update();
  }

  /* ==========================================================
     Listen-Labor
     ========================================================== */
  const START = ['"Maerz"', '3', '42', '31'];

  const OPS = {
    get: { label: 'liste[index]', args: ['index'], call: (a) => 'print(liste[' + a[0] + '])',
      run(l, a) { const j = norm(needInt(a[0]), l.length); return { ret: l[j], hl: [j] }; } },
    set: { label: 'liste[index] = wert', args: ['index', 'wert'], call: (a) => 'liste[' + a[0] + '] = ' + a[1],
      run(l, a) { const j = norm(needInt(a[0]), l.length, 'list assignment index out of range'); l[j] = a[1]; return { neu: [j], mut: true }; } },
    append: { label: 'liste.append(wert)', args: ['wert'], call: (a) => 'liste.append(' + a[0] + ')',
      run(l, a) { l.push(a[0]); return { neu: [l.length - 1], mut: true, ret: null }; } },
    insert: { label: 'liste.insert(index, wert)', args: ['index', 'wert'], call: (a) => 'liste.insert(' + a[0] + ', ' + a[1] + ')',
      run(l, a) {
        let i = needInt(a[0], "'" + py.type(a[0]) + "' object cannot be interpreted as an integer. Index");
        if (i < 0) i = Math.max(0, i + l.length);
        if (i > l.length) i = l.length;
        l.splice(i, 0, a[1]);
        return { neu: [i], mut: true, ret: null };
      } },
    remove: { label: 'liste.remove(wert)', args: ['wert'], call: (a) => 'liste.remove(' + a[0] + ')',
      run(l, a) { const j = findIdx(l, a[0]); if (j < 0) throw new Error('ValueError: list.remove(x): x not in list'); l.splice(j, 1); return { mut: true, ret: null, note: 'Gelöscht wurde das erste Vorkommen an Index ' + j + '. Die folgenden Elemente rücken nach.' }; } },
    pop: { label: 'liste.pop(index)', args: ['index (leer = letztes)'], optional: true, call: (a) => 'entfernt = liste.pop(' + (a[0] || '') + ')', show: 'entfernt',
      run(l, a) {
        if (!l.length) throw new Error('IndexError: pop from empty list');
        const j = a[0] === undefined ? l.length - 1 : norm(needInt(a[0]), l.length, 'pop index out of range');
        const v = l.splice(j, 1)[0];
        return { mut: true, ret: v, note: 'pop() gibt das entfernte Element zurück – hier wird es in der Variablen entfernt gespeichert.' };
      } },
    sort: { label: 'liste.sort()', args: [], numeric: true, call: () => 'liste.sort()',
      run(l) { const c = l.slice(); c.sort(py.cmp); l.splice(0, l.length, ...c); return { mut: true, ret: null }; } },
    reverse: { label: 'liste.reverse()', args: [], call: () => 'liste.reverse()',
      run(l) { l.reverse(); return { mut: true, ret: null }; } },
    clear: { label: 'liste.clear()', args: [], call: () => 'liste.clear()',
      run(l) { l.splice(0, l.length); return { mut: true, ret: null }; } },
    count: { label: 'liste.count(wert)', args: ['wert'], call: (a) => 'print(liste.count(' + a[0] + '))',
      run(l, a) { const hl = []; l.forEach((v, i) => { if (py.eq(v, a[0])) hl.push(i); }); return { ret: py.int(hl.length), hl }; } },
    index: { label: 'liste.index(wert)', args: ['wert'], call: (a) => 'print(liste.index(' + a[0] + '))',
      run(l, a) { const j = findIdx(l, a[0]); if (j < 0) throw new Error('ValueError: ' + py.repr(a[0]) + ' is not in list'); return { ret: py.int(j), hl: [j] }; } },
    in: { label: 'wert in liste', args: ['wert'], call: (a) => 'print(' + a[0] + ' in liste)',
      run(l, a) { const j = findIdx(l, a[0]); return { ret: j >= 0, hl: j >= 0 ? [j] : [] }; } },
    len: { label: 'len(liste)', args: [], call: () => 'print(len(liste))', run(l) { return { ret: py.int(l.length) }; } },
    sum: { label: 'sum(liste)', args: [], numeric: true, call: () => 'print(sum(liste))',
      run(l) {
        let s = 0, fl = false;
        for (const v of l) {
          if (!(py.isNum(v) || typeof v === 'boolean')) throw new Error("TypeError: unsupported operand type(s) for +: '" + (fl ? 'float' : 'int') + "' and '" + py.type(v) + "'");
          if (v.t === 'float') fl = true;
          s += py.num(v);
        }
        return { ret: fl ? py.float(s) : py.int(s) };
      } },
    min: { label: 'min(liste)', args: [], numeric: true, call: () => 'print(min(liste))', run(l) { return extreme(l, 'min', -1); } },
    max: { label: 'max(liste)', args: [], numeric: true, call: () => 'print(max(liste))', run(l) { return extreme(l, 'max', 1); } },
    copy: { label: 'liste.copy()', args: [], call: () => 'kopie = liste.copy()', show: 'kopie', run(l) { return { ret: l.slice(), note: 'Die Kopie ist eine neue Liste – Änderungen an ihr verändern liste nicht.' }; } }
  };

  function extreme(l, name, dir) {
    if (!l.length) throw new Error('ValueError: ' + name + '() iterable argument is empty');
    let best = 0;
    for (let i = 1; i < l.length; i++) if (py.cmp(l[i], l[best]) * dir > 0) best = i;
    return { ret: l[best], hl: [best] };
  }

  const DEFAULTS = { get: ['2'], set: ['0', '"April"'], append: ['17.2'], insert: ['2', '42'], remove: ['42'], pop: ['2'], count: ['3'], index: ['31'], in: ['"Maerz"'] };

  function initLab() {
    const box = document.getElementById('ll-list');
    if (!box) return;
    const meta = document.getElementById('ll-meta');
    const op = document.getElementById('ll-op');
    const a1 = document.getElementById('ll-a1'), a2 = document.getElementById('ll-a2');
    const a1w = document.getElementById('ll-a1w'), a2w = document.getElementById('ll-a2w');
    const a1l = document.getElementById('ll-a1l'), a2l = document.getElementById('ll-a2l');
    const call = document.getElementById('ll-call');
    const log = document.getElementById('ll-log');
    let liste;

    Object.entries(OPS).forEach(([k, o]) => { const opt = el('option'); opt.value = k; opt.textContent = o.label; op.appendChild(opt); });
    op.value = 'append';

    const draw = (o) => {
      renderList(box, liste, o || {});
      meta.textContent = 'liste = ' + py.repr(liste) + '   ·   len(liste) = ' + liste.length;
    };
    const line = (cls, text) => { const s = el('div', cls); s.textContent = text; log.appendChild(s); log.scrollTop = log.scrollHeight; };

    const preview = () => {
      const o = OPS[op.value];
      a1w.hidden = o.args.length < 1; a2w.hidden = o.args.length < 2;
      if (o.args[0]) a1l.textContent = o.args[0];
      if (o.args[1]) a2l.textContent = o.args[1];
      const args = [a1.value.trim(), a2.value.trim()];
      call.textContent = o.call(args.map((x) => x || (o.optional ? '' : '…')));
    };
    const NUM = ['17', '3', '65', '42', '-10'];
    const choose = () => {
      const o = OPS[op.value];
      if (o.numeric && !liste.every((v) => py.isNum(v))) {
        liste = NUM.map(P);
        line('c-muted', '# ' + o.label + ' braucht eine Liste, deren Werte sich vergleichen bzw. addieren lassen.');
        line('c-muted', '# Die Liste wird deshalb durch eine Zahlenliste ersetzt:');
        line('c-in', '>>> liste = ' + py.repr(liste));
        draw({ neu: liste.map((_, i) => i) });
      }
      const d = (DEFAULTS[op.value] || []).slice();
      // Standardwert für Suchmethoden an die aktuelle Liste anpassen
      if (['remove', 'count', 'index'].includes(op.value) && liste.length && findIdx(liste, P(d[0])) < 0) {
        d[0] = py.repr(liste[Math.min(2, liste.length - 1)]).replace(/'/g, '"');
      }
      a1.value = d[0] || ''; a2.value = d[1] || '';
      preview();
    };

    const reset = () => {
      liste = START.map(P);
      log.innerHTML = '';
      line('c-muted', '>>> liste = ' + py.repr(liste));
      draw();
    };

    const run = () => {
      const o = OPS[op.value];
      const raw = [a1.value.trim(), a2.value.trim()].slice(0, o.args.length);
      line('c-in', '>>> ' + o.call(raw.map((x) => x || '')));
      const args = [];
      for (let i = 0; i < raw.length; i++) {
        if (raw[i] === '' && o.optional) { args.push(undefined); continue; }
        const r = py.parse(raw[i]);
        if (r.error) { line('c-err', r.error + (r.hint ? '  (' + r.hint + ')' : '')); return; }
        args.push(r.value);
      }
      try {
        const res = o.run(liste, args);
        if (o.show) {
          line('c-in', '>>> print(' + o.show + ')');
          line('', py.str(res.ret));
        } else if (res.ret !== undefined && res.ret !== null) line('', py.str(res.ret));
        if (res.mut) line('c-muted', '# liste ist jetzt ' + py.repr(liste));
        if (res.note) line('c-muted', '# ' + res.note);
        draw({ hl: res.hl, neu: res.neu });
      } catch (e) {
        line('c-err', e.message);
        draw();
      }
    };

    op.addEventListener('change', choose);
    [a1, a2].forEach((i) => i.addEventListener('input', preview));
    [a1, a2].forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    document.getElementById('ll-run').addEventListener('click', run);
    document.getElementById('ll-reset').addEventListener('click', reset);
    reset();
    choose();
  }


  /* ==========================================================
     Suchen mit in
     ========================================================== */
  function initIn() {
    const box = document.getElementById('in-list');
    if (!box) return;
    const gaeste = ['Anna', 'Ben', 'Cem', 'Dana'];
    const inp = document.getElementById('in-v'), op = document.getElementById('in-op'), out = document.getElementById('in-out');
    const update = () => {
      const name = inp.value;
      const j = gaeste.indexOf(name);
      const found = j >= 0;
      const res = op.value === 'in' ? found : !found;
      renderList(box, gaeste, { hl: found ? [j] : [] });
      let hint = found ? 'gefunden an Index ' + j : 'nicht in der Liste';
      const ci = gaeste.findIndex((g) => g.toLowerCase() === name.toLowerCase());
      if (!found && ci >= 0) hint += ' – aber „' + gaeste[ci] + '“ mit anderer Groß-/Kleinschreibung';
      out.innerHTML = esc('print(' + py.strRepr(name).replace(/^'|'$/g, '"') + ' ' + op.value + ' gaeste)') + '  →  <span class="' + (res ? 'ok' : 'bad') + '">' + (res ? 'True' : 'False') + '</span>' +
        '<br><span class="small">' + esc(hint) + '</span>';
    };
    inp.addEventListener('input', update);
    op.addEventListener('change', update);
    update();
  }

  L.onInit(() => { initAufbau(); initIndex(); initLab(); initIn(); });

  /* ==========================================================
     Beispiel: Liste durchlaufen
     ========================================================== */
  L.addExamples({
    wind: {
      memory: true,
      code:
`messwerte = [100.2, 80.5, 49.4, 55.4]
summe = 0
for wert in messwerte:
    summe = summe + wert
durchschnitt = summe / len(messwerte)
print(f"Durchschnitt: {round(durchschnitt, 1)}")
print(f"Höchster Wert: {max(messwerte)}")`,
      lineNotes: {
        1: '<b>Liste anlegen:</b> Vier Messwerte werden unter <b>einem</b> Namen gespeichert.',
        2: '<b>Startwert:</b> In <code>summe</code> werden die Werte aufaddiert. Sie muss vorher mit 0 angelegt werden.',
        3: '<b>Schleife über die Liste:</b> <code>wert</code> bekommt nacheinander jedes Element der Liste – zuerst 100.2, dann 80.5 usw.',
        4: '<b>Aufaddieren:</b> Der aktuelle Wert wird zur bisherigen Summe addiert.',
        5: '<b>Durchschnitt:</b> <code>len(messwerte)</code> liefert die Anzahl der Elemente (4). Wird die Liste länger, passt sich das Programm automatisch an.',
        6: '<b>Ausgabe:</b> <code>round(zahl, 1)</code> rundet auf eine Nachkommastelle.',
        7: '<b>max():</b> liefert den größten Wert der Liste – ganz ohne eigene Schleife.'
      },
      inputs: [],
      run() {
        const w = [100.2, 80.5, 49.4, 55.4];
        const lst = '[' + w.map(pyFloat).join(', ') + ']';
        const s = [
          { lines: [1], vars: { messwerte: [lst, 'list'] } },
          { lines: [2], vars: { summe: ['0', 'int'] } }
        ];
        let sum = 0, n = 0;
        w.forEach((x) => {
          n++;
          s.push({ lines: [3], vars: { wert: [pyFloat(x), 'float'] }, check: 'nächstes Element: wert = ' + pyFloat(x) + '  (Durchlauf ' + n + ')' });
          const old = sum; sum = sum + x;
          s.push({ lines: [4], vars: { summe: [n === 1 && old === 0 ? pyFloat(sum) : pyFloat(sum), 'float'] }, check: 'summe = ' + (old === 0 ? '0' : pyFloat(old)) + ' + ' + pyFloat(x) + '  →  ' + pyFloat(sum) });
        });
        s.push({ lines: [3], check: 'Alle Elemente durchlaufen  →  Schleife endet' });
        const d = sum / w.length;
        s.push({ lines: [5], vars: { durchschnitt: [pyFloat(d), 'float'] }, check: pyFloat(sum) + ' / 4  →  ' + pyFloat(d) });
        s.push({ lines: [6], print: 'Durchschnitt: ' + pyFloat(L.util.pyRound(d, 1)) });
        s.push({ lines: [7], print: 'Höchster Wert: ' + pyFloat(Math.max(...w)) });
        return s;
      }
    }
  });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Welchen Index hat das erste Element einer Liste?', opts: ['0', '1', '-1', 'Das hängt von der Liste ab'], a: 0,
      ex: 'In Python beginnt die Zählung immer bei 0.' },
    { q: 'Was gibt das Programm aus?', code: 'tage = ["Mo", "Di", "Mi", "Do"]\nprint(tage[-1])', opts: ['Mo', 'Do', 'Mi', 'IndexError'], a: 1,
      ex: 'Der Index <code>-1</code> bezeichnet immer das <b>letzte</b> Element.' },
    { q: 'Wie sieht die Liste danach aus?', code: 'z = [5, 8, 2]\nz.insert(1, 7)', opts: ['[5, 8, 2, 7]', '[7, 5, 8, 2]', '[5, 7, 8, 2]', '[5, 7, 2]'], a: 2,
      ex: '<code>insert(1, 7)</code> setzt die 7 an Index 1. Die folgenden Elemente rücken nach hinten.' },
    { q: 'Was ist der Unterschied zwischen remove() und pop()?', opts: ['Keiner', 'remove() löscht nach Wert, pop() nach Index', 'remove() löscht nach Index, pop() nach Wert', 'pop() löscht alle Elemente'], a: 1,
      ex: '<code>remove(42)</code> sucht den Wert 42, <code>pop(2)</code> entfernt das Element an Index 2 (und gibt es zurück).' },
    { q: 'Was enthält zahlen nach dieser Zeile?', code: 'zahlen = [3, 1, 2]\nzahlen = zahlen.sort()', opts: ['[1, 2, 3]', '[3, 1, 2]', 'None', '[3, 2, 1]'], a: 2,
      ex: '<code>sort()</code> sortiert die Liste selbst und gibt <code>None</code> zurück. Dieses <code>None</code> wird dann in <code>zahlen</code> gespeichert.' },
    { q: 'Was ergibt len(["a", "b", "c"])?', opts: ['2', '3', '4', '"abc"'], a: 1,
      ex: 'Die Liste hat drei Elemente. Der letzte Index ist aber 2.' },
    { q: 'Was gibt das Programm aus?', code: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)', opts: ['[1, 2]', '[1, 2, 3]', '[3]', 'Fehlermeldung'], a: 1,
      ex: '<code>b = a</code> erzeugt keine Kopie – <code>a</code> und <code>b</code> sind zwei Namen für dieselbe Liste. Für eine Kopie braucht man <code>a.copy()</code>.' }
  ]);
})();
