/* ==========================================================
   Inhalte der Lernseite „11 Mehrdimensionale Listen“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, esc, highlight, py } = L.util;

  /* ---------- Matrix als Tabelle zeichnen ---------- */
  // m: Array von Zeilen (Werte als Python-Werte), opt: { hl:[[i,j]], row:i, neu:[[i,j]], alias:[[i,j]], onClick(i,j) }
  function renderMatrix(table, m, opt) {
    opt = opt || {};
    const has = (arr, i, j) => (arr || []).some(([a, b]) => a === i && b === j);
    table.innerHTML = '';
    const cols = m.reduce((n, r) => Math.max(n, r.length), 0);
    const head = el('tr');
    head.appendChild(el('th'));
    for (let j = 0; j < cols; j++) head.appendChild(el('th', null, 'Sp. ' + j));
    table.appendChild(head);
    m.forEach((row, i) => {
      const tr = el('tr');
      tr.appendChild(el('th', null, 'Z. ' + i));
      row.forEach((v, j) => {
        const td = el('td');
        td.textContent = py.repr(v);
        if (opt.row === i) td.classList.add('is-row');
        if (has(opt.hl, i, j)) td.classList.add('is-hl');
        if (has(opt.neu, i, j)) td.classList.add('is-new');
        if (has(opt.alias, i, j)) td.classList.add('is-alias');
        if (opt.onClick) {
          td.tabIndex = 0;
          td.setAttribute('aria-label', 'Zeile ' + i + ', Spalte ' + j + ': ' + py.repr(v));
          td.addEventListener('click', () => opt.onClick(i, j));
          td.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.onClick(i, j); } });
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  }
  const I = (n) => py.int(n);
  const reprM = (m) => py.repr(m);

  /* ==========================================================
     Matrix-Generator
     ========================================================== */
  const EXPR = {
    '0': () => 0,
    'i * cols + j + 1': (i, j, c) => i * c + j + 1,
    'i * j': (i, j) => i * j,
    'i + j': (i, j) => i + j,
    '(i + 1) * (j + 1)': (i, j) => (i + 1) * (j + 1),
    'i': (i) => i,
    'j': (i, j) => j
  };

  function initGen() {
    const r = document.getElementById('gen-r');
    if (!r) return;
    const c = document.getElementById('gen-c');
    const e = document.getElementById('gen-e');
    const code = document.getElementById('gen-code');
    const table = document.getElementById('gen-mx');
    const note = document.getElementById('gen-note');
    for (let n = 1; n <= 6; n++) {
      [r, c].forEach((s) => { const o = el('option'); o.value = n; o.textContent = n; s.appendChild(o); });
    }
    r.value = 3; c.value = 4;
    let m, rows, cols;
    const update = (sel) => {
      rows = +r.value; cols = +c.value;
      const f = EXPR[e.value];
      m = [];
      for (let i = 0; i < rows; i++) { const z = []; for (let j = 0; j < cols; j++) z.push(I(f(i, j, cols))); m.push(z); }
      code.innerHTML = [
        highlight('rows, cols = ' + rows + ', ' + cols),
        highlight('matrix = [[' + e.value + ' for j in range(cols)] for i in range(rows)]'),
        highlight('# ' + reprM(m))
      ].join('\n');
      renderMatrix(table, m, {
        hl: sel ? [sel] : [],
        onClick: (i, j) => {
          update([i, j]);
          const expr = e.value.replace(/\bcols\b/g, cols).replace(/\bi\b/g, i).replace(/\bj\b/g, j);
          note.innerHTML = 'matrix[' + i + '][' + j + ']: Zeile <b>i = ' + i + '</b>, Spalte <b>j = ' + j + '</b>  →  ' + esc(e.value) + ' = ' + esc(expr) + ' = <b>' + esc(py.repr(m[i][j])) + '</b>';
        }
      });
      if (!sel) note.textContent = 'Tippe auf eine Zelle, um zu sehen, wie ihr Wert berechnet wurde.';
    };
    [r, c, e].forEach((s) => s.addEventListener('change', () => update()));
    update();
  }

  /* ==========================================================
     Kopierfalle
     ========================================================== */
  function initTrap() {
    const table = document.getElementById('trap-mx');
    if (!table) return;
    const note = document.getElementById('trap-note');
    const btns = document.querySelectorAll('#trap .seg button');
    let variant = 'ok', m, done = false;
    const build = () => {
      if (variant === 'ok') {
        m = [0, 1, 2].map(() => [I(0), I(0), I(0)]);
      } else {
        const z = [I(0), I(0), I(0)];
        m = [z, z, z]; // dreimal DIESELBE Liste – wie in Python
      }
      done = false;
      draw();
      note.innerHTML = variant === 'ok'
        ? 'Jede Zeile ist eine <b>eigene</b> Liste. Führe die Zuweisung aus und beobachte, was passiert.'
        : 'Hier gibt es nur <b>eine</b> Zeilen-Liste, die dreimal in der Matrix steckt. Führe die Zuweisung aus und beobachte, was passiert.';
    };
    const draw = () => {
      const changed = [];
      if (done) m.forEach((row, i) => row.forEach((v, j) => { if (v.v === 1) changed.push([i, j]); }));
      renderMatrix(table, m, variant === 'bad' ? { alias: changed.filter(([i]) => i > 0), neu: changed.filter(([i]) => i === 0) } : { neu: changed });
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      variant = b.dataset.v;
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      build();
    }));
    document.getElementById('trap-run').addEventListener('click', () => {
      m[0][0] = I(1);
      done = true;
      draw();
      note.innerHTML = variant === 'ok'
        ? '✓ Nur <code>matrix[0][0]</code> hat sich geändert – so soll es sein.'
        : '✗ Alle drei Zeilen haben sich geändert, obwohl nur <code>matrix[0][0]</code> gesetzt wurde! <code>matrix[0]</code>, <code>matrix[1]</code> und <code>matrix[2]</code> sind dieselbe Liste. Ergebnis: <code>' + esc(reprM(m)) + '</code>';
    });
    document.getElementById('trap-reset').addEventListener('click', build);
    build();
  }

  /* ==========================================================
     Matrix-Labor (Zugriff)
     ========================================================== */
  function initAccess() {
    const table = document.getElementById('acc-mx');
    if (!table) return;
    const fi = document.getElementById('acc-i'), fj = document.getElementById('acc-j'), fv = document.getElementById('acc-v');
    const log = document.getElementById('acc-log');
    let m;
    const line = (cls, t) => { const d = el('div', cls); d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    const draw = (o) => renderMatrix(table, m, Object.assign({ onClick: (i, j) => { fi.value = i; fj.value = j; fv.value = ''; run(); } }, o || {}));
    const reset = () => {
      m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((r) => r.map(I));
      log.innerHTML = '';
      line('c-muted', '>>> matrix = ' + reprM(m));
      draw();
    };
    const idx = (raw, n, what) => {
      const r = py.parse(raw);
      if (r.error) throw new Error(r.error);
      if (!(r.value && r.value.t === 'int')) throw new Error('TypeError: list indices must be integers or slices, not ' + py.type(r.value));
      let k = r.value.v;
      if (k < 0) k += n;
      if (k < 0 || k >= n) throw new Error('IndexError: list index out of range  (' + what + ' ' + r.value.v + ' gibt es nicht)');
      return k;
    };
    const run = () => {
      const ri = fi.value.trim(), rj = fj.value.trim(), rv = fv.value.trim();
      const target = 'matrix[' + ri + ']' + (rj !== '' ? '[' + rj + ']' : '');
      line('c-in', '>>> ' + (rv !== '' ? target + ' = ' + rv : 'print(' + target + ')'));
      try {
        const i = idx(ri, m.length, 'Zeile');
        if (rj === '') {
          if (rv !== '') {
            const v = py.parse(rv);
            if (v.error) throw new Error(v.error);
            if (!Array.isArray(v.value)) throw new Error('Hinweis: Einer ganzen Zeile sollte man eine Liste zuweisen, z. B. [0, 0, 0].');
            m[i] = v.value;
            line('c-muted', '# matrix ist jetzt ' + reprM(m));
            draw({ neu: m[i].map((_, j) => [i, j]) });
          } else {
            line('', py.repr(m[i]));
            line('c-muted', '# Ein Index liefert eine ganze Zeile – eine Liste.');
            draw({ row: i });
          }
          return;
        }
        const j = idx(rj, m[i].length, 'Spalte');
        if (rv !== '') {
          const v = py.parse(rv);
          if (v.error) throw new Error(v.error);
          m[i][j] = v.value;
          line('c-muted', '# matrix ist jetzt ' + reprM(m));
          draw({ neu: [[i, j]] });
        } else {
          line('', py.repr(m[i][j]));
          line('c-muted', '# Zeile ' + i + ' ist ' + py.repr(m[i]) + ', daraus Spalte ' + j);
          draw({ hl: [[i, j]], row: i });
        }
      } catch (e) {
        line('c-err', e.message);
        draw();
      }
    };
    document.getElementById('acc-run').addEventListener('click', run);
    document.getElementById('acc-reset').addEventListener('click', reset);
    [fi, fj, fv].forEach((f) => f.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    reset();
  }

  L.onInit(() => { initGen(); initTrap(); initAccess(); });

  /* ==========================================================
     Beispiel: Matrix mit Schleifen füllen
     ========================================================== */
  L.addExamples({
    fuellen: {
      memory: true,
      code:
`rows, cols = 2, 3
matrix = []
for i in range(rows):
    zeile = []
    for j in range(cols):
        zeile.append(i * cols + j + 1)
    matrix.append(zeile)
print(matrix)`,
      lineNotes: {
        1: '<b>Größe festlegen:</b> 2 Zeilen, 3 Spalten. Zwei Variablen werden in einer Zeile zugewiesen.',
        2: '<b>Leere äußere Liste:</b> Sie nimmt später die Zeilen auf.',
        3: '<b>Äußere Schleife:</b> Läuft einmal pro Zeile. <code>i</code> ist die Zeilennummer.',
        4: '<b>Neue, leere Zeile:</b> Steht innerhalb der äußeren Schleife – so bekommt jede Zeile ihre eigene Liste.',
        5: '<b>Innere Schleife:</b> Läuft einmal pro Spalte. <code>j</code> ist die Spaltennummer.',
        6: '<b>Wert berechnen und anhängen:</b> Hier fortlaufende Zahlen ab 1. Statt der Formel könnte auch 0 oder ein anderer Wert stehen.',
        7: '<b>Zeile fertig:</b> Die volle Zeile wird an die Matrix angehängt (eingerückt unter der äußeren, nicht der inneren Schleife!).',
        8: '<b>Ausgabe</b> der ganzen Matrix.'
      },
      inputs: [],
      run() {
        const rows = 2, cols = 3;
        const s = [
          { lines: [1], vars: { rows: ['2', 'int'], cols: ['3', 'int'] } },
          { lines: [2], vars: { matrix: ['[]', 'list'] } }
        ];
        const m = [];
        for (let i = 0; i < rows; i++) {
          s.push({ lines: [3], vars: { i: [String(i), 'int'] }, check: 'äußere Schleife: Zeile i = ' + i });
          const z = [];
          s.push({ lines: [4], vars: { zeile: ['[]', 'list'] } });
          for (let j = 0; j < cols; j++) {
            s.push({ lines: [5], vars: { j: [String(j), 'int'] }, check: '  innere Schleife: Spalte j = ' + j });
            const v = i * cols + j + 1;
            z.push(v);
            s.push({ lines: [6], vars: { zeile: ['[' + z.join(', ') + ']', 'list'] }, check: '  ' + i + ' * 3 + ' + j + ' + 1 = ' + v + '  →  anhängen' });
          }
          m.push(z.slice());
          s.push({ lines: [7], vars: { matrix: [JSON.stringify(m).replace(/,/g, ', '), 'list'] }, check: 'Zeile ' + i + ' an matrix anhängen' });
        }
        s.push({ lines: [8], print: JSON.stringify(m).replace(/,/g, ', ') });
        return s;
      }
    }
  });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Was gibt print(matrix[1][0]) aus?', code: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', opts: ['2', '4', '1', '[4, 5, 6]'], a: 1,
      ex: '<code>matrix[1]</code> ist die zweite Zeile <code>[4, 5, 6]</code>, daraus Index 0 → 4.' },
    { q: 'Was liefert matrix[2] bei derselben Matrix?', opts: ['9', '[7, 8, 9]', '[3, 6, 9]', '8'], a: 1,
      ex: 'Mit nur einem Index bekommt man eine ganze Zeile – eine Liste.' },
    { q: 'Wie viele Spalten hat die Matrix?', code: 'm = [[0, 0, 0, 0], [0, 0, 0, 0]]', opts: ['2', '4', '8', '3'], a: 1,
      ex: '<code>len(m)</code> = 2 Zeilen, <code>len(m[0])</code> = 4 Spalten.' },
    { q: 'Was erzeugt [x * 2 for x in range(4)]?', opts: ['[0, 2, 4, 6]', '[2, 4, 6, 8]', '[0, 1, 2, 3]', '[0, 2, 4, 6, 8]'], a: 0,
      ex: '<code>range(4)</code> liefert 0, 1, 2, 3 – jeder Wert wird verdoppelt.' },
    { q: 'Was passiert hier?', code: 'm = [[0] * 2] * 2\nm[0][0] = 5\nprint(m)', opts: ['[[5, 0], [0, 0]]', '[[5, 0], [5, 0]]', '[[5, 5], [0, 0]]', 'Fehlermeldung'], a: 1,
      ex: 'Die äußere Liste enthält zweimal <b>dieselbe</b> Zeile. Die Änderung erscheint deshalb in beiden Zeilen. Richtig wäre <code>[[0] * 2 for i in range(2)]</code>.' },
    { q: 'Welcher Ausdruck erzeugt eine Matrix mit 3 Zeilen und 2 Spalten voller Nullen?', opts: ['[[0 for i in range(3)] for j in range(2)]', '[[0 for j in range(2)] for i in range(3)]', '[0 for i in range(3)]', '[[0, 0, 0], [0, 0, 0]]'], a: 1,
      ex: 'Die <b>innere</b> Comprehension erzeugt eine Zeile mit 2 Werten (Spalten), die <b>äußere</b> wiederholt das 3-mal (Zeilen).' }
  ]);
})();
