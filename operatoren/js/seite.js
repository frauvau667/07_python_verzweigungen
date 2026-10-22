/* ==========================================================
   Inhalte der Lernseite „04 Operatoren“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, esc, pyFloat, setBool, B } = L.util;

  /* ==========================================================
     Rechnen wie Python
     ========================================================== */
  const RE_INT = /^\s*[+-]?\d+\s*$/;
  const RE_FLOAT = /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/;

  function num(raw) {
    if (RE_INT.test(raw)) return { t: 'int', v: parseInt(raw, 10) };
    if (RE_FLOAT.test(raw)) return { t: 'float', v: parseFloat(raw) };
    return null;
  }
  function fmt(r) { return r.t === 'int' ? String(r.v) : pyFloat(r.v); }

  // divmod für Kommazahlen genau wie in CPython (float_divmod)
  function pyDivmod(x, y) {
    let mod = x % y;               // entspricht fmod
    let div = (x - mod) / y;
    if (mod) {
      if ((y < 0) !== (mod < 0)) { mod += y; div -= 1; }
    } else {
      mod = y < 0 ? -0 : 0;
    }
    let floordiv;
    if (div) {
      floordiv = Math.floor(div);
      if (div - floordiv > 0.5) floordiv += 1;
    } else {
      floordiv = x / y < 0 ? -0 : 0;
    }
    return [floordiv, mod];
  }

  // Liefert { t, v, s } oder { err }
  function calc(op, a, b) {
    const both = a.t === 'int' && b.t === 'int';
    const T = both ? 'int' : 'float';
    const zero = 'ZeroDivisionError: division by zero';
    switch (op) {
      case '+': return { t: T, v: a.v + b.v };
      case '-': return { t: T, v: a.v - b.v };
      case '*': return { t: T, v: a.v * b.v };
      case '/': return b.v === 0 ? { err: zero } : { t: 'float', v: a.v / b.v };
      case '//': {
        if (b.v === 0) return { err: zero };
        if (both) return { t: 'int', v: Math.floor(a.v / b.v) };
        return { t: 'float', v: pyDivmod(a.v, b.v)[0] };
      }
      case '%': {
        if (b.v === 0) return { err: zero };
        if (both) return { t: 'int', v: a.v - b.v * Math.floor(a.v / b.v) };
        return { t: 'float', v: pyDivmod(a.v, b.v)[1] };
      }
      case '**': {
        if (a.v === 0 && b.v < 0) return { err: 'ZeroDivisionError: 0.0 cannot be raised to a negative power' };
        if (both && b.v >= 0) {
          if (b.v > 300) return { err: 'Ergebnis zu groß für die Anzeige' };
          return { t: 'int', s: (BigInt(a.v) ** BigInt(b.v)).toString() };
        }
        const r = Math.pow(a.v, b.v);
        if (Number.isNaN(r)) return { err: 'Ergebnis ist eine komplexe Zahl' };
        return { t: 'float', v: r };
      }
    }
    return { err: '?' };
  }

  function typeBadge(t) { return '<span class="mem-type type-' + t + ' ty">' + t + '</span>'; }

  /* ---------- Rechen-Labor ---------- */
  function initCalc() {
    const ia = document.getElementById('ca-a');
    const ib = document.getElementById('ca-b');
    const out = document.getElementById('ca-out');
    if (!ia) return;
    const update = () => {
      const a = num(ia.value), b = num(ib.value);
      out.innerHTML = '';
      if (!a || !b) {
        out.innerHTML = '<div><span class="res bad">Bitte zwei Zahlen eingeben (Kommazahlen mit Punkt).</span></div>';
        return;
      }
      ['+', '-', '*', '/', '//', '%', '**'].forEach((op) => {
        const r = calc(op, a, b);
        const row = el('div');
        const left = el('span');
        left.textContent = (a.v < 0 && op === '**' ? '(' + fmt(a) + ')' : fmt(a)) + ' ' + op + ' ' + fmt(b);
        const right = el('span', 'res' + (r.err ? ' bad' : ''));
        if (r.err) right.textContent = r.err;
        else right.innerHTML = esc(r.s != null ? r.s : r.t === 'int' ? String(r.v) : pyFloat(r.v)) + typeBadge(r.t);
        row.append(left, right);
        out.appendChild(row);
      });
    };
    [ia, ib].forEach((i) => i.addEventListener('input', update));
    update();
  }

  /* ---------- Texte ---------- */
  function initStrOps() {
    const it = document.getElementById('so-t');
    const inum = document.getElementById('so-n');
    const out = document.getElementById('so-out');
    if (!it) return;
    const update = () => {
      const t = it.value, n = inum.value.trim();
      const rows = [];
      rows.push(["'" + t + "' + '" + t + "'", "'" + t + t + "'", 'str']);
      if (RE_INT.test(n)) {
        const k = parseInt(n, 10);
        rows.push(["'" + t + "' * " + k, k > 0 ? "'" + t.repeat(Math.min(k, 50)) + (k > 50 ? '…' : '') + "'" : "''", 'str']);
      } else {
        rows.push(["'" + t + "' * " + n, 'TypeError: Texte kann man nur mit ganzen Zahlen vervielfachen', null]);
      }
      rows.push(["'" + t + "' + " + (n || '?'), 'TypeError: can only concatenate str (not "int") to str', null]);
      out.innerHTML = '';
      rows.forEach(([l, r, ty]) => {
        const row = el('div');
        const a = el('span'); a.textContent = l;
        const b = el('span', 'res' + (ty ? '' : ' bad'));
        b.innerHTML = esc(r) + (ty ? typeBadge(ty) : '');
        row.append(a, b);
        out.appendChild(row);
      });
    };
    [it, inum].forEach((i) => i.addEventListener('input', update));
    update();
  }

  /* ---------- Schritt-für-Schritt-Auswertung ---------- */
  const EVALS = [
    { e: '2 + 3 * 4', s: [['2 + <mark>3 * 4</mark>', 'Punkt vor Strich: zuerst *'], ['<mark>2 + 12</mark>', 'jetzt +'], ['14', 'Ergebnis']] },
    { e: '(2 + 3) * 4', s: [['<mark>(2 + 3)</mark> * 4', 'Klammern zuerst'], ['<mark>5 * 4</mark>', ''], ['20', 'Ergebnis']] },
    { e: '10 - 4 / 2', s: [['10 - <mark>4 / 2</mark>', '/ ist Punktrechnung'], ['<mark>10 - 2.0</mark>', '/ liefert immer eine Kommazahl'], ['8.0', 'Ergebnis (float!)']] },
    { e: '2 ** 3 * 2', s: [['<mark>2 ** 3</mark> * 2', 'Potenz vor Punktrechnung'], ['<mark>8 * 2</mark>', ''], ['16', 'Ergebnis']] },
    { e: '17 // 5 + 17 % 5', s: [['<mark>17 // 5</mark> + 17 % 5', '// und % sind Punktrechnung'], ['3 + <mark>17 % 5</mark>', 'Rest von 17 : 5'], ['<mark>3 + 2</mark>', ''], ['5', 'Ergebnis']] },
    { e: '(4 + 6) / 2 * 3', s: [['<mark>(4 + 6)</mark> / 2 * 3', 'Klammern zuerst'], ['<mark>10 / 2</mark> * 3', 'gleiche Stufe: von links nach rechts'], ['<mark>5.0 * 3</mark>', ''], ['15.0', 'Ergebnis (float wegen /)']] },
    { e: '3 + 4 > 6 and 2 * 2 == 5', s: [['3 + 4 &gt; 6 and <mark>2 * 2</mark> == 5', 'Rechnen vor Vergleichen'], ['<mark>3 + 4</mark> &gt; 6 and 4 == 5', ''], ['<mark>7 &gt; 6</mark> and <mark>4 == 5</mark>', 'Vergleiche vor and'], ['<mark>True and False</mark>', ''], ['False', 'Ergebnis']] }
  ];

  function initEval() {
    const sel = document.getElementById('ev-sel');
    const out = document.getElementById('ev-out');
    if (!sel) return;
    EVALS.forEach((x, i) => { const o = el('option'); o.value = i; o.textContent = x.e; sel.appendChild(o); });
    let shown = 1;
    const render = () => {
      const x = EVALS[sel.value];
      out.innerHTML = '';
      const start = el('div', 'row');
      start.innerHTML = esc(x.e) + '<span class="why">Ausgangsausdruck</span>';
      out.appendChild(start);
      x.s.forEach((st, i) => {
        const r = el('div', 'row' + (i < shown ? '' : ' is-hidden'));
        r.innerHTML = '= ' + st[0] + (st[1] ? '<span class="why">' + st[1] + '</span>' : '');
        out.appendChild(r);
      });
      document.getElementById('ev-next').disabled = shown >= x.s.length;
    };
    sel.addEventListener('change', () => { shown = 1; render(); });
    document.getElementById('ev-next').addEventListener('click', () => { shown++; render(); });
    document.getElementById('ev-all').addEventListener('click', () => { shown = EVALS[sel.value].s.length; render(); });
    render();
  }

  /* ---------- x == 4 and y == 5 ---------- */
  function initCombo() {
    const ix = document.getElementById('cb-x');
    const iy = document.getElementById('cb-y');
    const out = document.getElementById('cb-out');
    if (!ix) return;
    const span = (v) => '<span class="' + (v ? 'ok' : 'bad') + '">' + B(v) + '</span>';
    const update = () => {
      const x = num(ix.value), y = num(iy.value);
      if (!x || !y) { out.textContent = 'Bitte zwei Zahlen eingeben.'; return; }
      const a = x.v === 4, b = y.v === 5;
      out.innerHTML =
        'x == 4  →  ' + esc(fmt(x)) + ' == 4  →  ' + span(a) + '<br>' +
        'y == 5  →  ' + esc(fmt(y)) + ' == 5  →  ' + span(b) + '<br><br>' +
        'x == 4 <b>and</b> y == 5  →  ' + B(a) + ' and ' + B(b) + '  →  ' + span(a && b) + '<br>' +
        'x == 4 <b>or</b> y == 5  →  ' + B(a) + ' or ' + B(b) + '  →  ' + span(a || b) + '<br>' +
        '<b>not</b> x == 4  →  not ' + B(a) + '  →  ' + span(!a);
    };
    [ix, iy].forEach((i) => i.addEventListener('input', update));
    update();
  }

  L.onInit(() => { initCalc(); initStrOps(); initEval(); initCombo(); });

  /* ==========================================================
     Beispiele
     ========================================================== */
  L.addExamples({

    /* ---------- Sekunden umrechnen ---------- */
    zeit: {
      code:
`sekunden = int(input("Wie viele Sekunden? "))
minuten = sekunden // 60
rest = sekunden % 60
print(f"{sekunden} Sekunden sind {minuten} Minuten und {rest} Sekunden.")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: sekunden', lines: [1], info: '<b>Eingabe:</b> Eine ganze Zahl wird eingelesen.' },
        { t: 'stmt', id: 'min', text: 'minuten = sekunden // 60', lines: [2],
          info: '<b>Ganzzahlige Division:</b> <code>//</code> berechnet, wie oft 60 <b>ganz</b> in die Sekunden passt – das sind die vollen Minuten. Nachkommastellen fallen weg.' },
        { t: 'stmt', id: 'rest', text: 'rest = sekunden % 60', lines: [3],
          info: '<b>Modulo:</b> <code>%</code> liefert den <b>Rest</b>, der übrig bleibt, wenn man die vollen Minuten abzieht.' },
        { t: 'stmt', id: 'out', text: 'Ausgabe: sekunden, minuten, rest', lines: [4], info: '<b>Ausgabe</b> des Ergebnisses.' }
      ],
      inputs: [{ name: 'sekunden', type: 'int', value: '200', min: 0, max: 1000000 }],
      run(v) {
        const s = v.sekunden, m = Math.floor(s / 60), r = s % 60;
        return [
          { id: 'in', ask: ['Wie viele Sekunden? ', s], vars: { sekunden: s } },
          { id: 'min', check: 'sekunden // 60  →  ' + s + ' // 60  →  ' + m, vars: { minuten: m } },
          { id: 'rest', check: 'sekunden % 60  →  ' + s + ' % 60  →  ' + r + '   (denn ' + m + ' · 60 = ' + m * 60 + ', Rest ' + r + ')', vars: { rest: r } },
          { id: 'out', print: s + ' Sekunden sind ' + m + ' Minuten und ' + r + ' Sekunden.' }
        ];
      }
    },

    /* ---------- Zuweisungsoperatoren ---------- */
    punkte: {
      memory: true,
      code:
`punkte = 10
punkte += 5
punkte -= 3
punkte *= 2
punkte //= 5
punkte **= 2
punkte %= 7
punkte /= 2
print(punkte)`,
      lineNotes: {
        1: '<b>Zuweisung:</b> <code>punkte</code> bekommt den Startwert 10.',
        2: '<code>punkte += 5</code> ist die Kurzform von <code>punkte = punkte + 5</code>: 10 + 5 = <b>15</b>.',
        3: '<code>punkte -= 3</code> bedeutet <code>punkte = punkte - 3</code>: 15 − 3 = <b>12</b>.',
        4: '<code>punkte *= 2</code> bedeutet <code>punkte = punkte * 2</code>: 12 · 2 = <b>24</b>.',
        5: '<code>punkte //= 5</code> bedeutet <code>punkte = punkte // 5</code>: 24 // 5 = <b>4</b> (5 passt 4-mal ganz in 24).',
        6: '<code>punkte **= 2</code> bedeutet <code>punkte = punkte ** 2</code>: 4² = <b>16</b>.',
        7: '<code>punkte %= 7</code> bedeutet <code>punkte = punkte % 7</code>: 16 : 7 = 2 Rest <b>2</b>.',
        8: '<code>punkte /= 2</code> bedeutet <code>punkte = punkte / 2</code>: 2 / 2 = <b>1.0</b>. Weil <code>/</code> immer eine Kommazahl liefert, ändert sich der Datentyp zu <b>float</b>!',
        9: '<b>Ausgabe</b> des aktuellen Werts.'
      },
      inputs: [],
      run() {
        const st = [
          [1, '10', 'int', 'punkte = 10'],
          [2, '15', 'int', 'punkte = punkte + 5  →  10 + 5  →  15'],
          [3, '12', 'int', 'punkte = punkte - 3  →  15 - 3  →  12'],
          [4, '24', 'int', 'punkte = punkte * 2  →  12 * 2  →  24'],
          [5, '4', 'int', 'punkte = punkte // 5  →  24 // 5  →  4'],
          [6, '16', 'int', 'punkte = punkte ** 2  →  4 ** 2  →  16'],
          [7, '2', 'int', 'punkte = punkte % 7  →  16 % 7  →  2'],
          [8, '1.0', 'float', 'punkte = punkte / 2  →  2 / 2  →  1.0  (jetzt float!)']
        ].map(([l, v, t, c]) => ({ lines: [l], vars: { punkte: [v, t] }, check: c }));
        st.push({ lines: [9], print: '1.0' });
        return st;
      }
    }
  });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Was ergibt 20 // 6?', opts: ['3', '3.33', '2', '4'], a: 0,
      ex: '<code>//</code> ist die ganzzahlige Division: 6 passt 3-mal ganz in 20.' },
    { q: 'Was ergibt 20 % 6?', opts: ['3', '2', '0', '3.33'], a: 1,
      ex: '<code>%</code> liefert den Rest: 20 − 3 · 6 = 2.' },
    { q: 'Was ergibt 8 / 2?', opts: ['4', '4.0', '"4"', '16'], a: 1,
      ex: '<code>/</code> liefert in Python <b>immer</b> eine Kommazahl – auch wenn die Division aufgeht.' },
    { q: 'Was ergibt 2 + 3 * 4?', opts: ['20', '14', '24', '9'], a: 1,
      ex: 'Punkt vor Strich: zuerst 3 · 4 = 12, dann 2 + 12 = 14.' },
    { q: 'Wie schreibt man 2³ in Python?', opts: ['2 ^ 3', '2 ** 3', '2 * 3', 'pow 2 3'], a: 1,
      ex: 'Potenzen schreibt man mit <code>**</code>. <code>^</code> ist in Python etwas ganz anderes.' },
    { q: 'Welchen Wert hat x am Ende?', code: 'x = 5\nx += 3\nx *= 2', opts: ['10', '16', '11', '8'], a: 1,
      ex: '5 + 3 = 8, danach 8 · 2 = 16.' },
    { q: 'Was ergibt True and False?', opts: ['True', 'False'], a: 1,
      ex: '<code>and</code> ist nur True, wenn <b>beide</b> Seiten True sind.' },
    { q: 'Was ergibt not 3 > 2 or 1 == 1?', opts: ['True', 'False'], a: 0,
      ex: 'Zuerst die Vergleiche: <code>3 > 2</code> ist True, <code>1 == 1</code> ist True. Dann <code>not True</code> = False. Zuletzt <code>False or True</code> = <b>True</b>.' }
  ]);
})();
