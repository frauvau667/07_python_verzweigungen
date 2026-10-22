/* ==========================================================
   Lernseite – gemeinsamer Programmkern
   ----------------------------------------------------------
   Diese Datei ist auf allen Lernseiten gleich. Die Inhalte
   (Beispiele, Quiz, Zusatz-Werkzeuge) stehen in js/seite.js.

   Ein Beispiel besteht aus:
     code       – Python-Quelltext (Zeilen ab 1 gezählt)
     diagram    – (optional) Struktogramm aus Bausteinen:
                  stmt    { t:'stmt', id, text, lines, info, tag?, jump? }   tag: 'E' | 'V' | 'A'
                  empty   { t:'empty', id, lines, info }
                  if      { t:'if', id, cond, lines, info, split?, yes:[…], no:[…] }
                  while   { t:'while', id, head, lines, info, body:[…] }
                  dowhile { t:'dowhile', id, lines, info, body:[…], footId, foot, footLines, footInfo }
     memory     – true: Variablen werden als Speicherkästchen mit Datentyp angezeigt
     lineNotes  – Erklärungen zu einzelnen Codezeilen { 3: '…' }
     inputs     – Eingabefelder [{ name, type:'int'|'float'|'text'|'select', value, options?, min?, max? }]
     run(v)     – liefert die Schritte:
                  { id?, lines?, ask:[prompt, wert]?, check?, print?, err?, note?,
                    vars:{ name: wert | [wert, typ] }?, iter? }
   ========================================================== */
window.Lernseite = (function () {
  'use strict';

  const EXAMPLES = {};
  let QUIZ = [];
  const HOOKS = [];

  /* ---------- Syntax-Hervorhebung ---------- */
  const KW = new Set(['if', 'elif', 'else', 'while', 'for', 'in', 'break', 'continue', 'and', 'or', 'not',
    'True', 'False', 'None', 'is', 'import', 'from', 'pass', 'match', 'case', 'def', 'return']);
  const FN = new Set(['print', 'input', 'int', 'float', 'str', 'bool', 'complex', 'len', 'range', 'type', 'round']);

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(line) {
    const re = /(#.*$)|(f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*')|([A-Za-z_äöüÄÖÜß][A-Za-z0-9_äöüÄÖÜß]*)|(\d+(?:\.\d+)?j?)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += '<span class="t-com">' + esc(m[1]) + '</span>';
      else if (m[2]) {
        let s = esc(m[2]);
        if (m[2][0] === 'f') s = '<span class="t-kw">f</span>' + s.slice(1).replace(/\{([^}]*)\}/g, '<span class="t-fx">{$1}</span>');
        out += '<span class="t-str">' + s + '</span>';
      } else if (m[3]) {
        if (KW.has(m[3])) out += '<span class="t-kw">' + m[3] + '</span>';
        else if (FN.has(m[3])) out += '<span class="t-fn">' + m[3] + '</span>';
        else out += esc(m[3]);
      } else if (m[4]) out += '<span class="t-num">' + m[4] + '</span>';
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  }

  /* ---------- Hilfsfunktionen ---------- */
  const B = (v) => (v ? 'True' : 'False');
  const q = (s) => '"' + s + '"';

  // Gibt eine Kommazahl so aus, wie Python es tun würde (3.0 statt 3, 1e-05 statt 1e-5)
  function pyFloat(x) {
    if (Number.isNaN(x)) return 'nan';
    if (!Number.isFinite(x)) return x > 0 ? 'inf' : '-inf';
    const a = Math.abs(x);
    if (x !== 0 && (a >= 1e16 || a < 1e-4)) {
      return x.toExponential().replace(/\.0+e/, 'e').replace(/e([+-])(\d)$/, 'e$10$2');
    }
    if (Number.isInteger(x)) return x.toFixed(1);
    return String(x);
  }

  // round(x, n) genau wie in Python: gerundet wird der tatsächlich gespeicherte Wert,
  // bei einem exakten Gleichstand (…5) zur geraden Ziffer
  function pyRound(x, n) {
    n = n || 0;
    if (!Number.isFinite(x)) return x;
    const exact = Math.abs(x).toFixed(Math.min(100, n + 60));
    const cut = exact.indexOf('.') + 1 + n;
    const rest = exact.slice(cut);
    let r = Number(x.toFixed(n));
    if (/^50*$/.test(rest)) {
      const down = Number((Math.sign(x) * Number(exact.slice(0, n ? cut : cut - 1))).toFixed(n));
      const up = Number((down + Math.sign(x) * Math.pow(10, -n)).toFixed(n));
      const lastDigit = (v) => Math.round(Math.abs(v) * Math.pow(10, n)) % 2;
      r = lastDigit(down) === 0 ? down : up;
    }
    return r;
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function fmtLines(lines) {
    if (!lines.length) return '';
    return (lines.length === 1 ? 'Zeile ' : 'Zeilen ') + lines.join(', ');
  }

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEEDS = { langsam: 1300, normal: 750, schnell: 280 };


  /* ==========================================================
     Python-Werte im Browser nachbilden
     int → { t:'int', v }, float → { t:'float', v }, str → JS-String,
     bool → true/false, None → null, list → Array, dict → Map
     ========================================================== */
  const py = {
    int: (v) => ({ t: 'int', v: v }),
    float: (v) => ({ t: 'float', v: v }),
    isNum: (x) => x !== null && typeof x === 'object' && !Array.isArray(x) && !(x instanceof Map) && (x.t === 'int' || x.t === 'float'),
    type(x) {
      if (x === null) return 'NoneType';
      if (typeof x === 'boolean') return 'bool';
      if (typeof x === 'string') return 'str';
      if (Array.isArray(x)) return 'list';
      if (x instanceof Map) return 'dict';
      return x.t;
    },
    strRepr(s) {
      const q = s.includes("'") && !s.includes('"') ? '"' : "'";
      return q + s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(new RegExp(q, 'g'), '\\' + q) + q;
    },
    repr(x) {
      if (x === null) return 'None';
      if (typeof x === 'boolean') return x ? 'True' : 'False';
      if (typeof x === 'string') return py.strRepr(x);
      if (Array.isArray(x)) return '[' + x.map(py.repr).join(', ') + ']';
      if (x instanceof Map) return '{' + Array.from(x.entries()).map(([k, v]) => py.repr(k) + ': ' + py.repr(v)).join(', ') + '}';
      return x.t === 'int' ? String(x.v) : pyFloat(x.v);
    },
    str(x) { return typeof x === 'string' ? x : py.repr(x); },
    num(x) { return typeof x === 'boolean' ? (x ? 1 : 0) : x.v; },
    eq(a, b) {
      const na = py.isNum(a) || typeof a === 'boolean', nb = py.isNum(b) || typeof b === 'boolean';
      if (na && nb) return py.num(a) === py.num(b);
      if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => py.eq(x, b[i]));
      return a === b;
    },
    // Vergleich für sort(), min(), max(); wirft TypeError wie Python
    cmp(a, b) {
      const na = py.isNum(a) || typeof a === 'boolean', nb = py.isNum(b) || typeof b === 'boolean';
      if (na && nb) return py.num(a) - py.num(b);
      if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
      throw new Error("TypeError: '<' not supported between instances of '" + py.type(a) + "' and '" + py.type(b) + "'");
    },
    key(x) { return typeof x === 'string' ? 's:' + x : py.isNum(x) ? 'n:' + x.v : typeof x === 'boolean' ? 'n:' + (x ? 1 : 0) : 'x:' + py.repr(x); },
    // Wert aus einer Eingabe lesen, wie er im Python-Code stehen würde
    parse(raw) {
      const s = String(raw).trim();
      if (!s) return { error: 'SyntaxError: Es fehlt ein Wert.' };
      if (/^[+-]?\d+$/.test(s)) return { value: py.int(parseInt(s, 10)) };
      if (/^[+-]?(\d+\.\d*|\.\d+|\d+(\.\d*)?[eE][+-]?\d+)$/.test(s)) return { value: py.float(parseFloat(s)) };
      if (s === 'True' || s === 'False') return { value: s === 'True' };
      if (s === 'None') return { value: null };
      const m = s.match(/^(['"])(.*)\1$/s);
      if (m && !m[2].includes(m[1])) return { value: m[2].replace(/\\n/g, '\n').replace(/\\t/g, '\t') };
      if (s[0] === '[' && s[s.length - 1] === ']') {
        const inner = s.slice(1, -1).trim();
        if (!inner) return { value: [] };
        const parts = py.splitTop(inner);
        const out = [];
        for (const p of parts) { const r = py.parse(p); if (r.error) return r; out.push(r.value); }
        return { value: out };
      }
      if (/^[+-]?\d+,\d+$/.test(s)) return { error: 'Für Kommazahlen bitte einen Punkt verwenden, z. B. ' + s.replace(',', '.') + '.' };
      if (/^[A-Za-z_äöüÄÖÜß]\w*$/.test(s)) return { error: "NameError: name '" + s + "' is not defined", hint: 'Texte müssen in Anführungszeichen stehen: "' + s + '"' };
      if (/^['"]/.test(s)) return { error: 'SyntaxError: Der Text braucht am Anfang und am Ende dasselbe Anführungszeichen.' };
      return { error: 'SyntaxError: invalid syntax' };
    },
    splitTop(s) {
      const parts = []; let depth = 0, quote = null, cur = '';
      for (const ch of s) {
        if (quote) { cur += ch; if (ch === quote) quote = null; continue; }
        if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
        if (ch === '[' || ch === '{') depth++;
        if (ch === ']' || ch === '}') depth--;
        if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
        cur += ch;
      }
      parts.push(cur);
      return parts.map((x) => x.trim());
    }
  };

  /* ==========================================================
     Struktogramm zeichnen
     ========================================================== */
  function svgLines(points) {
    return '<svg class="ns-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<polyline points="' + points + '"/></svg>';
  }

  function makeClickable(st, node, id, lines, info) {
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.dataset.id = id;
    if (!st.cells[id]) st.cells[id] = { els: [], lines: lines || [], info: info || '' };
    st.cells[id].els.push(node);
    node.addEventListener('click', (e) => { e.stopPropagation(); selectCell(st, id); });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); selectCell(st, id); }
    });
  }

  const TAGS = { E: 'Eingabe', V: 'Verarbeitung', A: 'Ausgabe' };

  function renderSeq(st, items, parent) {
    items.forEach((item) => parent.appendChild(renderItem(st, item)));
  }

  function renderItem(st, item) {
    if (item.t === 'stmt') {
      const c = el('div', 'ns-cell ns-stmt' + (item.jump ? ' ns-jump' : ''));
      const txt = el('span', 'ns-text');
      txt.textContent = item.text;
      c.appendChild(txt);
      if (item.tag) {
        const tg = el('span', 'ns-tag tag-' + item.tag, item.tag);
        tg.title = TAGS[item.tag];
        c.appendChild(tg);
      }
      c.setAttribute('aria-label', item.text + (item.tag ? ' (' + TAGS[item.tag] + ')' : ''));
      makeClickable(st, c, item.id, item.lines, item.info);
      return c;
    }
    if (item.t === 'empty') {
      const c = el('div', 'ns-cell ns-empty', '∅');
      c.setAttribute('aria-label', 'Leerer Zweig');
      makeClickable(st, c, item.id, item.lines, item.info);
      return c;
    }
    if (item.t === 'if') {
      const split = item.split || 50;
      const wrap = el('div', 'ns-if');
      const cond = el('div', 'ns-cell ns-cond',
        svgLines('0,0 ' + split + ',100 100,0') +
        '<span class="cond-text"></span><span class="lbl lbl-t">Wahr</span><span class="lbl lbl-f">Falsch</span>');
      cond.querySelector('.cond-text').textContent = item.cond;
      cond.setAttribute('aria-label', 'Bedingung: ' + item.cond);
      makeClickable(st, cond, item.id, item.lines, item.info);
      const br = el('div', 'ns-branches');
      br.style.gridTemplateColumns = split + '% minmax(0, 1fr)';
      const yes = el('div', 'ns-col'), no = el('div', 'ns-col');
      renderSeq(st, item.yes, yes);
      renderSeq(st, item.no, no);
      br.append(yes, no);
      wrap.append(cond, br);
      return wrap;
    }
    if (item.t === 'while') {
      const wrap = el('div', 'ns-loop');
      const head = el('div', 'ns-cell ns-loophead');
      head.textContent = item.head;
      makeClickable(st, head, item.id, item.lines, item.info);
      const inner = el('div', 'ns-loop-inner');
      const bar = el('div', 'ns-cell ns-loopbar');
      makeClickable(st, bar, item.id, item.lines, item.info);
      const body = el('div', 'ns-col');
      renderSeq(st, item.body, body);
      inner.append(bar, body);
      wrap.append(head, inner);
      return wrap;
    }
    if (item.t === 'dowhile') {
      const wrap = el('div', 'ns-loop is-foot');
      const inner = el('div', 'ns-loop-inner');
      const bar = el('div', 'ns-cell ns-loopbar');
      makeClickable(st, bar, item.id, item.lines, item.info);
      const body = el('div', 'ns-col');
      renderSeq(st, item.body, body);
      inner.append(bar, body);
      const foot = el('div', 'ns-cell ns-loopfoot');
      foot.textContent = item.foot;
      makeClickable(st, foot, item.footId, item.footLines, item.footInfo);
      wrap.append(inner, foot);
      return wrap;
    }
    throw new Error('Unbekannter Baustein: ' + item.t);
  }

  /* ==========================================================
     Beispiel aufbauen
     ========================================================== */
  function defaultInfo(ex) {
    return ex.diagram
      ? '<p>Tippe auf ein <b>Feld im Struktogramm</b> oder auf eine <b>Codezeile</b>, um zu sehen, was zusammengehört.</p>'
      : '<p>Tippe auf eine <b>Codezeile</b>, um eine Erklärung zu sehen.</p>';
  }

  function buildExample(host) {
    const key = host.dataset.example;
    const ex = EXAMPLES[key];
    if (!ex) { host.textContent = 'Beispiel „' + key + '“ nicht gefunden.'; return; }
    const st = { key, ex, host, cells: {}, lines: [], codeLines: ex.code.split('\n'), timer: null, steps: null, pos: 0, vars: {}, iter: null };

    const grid = el('div', 'ex-grid' + (ex.diagram ? '' : ' no-dia'));
    st.info = el('div', 'info', defaultInfo(ex));
    st.info.setAttribute('aria-live', 'polite');

    // Struktogramm
    let pDia = null;
    if (ex.diagram) {
      pDia = el('div', 'panel ex-diagram');
      pDia.appendChild(el('div', 'panel-title', '<span>Struktogramm</span>'));
      const scroll = el('div', 'ns-scroll');
      const ns = el('div', 'ns');
      if (ex.minWidth) ns.style.setProperty('--minw', ex.minWidth + 'px');
      renderSeq(st, ex.diagram, ns);
      scroll.appendChild(ns);
      pDia.appendChild(scroll);
      pDia.appendChild(st.info);
    }

    // Code
    const pCode = el('div', 'panel ex-code');
    const title = el('div', 'panel-title', '<span>Python-Code</span>');
    const copy = el('button', 'btn small', 'Kopieren');
    copy.type = 'button';
    copy.addEventListener('click', () => copyText(ex.code, copy));
    title.appendChild(copy);
    pCode.appendChild(title);
    const pre = el('pre', 'code');
    const codeEl = el('code', 'code-inner');
    st.codeLines.forEach((line, i) => {
      const n = i + 1;
      const ln = el('span', 'ln', '<span class="no">' + n + '</span>' + (highlight(line) || ' '));
      ln.dataset.line = n;
      ln.tabIndex = 0;
      ln.addEventListener('click', () => selectLine(st, n));
      ln.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectLine(st, n); }
      });
      st.lines[n] = ln;
      codeEl.appendChild(ln);
    });
    pre.appendChild(codeEl);
    pCode.appendChild(pre);
    if (!ex.diagram) pCode.appendChild(st.info);

    // Ausprobieren
    const pRun = el('div', 'panel ex-run');
    pRun.appendChild(el('div', 'panel-title', '<span>' + (ex.memory ? 'Ausführen &amp; Speicher beobachten' : 'Ausprobieren') + '</span>'));
    const form = el('form', 'run-form');
    form.noValidate = true;
    st.fields = {};
    (ex.inputs || []).forEach((inp) => {
      const id = 'f-' + key + '-' + inp.name;
      const f = el('div', 'field');
      const lab = el('label', null);
      lab.htmlFor = id;
      lab.textContent = inp.label || inp.name;
      let field;
      if (inp.type === 'select') {
        field = el('select');
        inp.options.forEach((o) => { const opt = el('option'); opt.value = o; opt.textContent = o; field.appendChild(opt); });
        field.value = inp.value;
      } else {
        field = el('input');
        field.type = 'text';
        field.value = inp.value;
        field.autocomplete = 'off';
        field.setAttribute('autocapitalize', 'off');
        field.setAttribute('autocorrect', 'off');
        field.spellcheck = false;
        if (inp.type === 'int') field.inputMode = 'numeric';
        if (inp.type === 'float') field.inputMode = 'decimal';
      }
      field.id = id;
      field.addEventListener('input', () => { stopRun(st); st.steps = null; });
      field.addEventListener('change', () => { stopRun(st); st.steps = null; });
      st.fields[inp.name] = { el: field, type: inp.type, min: inp.min, max: inp.max };
      f.append(lab, field);
      form.appendChild(f);
    });

    const sp = el('div', 'speed');
    const spId = 'speed-' + key;
    sp.innerHTML = '<label for="' + spId + '">Tempo</label>';
    const sel = el('select');
    sel.id = spId;
    [['langsam', 'Langsam'], ['normal', 'Normal'], ['schnell', 'Schnell']].forEach(([v, t]) => {
      const o = el('option'); o.value = v; o.textContent = t; sel.appendChild(o);
    });
    sel.value = reducedMotion ? 'schnell' : 'normal';
    st.speed = sel;
    sp.appendChild(sel);
    form.appendChild(sp);

    const btns = el('div', 'run-buttons');
    const runBtn = el('button', 'btn primary', '▶ Ausführen');
    runBtn.type = 'submit';
    const stepBtn = el('button', 'btn', 'Schritt ⏭');
    stepBtn.type = 'button';
    const resetBtn = el('button', 'btn', 'Zurücksetzen');
    resetBtn.type = 'button';
    btns.append(runBtn, stepBtn, resetBtn);
    form.appendChild(btns);
    st.runBtn = runBtn;
    form.addEventListener('submit', (e) => { e.preventDefault(); toggleRun(st); });
    stepBtn.addEventListener('click', () => singleStep(st));
    resetBtn.addEventListener('click', () => resetExample(st));
    pRun.appendChild(form);

    st.varsBox = el('div', ex.memory ? 'memory' : 'vars');
    st.varsBox.setAttribute('aria-live', 'polite');
    pRun.appendChild(st.varsBox);
    st.console = el('div', 'console');
    st.console.setAttribute('aria-live', 'polite');
    st.console.setAttribute('aria-label', 'Programmausgabe');
    pRun.appendChild(st.console);
    consolePlaceholder(st);
    renderVars(st, []);

    if (pDia) grid.append(pDia, pCode, pRun);
    else grid.append(pCode, pRun);
    host.appendChild(grid);
  }

  /* ---------- Markieren ---------- */
  function clearClass(st, cls) {
    st.host.querySelectorAll('.' + cls).forEach((e) => e.classList.remove(cls));
  }

  function markCell(st, c, cls) {
    c.els.forEach((e) => e.classList.add(cls));
    c.lines.forEach((n) => st.lines[n] && st.lines[n].classList.add(cls));
  }

  function isVisible(node) {
    const r = node.getBoundingClientRect();
    return r.top >= 50 && r.bottom <= window.innerHeight;
  }

  function reveal(node) {
    if (node && !isVisible(node)) node.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  }

  function showInfo(st, html, lines) {
    st.info.innerHTML = '<p>' + html + '</p>' +
      '<span class="info-lines">' + (lines && lines.length ? fmtLines(lines) : 'Keine Codezeile – hier passiert nichts.') + '</span>';
    st.info.classList.add('is-sel');
  }

  function selectCell(st, id) {
    const c = st.cells[id];
    clearClass(st, 'is-sel');
    markCell(st, c, 'is-sel');
    showInfo(st, c.info, c.lines);
    if (c.lines.length) reveal(st.lines[c.lines[0]]);
  }

  function selectLine(st, n) {
    clearClass(st, 'is-sel');
    const hits = Object.values(st.cells).filter((c) => c.lines.includes(n));
    st.lines[n].classList.add('is-sel');
    st.info.classList.add('is-sel');
    if (!hits.length) {
      const notes = st.ex.lineNotes || {};
      if (notes[n]) st.info.innerHTML = '<p>' + notes[n] + '</p><span class="info-lines">Zeile ' + n + '</span>';
      else if (!st.codeLines[n - 1].trim()) st.info.innerHTML = '<p><b>Zeile ' + n + ':</b> Eine Leerzeile. Sie hat keine Wirkung, macht den Code aber übersichtlicher.</p>';
      else st.info.innerHTML = '<p><b>Zeile ' + n + ':</b> Diese Zeile hat kein eigenes Feld im Struktogramm.</p>';
      return;
    }
    hits.forEach((c) => markCell(st, c, 'is-sel'));
    showInfo(st, hits[0].info, hits[0].lines);
    reveal(hits[0].els[0]);
  }

  /* ---------- Konsole & Variablen ---------- */
  function consolePlaceholder(st) {
    st.console.innerHTML = '<span class="c-line c-muted">Drücke „Ausführen“ oder gehe mit „Schritt“ selbst weiter. Hier erscheint dann die Ausgabe des Programms.</span>';
  }

  function cLine(st, parts) {
    const line = el('span', 'c-line');
    parts.forEach(([cls, text]) => {
      const s = el('span', cls || null);
      s.textContent = text;
      line.appendChild(s);
    });
    st.console.appendChild(line);
    st.console.scrollTop = st.console.scrollHeight;
  }

  function renderVars(st, changed) {
    const box = st.varsBox;
    const names = Object.keys(st.vars);
    if (st.ex.memory) {
      box.innerHTML = '';
      const frame = (title, vars, cls, emptyText) => {
        const wrap = el('div', 'mem-frame' + (cls ? ' ' + cls : ''));
        wrap.appendChild(el('div', 'mem-title', title));
        const grid = el('div', 'mem-grid');
        const keys = Object.keys(vars);
        if (!keys.length) grid.appendChild(el('span', 'placeholder', emptyText));
        keys.forEach((k) => {
          const [v, t] = vars[k];
          const b = el('div', 'mem-box' + (changed.includes((cls ? 'L:' : '') + k) ? ' changed' : ''));
          const n = el('div', 'mem-name'); n.textContent = k;
          const val = el('div', 'mem-val'); val.textContent = v;
          const ty = el('div', 'mem-type type-' + t); ty.textContent = t;
          b.append(n, val, ty);
          grid.appendChild(b);
        });
        wrap.appendChild(grid);
        box.appendChild(wrap);
      };
      if (st.ex.scopes) {
        frame('Global', st.vars, '', 'keine globalen Variablen');
        if (st.localName) frame('Lokal in ' + esc(st.localName), st.locals, 'is-local', 'noch keine lokalen Variablen');
        else box.appendChild(el('div', 'mem-hint', 'Lokale Variablen erscheinen hier, sobald eine Funktion läuft.'));
      } else {
        frame('Arbeitsspeicher', st.vars, '', 'Noch leer – Variablen erscheinen hier, sobald ihnen ein Wert zugewiesen wird.');
      }
      return;
    }
    box.innerHTML = '<span class="vars-label">Variablen</span>';
    if (st.iter == null && !names.length) {
      box.appendChild(el('span', 'placeholder', 'erscheinen hier, sobald das Programm läuft'));
      return;
    }
    if (st.iter != null) {
      const c = el('span', 'var-chip iter' + (changed.includes('#iter') ? ' changed' : ''));
      c.textContent = st.iter + '. Durchlauf';
      box.appendChild(c);
    }
    names.forEach((k) => {
      const v = st.vars[k];
      const c = el('span', 'var-chip' + (changed.includes(k) ? ' changed' : ''));
      c.textContent = k + ' = ' + (Array.isArray(v) ? v[0] : v);
      box.appendChild(c);
    });
  }

  /* ---------- Programm ausführen ---------- */
  function stopRun(st) {
    if (st.timer) clearTimeout(st.timer);
    st.timer = null;
    st.runBtn.textContent = '▶ Ausführen';
  }

  function resetExample(st) {
    stopRun(st);
    st.steps = null;
    st.vars = {}; st.locals = {}; st.localName = null;
    st.iter = null;
    ['is-sel', 'is-run', 'is-now'].forEach((c) => clearClass(st, c));
    st.info.innerHTML = defaultInfo(st.ex);
    st.info.classList.remove('is-sel');
    consolePlaceholder(st);
    renderVars(st, []);
  }

  const RE_INT = /^\s*[+-]?\d+\s*$/;
  const RE_FLOAT = /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/;

  function readInputs(st) {
    const v = {};
    for (const [name, f] of Object.entries(st.fields)) {
      const raw = f.el.value;
      if (f.type === 'int' || f.type === 'float') {
        const ok = f.type === 'int' ? RE_INT.test(raw) : RE_FLOAT.test(raw);
        if (!ok) {
          const fn = f.type === 'int' ? 'int' : 'float';
          let hint = fn + '() kann „' + raw + '“ nicht in eine ' + (fn === 'int' ? 'ganze Zahl' : 'Kommazahl') + ' umwandeln.';
          if (/,/.test(raw)) hint += ' Achtung: In Python schreibt man Kommazahlen mit Punkt, z. B. 1.5 statt 1,5.';
          else if (fn === 'int' && RE_FLOAT.test(raw)) hint += ' int() akzeptiert keine Kommazahlen.';
          return { error: fn === 'int' ? "ValueError: invalid literal for int() with base 10: '" + raw + "'" : "ValueError: could not convert string to float: '" + raw + "'", hint: hint };
        }
        const n = f.type === 'int' ? parseInt(raw, 10) : parseFloat(raw);
        if ((f.min != null && n < f.min) || (f.max != null && n > f.max)) {
          return { error: 'Bitte gib bei „' + name + '“ eine Zahl von ' + f.min + ' bis ' + f.max + ' ein.', hint: 'Python könnte auch andere Zahlen verarbeiten – die Grenze hält nur die Animation übersichtlich.' };
        }
        v[name] = n;
      } else {
        v[name] = raw;
      }
    }
    return { values: v };
  }

  function prepare(st) {
    stopRun(st);
    ['is-sel', 'is-run', 'is-now'].forEach((c) => clearClass(st, c));
    st.info.classList.remove('is-sel');
    st.info.innerHTML = st.ex.diagram
      ? '<p>Das Programm läuft … Der <b>grüne Weg</b> zeigt, was schon ausgeführt wurde, der <b>dicke Rahmen</b> den aktuellen Schritt.</p>'
      : '<p>Das Programm läuft … Die <b>grüne Markierung</b> zeigt die Zeilen, die schon ausgeführt wurden. Beobachte, wie sich der Speicher verändert.</p>';
    st.console.innerHTML = '';
    st.vars = {}; st.locals = {}; st.localName = null;
    st.iter = null;
    renderVars(st, []);
    const r = readInputs(st);
    if (r.error) {
      cLine(st, [['c-err', r.error]]);
      cLine(st, [['c-muted', '# ' + r.hint]]);
      st.steps = null;
      return false;
    }
    st.steps = st.ex.run(r.values);
    st.pos = 0;
    return true;
  }

  function finished(st) {
    return !st.steps || st.pos > st.steps.length;
  }

  function doStep(st) {
    clearClass(st, 'is-now');
    if (st.pos >= st.steps.length) {
      cLine(st, [['c-muted', '>>> Programm beendet']]);
      st.pos = st.steps.length + 1;
      stopRun(st);
      return false;
    }
    const step = st.steps[st.pos++];
    const changed = [];
    if (step.id) {
      const c = st.cells[step.id];
      markCell(st, c, 'is-run');
      markCell(st, c, 'is-now');
    }
    if (step.lines) {
      step.lines.forEach((n) => { st.lines[n].classList.add('is-run', 'is-now'); });
      if (!st.ex.diagram) {
        const notes = st.ex.lineNotes || {};
        const n = step.lines[0];
        if (notes[n]) st.info.innerHTML = '<p>' + notes[n] + '</p><span class="info-lines">Zeile ' + n + '</span>';
      }
    }
    if (step.iter != null && step.iter !== st.iter) { st.iter = step.iter; changed.push('#iter'); }
    if (step.vars) {
      Object.entries(step.vars).forEach(([k, v]) => {
        if (v === null) delete st.vars[k];
        else st.vars[k] = st.ex.memory && !Array.isArray(v) ? [String(v), '?'] : v;
        changed.push(k);
      });
    }
    if (step.localName !== undefined) {
      st.localName = step.localName; st.locals = {}; changed.push('#scope');
    }
    if (step.local) {
      Object.entries(step.local).forEach(([k, v]) => {
        if (v === null) delete st.locals[k]; else st.locals[k] = v;
        changed.push('L:' + k);
      });
    }
    if (step.endLocal) { st.localName = null; st.locals = {}; changed.push('#scope'); }
    if (changed.length) renderVars(st, changed);
    if (step.ask) cLine(st, [[null, step.ask[0]], ['c-user', String(step.ask[1])]]);
    if (step.check) cLine(st, [['c-eval', '# ' + step.check]]);
    if (step.print != null) cLine(st, [[null, step.print]]);
    if (step.err) cLine(st, [['c-err', step.err]]);
    if (step.note) cLine(st, [['c-muted', step.note]]);
    return !step.stop;
  }

  function tick(st) {
    if (doStep(st)) st.timer = setTimeout(() => tick(st), SPEEDS[st.speed.value]);
    else stopRun(st);
  }

  function toggleRun(st) {
    if (st.timer) { stopRun(st); return; }
    if (finished(st) && !prepare(st)) return;
    st.runBtn.textContent = '⏸ Pause';
    tick(st);
  }

  function singleStep(st) {
    stopRun(st);
    if (finished(st) && !prepare(st)) return;
    doStep(st);
  }

  /* ---------- Kopieren ---------- */
  function copyText(text, btn) {
    const done = () => {
      const old = btn.textContent;
      btn.textContent = 'Kopiert ✓';
      setTimeout(() => { btn.textContent = old; }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignorieren */ }
    ta.remove();
  }

  /* ==========================================================
     Kleine Werkzeuge, die auf mehreren Seiten vorkommen
     ========================================================== */
  function setBool(out, val) {
    out.textContent = B(val);
    out.classList.toggle('is-true', val);
    out.classList.toggle('is-false', !val);
  }

  // Bedingungs-Tester: <div id="tester"> mit #t-a, #t-op, #t-b, #t-out
  function initTester() {
    const a = document.getElementById('t-a');
    if (!a) return;
    const b = document.getElementById('t-b');
    const op = document.getElementById('t-op');
    const out = document.getElementById('t-out');
    const update = () => {
      const x = parseFloat(a.value), y = parseFloat(b.value);
      if (isNaN(x) || isNaN(y)) { out.textContent = '?'; out.classList.remove('is-true', 'is-false'); return; }
      const r = { '==': x === y, '!=': x !== y, '>': x > y, '<': x < y, '>=': x >= y, '<=': x <= y }[op.value];
      setBool(out, r);
    };
    [a, b, op].forEach((e) => e.addEventListener('input', update));
    update();
  }

  // Logik-Schalter: <div id="logic"> mit .bool-btn[data-var] und output[data-expr]
  function initLogic() {
    const box = document.getElementById('logic');
    if (!box) return;
    const vals = { A: true, B: false };
    const update = () => {
      box.querySelectorAll('.bool-btn').forEach((btn) => {
        const v = vals[btn.dataset.var];
        btn.setAttribute('aria-pressed', String(v));
        btn.querySelector('b').textContent = B(v);
      });
      setBool(box.querySelector('[data-expr="and"]'), vals.A && vals.B);
      setBool(box.querySelector('[data-expr="or"]'), vals.A || vals.B);
      setBool(box.querySelector('[data-expr="not"]'), !vals.A);
      // passende Zeile in Wahrheitstabellen markieren
      document.querySelectorAll('table.truth tbody tr').forEach((tr) => {
        tr.classList.toggle('is-current', tr.dataset.a === String(vals.A) && tr.dataset.b === String(vals.B));
      });
    };
    box.querySelectorAll('.bool-btn').forEach((btn) => {
      btn.addEventListener('click', () => { vals[btn.dataset.var] = !vals[btn.dataset.var]; update(); });
    });
    document.querySelectorAll('table.truth tbody tr').forEach((tr) => {
      tr.addEventListener('click', () => { vals.A = tr.dataset.a === 'true'; vals.B = tr.dataset.b === 'true'; update(); });
    });
    update();
  }

  /* ==========================================================
     Quiz
     ========================================================== */
  function initQuiz() {
    const list = document.getElementById('quiz-list');
    const score = document.getElementById('quiz-score');
    if (!list || !QUIZ.length) return;
    let answered = 0, correct = 0;
    QUIZ.forEach((item, qi) => {
      const card = el('div', 'q-card');
      card.appendChild(el('h3', null, (qi + 1) + '. ' + esc(item.q)));
      if (item.code) {
        const pre = el('pre', 'py');
        pre.innerHTML = item.code.split('\n').map(highlight).join('\n');
        card.appendChild(pre);
      }
      const opts = el('div', 'q-opts');
      const fb = el('div', 'q-feedback');
      fb.hidden = true;
      item.opts.forEach((o, oi) => {
        const b = el('button', 'q-opt');
        b.type = 'button';
        b.textContent = o;
        b.addEventListener('click', () => {
          opts.querySelectorAll('button').forEach((x) => { x.disabled = true; });
          const ok = oi === item.a;
          b.classList.add(ok ? 'correct' : 'wrong');
          opts.children[item.a].classList.add('correct');
          fb.hidden = false;
          fb.className = 'q-feedback ' + (ok ? 'ok' : 'no');
          fb.innerHTML = '<b>' + (ok ? 'Richtig! ' : 'Leider falsch. ') + '</b>' + item.ex;
          answered++;
          if (ok) correct++;
          if (answered === QUIZ.length) {
            score.textContent = 'Ergebnis: ' + correct + ' von ' + QUIZ.length + ' richtig' +
              (correct === QUIZ.length ? ' – super!' : correct >= QUIZ.length / 2 ? ' – gut gemacht!' : ' – schau dir die Beispiele noch einmal an.');
          }
        });
        opts.appendChild(b);
      });
      card.append(opts, fb);
      list.appendChild(card);
    });
  }

  /* ==========================================================
     Statische Code-Blöcke, Navigation, Theme, Kapitel
     ========================================================== */
  function highlightStatic() {
    document.querySelectorAll('pre.py:not(.no-hl)').forEach((pre) => {
      const text = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
      pre.innerHTML = text.split('\n').map(highlight).join('\n');
    });
  }

  function initNav() {
    const links = Array.from(document.querySelectorAll('.toc a'));
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.remove('active'));
          const a = map.get(en.target.id);
          if (a) {
            a.classList.add('active');
            const bar = a.parentElement;
            bar.scrollTo({ left: a.offsetLeft - bar.clientWidth / 2 + a.clientWidth / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
          }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => obs.observe(s));
  }

  function initTheme() {
    const btn = document.querySelector('.theme-toggle');
    const root = document.documentElement;
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
    } catch (e) { /* kein Speicher verfügbar */ }
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = root.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* ignorieren */ }
    });
  }

  function initCollapsible() {
    const sections = Array.from(document.querySelectorAll('main section.section'));
    sections.forEach((sec) => {
      const h2 = sec.querySelector('h2');
      if (!h2) return;
      const body = el('div', 'section-body');
      body.id = sec.id + '-inhalt';
      while (h2.nextSibling) body.appendChild(h2.nextSibling);
      const btn = el('button', 'chapter-toggle');
      btn.type = 'button';
      btn.setAttribute('aria-controls', body.id);
      const num = h2.querySelector('.num');
      if (num) btn.appendChild(num);
      const title = el('span', 'ct-title');
      while (h2.firstChild) title.appendChild(h2.firstChild);
      btn.appendChild(title);
      btn.appendChild(el('span', 'chev', '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>'));
      h2.appendChild(btn);
      sec.appendChild(body);
      sec.classList.add('is-collapsible');
      const toggle = (open) => {
        btn.setAttribute('aria-expanded', String(open));
        body.hidden = !open;
        sec.classList.toggle('is-open', open);
      };
      sec._toggle = toggle;
      btn.addEventListener('click', () => toggle(body.hidden));
      toggle(false);
    });

    const main = document.querySelector('main');
    const bar = el('div', 'chapter-controls');
    const openAll = el('button', 'btn small', '+ Alle Kapitel öffnen');
    const closeAll = el('button', 'btn small', '− Alle Kapitel schließen');
    openAll.type = closeAll.type = 'button';
    openAll.addEventListener('click', () => sections.forEach((s) => s._toggle && s._toggle(true)));
    closeAll.addEventListener('click', () => sections.forEach((s) => s._toggle && s._toggle(false)));
    bar.append(openAll, closeAll);
    main.insertBefore(bar, main.firstChild);

    const openFor = (hash) => {
      if (!hash || hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      const sec = target && target.closest('section.section');
      if (sec && sec._toggle) sec._toggle(true);
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a) openFor(a.getAttribute('href'));
    });
    window.addEventListener('hashchange', () => openFor(location.hash));
    if (location.hash) {
      openFor(location.hash);
      const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) t.scrollIntoView();
    }
  }

  /* ---------- Start ---------- */
  function init() {
    initTheme();
    highlightStatic();
    document.querySelectorAll('.example[data-example]').forEach(buildExample);
    initTester();
    initLogic();
    HOOKS.forEach((fn) => fn());
    initQuiz();
    initCollapsible();
    initNav();
  }
  document.addEventListener('DOMContentLoaded', init);

  return {
    addExamples(obj) { Object.assign(EXAMPLES, obj); },
    setQuiz(list) { QUIZ = list; },
    onInit(fn) { HOOKS.push(fn); },
    util: { el, esc, highlight, B, q, pyFloat, pyRound, setBool, reducedMotion, py }
  };
})();
