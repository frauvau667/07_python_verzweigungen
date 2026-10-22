/* ==========================================================
   Inhalte der Lernseite „16 Strings“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, esc, py } = L.util;
  const R = (s) => py.strRepr(s);

  /* ---------- Zeichen eines Strings zeichnen ---------- */
  function renderChars(box, text, hl) {
    box.innerHTML = '';
    const chars = Array.from(text);
    if (!chars.length) { box.appendChild(el('div', 'lv-empty', "''  leerer String")); return; }
    chars.forEach((c, i) => {
      const cell = el('div', 'sv-cell' + (c === ' ' ? ' is-space' : '') + (hl && hl.has(i) ? ' is-hl' : ''));
      cell.appendChild(el('div', 'lv-idx', String(i)));
      const ch = el('div', 'sv-ch');
      ch.textContent = c === ' ' ? '␣' : c === '\n' ? '↵' : c;
      cell.appendChild(ch);
      cell.appendChild(el('div', 'lv-idx neg', String(i - chars.length)));
      box.appendChild(cell);
    });
  }

  /* ---------- Slicing wie in Python ---------- */
  function sliceIdx(n, a, b, c) {
    const step = c === null ? 1 : c;
    if (step === 0) throw new Error('ValueError: slice step cannot be zero');
    let start, stop;
    if (step > 0) {
      start = a === null ? 0 : a < 0 ? Math.max(0, a + n) : Math.min(a, n);
      stop = b === null ? n : b < 0 ? Math.max(0, b + n) : Math.min(b, n);
    } else {
      start = a === null ? n - 1 : a < 0 ? Math.max(-1, a + n) : Math.min(a, n - 1);
      stop = b === null ? -1 : b < 0 ? Math.max(-1, b + n) : Math.min(b, n - 1);
    }
    const out = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) out.push(i);
    return out;
  }
  const optInt = (s) => {
    s = s.trim();
    if (s === '') return null;
    if (!/^[+-]?\d+$/.test(s)) throw new Error('TypeError: slice indices must be integers or None');
    return parseInt(s, 10);
  };

  function initChars() {
    const box = document.getElementById('ch-view');
    if (box) renderChars(box, 'Hello World');
  }

  function initSlice() {
    const t = document.getElementById('sl-t');
    if (!t) return;
    const a = document.getElementById('sl-a'), b = document.getElementById('sl-b'), c = document.getElementById('sl-c');
    const view = document.getElementById('sl-view'), out = document.getElementById('sl-out');
    const update = () => {
      const text = t.value, chars = Array.from(text);
      const expr = 'text[' + a.value.trim() + ':' + b.value.trim() + (c.value.trim() !== '' ? ':' + c.value.trim() : '') + ']';
      try {
        const idx = sliceIdx(chars.length, optInt(a.value), optInt(b.value), optInt(c.value));
        const res = idx.map((i) => chars[i]).join('');
        renderChars(view, text, new Set(idx));
        out.innerHTML = esc(expr) + '  →  <span class="ok">' + esc(R(res)) + '</span>' +
          (idx.length ? '<br><span class="small">verwendete Indizes: ' + idx.join(', ') + '</span>' : '<br><span class="small">keine Zeichen in diesem Bereich – Slicing liefert dann einen leeren String (kein Fehler).</span>');
      } catch (e) {
        renderChars(view, text);
        out.innerHTML = esc(expr) + '  →  <span class="bad">' + esc(e.message) + '</span>';
      }
    };
    [t, a, b, c].forEach((f) => f.addEventListener('input', update));
    document.querySelectorAll('#slice-lab [data-s]').forEach((btn) => btn.addEventListener('click', () => {
      const [x, y, z] = btn.dataset.s.split(',');
      a.value = x; b.value = y; c.value = z; update();
    }));
    update();
  }

  /* ==========================================================
     String-Labor
     ========================================================== */
  const occ = (text, sub) => { // Startpositionen nicht überlappender Vorkommen
    const res = [];
    if (!sub) return res;
    let i = text.indexOf(sub);
    while (i >= 0) { res.push(i); i = text.indexOf(sub, i + sub.length); }
    return res;
  };
  const range = (s, n) => Array.from({ length: n }, (_, k) => s + k);
  const hlOcc = (text, sub) => new Set(occ(text, sub).flatMap((i) => range(i, sub.length)));

  const OPS = {
    idx: { label: 'text[index]', args: ['index'], d: ['0'], call: (a) => 'text[' + a[0] + ']',
      run(t, a) {
        if (!/^\s*[+-]?\d+\s*$/.test(a[0])) throw new Error('TypeError: string indices must be integers, not \'str\'');
        let i = parseInt(a[0], 10); const n = t.length;
        if (i < 0) i += n;
        if (i < 0 || i >= n) throw new Error('IndexError: string index out of range');
        return { r: R(t[i]), hl: new Set([i]) };
      } },
    len: { label: 'len(text)', args: [], call: () => 'len(text)', run(t) { return { r: String(t.length), hl: new Set(range(0, t.length)) }; } },
    in: { label: 'teil in text', args: ['teil'], d: ['World'], call: (a) => R(a[0]) + ' in text', run(t, a) { return { r: t.includes(a[0]) ? 'True' : 'False', hl: hlOcc(t, a[0]) }; } },
    upper: { label: 'text.upper()', args: [], call: () => 'text.upper()', run(t) { return { r: R(t.toUpperCase()) }; } },
    lower: { label: 'text.lower()', args: [], call: () => 'text.lower()', run(t) { return { r: R(t.toLowerCase()) }; } },
    strip: { label: 'text.strip()', args: [], call: () => 'text.strip()',
      run(t) {
        const s = t.trim(); const lead = t.length - t.trimStart().length, trail = t.length - t.trimEnd().length;
        return { r: R(s), hl: new Set([...range(0, lead), ...range(t.length - trail, trail)]), note: lead + trail ? (lead + trail) + ' Zeichen am Rand entfernt (markiert).' : 'Am Anfang und Ende gab es nichts zu entfernen. Tipp: Gib oben Leerzeichen am Anfang oder Ende ein.' };
      } },
    replace: { label: 'text.replace(alt, neu)', args: ['alt', 'neu'], d: ['o', '0'], call: (a) => 'text.replace(' + R(a[0]) + ', ' + R(a[1]) + ')',
      run(t, a) { return { r: R(a[0] === '' ? a[1] + Array.from(t).join(a[1]) + a[1] : t.split(a[0]).join(a[1])), hl: hlOcc(t, a[0]), note: occ(t, a[0]).length + ' Vorkommen ersetzt. text selbst bleibt unverändert.' }; } },
    split: { label: 'text.split(trenner)', args: ['trenner (leer = Leerzeichen)'], d: [' '], call: (a) => 'text.split(' + (a[0] === '' ? '' : R(a[0])) + ')',
      run(t, a) {
        let parts;
        if (a[0] === '') parts = t.split(/\s+/).filter((x) => x !== '');
        else parts = t.split(a[0]);
        return { r: py.repr(parts), hl: a[0] ? hlOcc(t, a[0]) : new Set(), note: 'Ergebnis ist eine Liste mit ' + parts.length + ' Strings.' };
      } },
    count: { label: 'text.count(teil)', args: ['teil'], d: ['l'], call: (a) => 'text.count(' + R(a[0]) + ')', run(t, a) { return { r: String(a[0] === '' ? t.length + 1 : occ(t, a[0]).length), hl: hlOcc(t, a[0]) }; } },
    find: { label: 'text.find(teil)', args: ['teil'], d: ['World'], call: (a) => 'text.find(' + R(a[0]) + ')',
      run(t, a) { const i = t.indexOf(a[0]); return { r: String(i), hl: i >= 0 ? new Set(range(i, a[0].length)) : new Set(), note: i < 0 ? 'Nicht gefunden → -1.' : 'Erstes Vorkommen beginnt bei Index ' + i + '.' }; } },
    startswith: { label: 'text.startswith(teil)', args: ['teil'], d: ['Hell'], call: (a) => 'text.startswith(' + R(a[0]) + ')', run(t, a) { const ok = t.startsWith(a[0]); return { r: ok ? 'True' : 'False', hl: ok ? new Set(range(0, a[0].length)) : new Set() }; } },
    endswith: { label: 'text.endswith(teil)', args: ['teil'], d: ['ld'], call: (a) => 'text.endswith(' + R(a[0]) + ')', run(t, a) { const ok = t.endsWith(a[0]); return { r: ok ? 'True' : 'False', hl: ok ? new Set(range(t.length - a[0].length, a[0].length)) : new Set() }; } },
    isalnum: { label: 'text.isalnum()', args: [], call: () => 'text.isalnum()', run(t) { return isX(t, /^[\p{L}\p{N}]$/u, 'ein Buchstabe oder eine Ziffer'); } },
    isalpha: { label: 'text.isalpha()', args: [], call: () => 'text.isalpha()', run(t) { return isX(t, /^\p{L}$/u, 'ein Buchstabe'); } },
    isdigit: { label: 'text.isdigit()', args: [], call: () => 'text.isdigit()', run(t) { return isX(t, /^\p{Nd}$/u, 'eine Ziffer'); } },
    plus: { label: 'text + anhang', args: ['anhang'], d: ['!'], call: (a) => 'text + ' + R(a[0]), run(t, a) { return { r: R(t + a[0]) }; } }
  };

  function isX(t, re, what) {
    const chars = Array.from(t);
    const bad = new Set(); chars.forEach((c, i) => { if (!re.test(c)) bad.add(i); });
    const ok = chars.length > 0 && bad.size === 0;
    return { r: ok ? 'True' : 'False', hl: bad, note: !chars.length ? 'Ein leerer String liefert immer False.' : ok ? 'Jedes Zeichen ist ' + what + '.' : 'Markiert sind die Zeichen, die die Bedingung nicht erfüllen (gefordert: jedes Zeichen ist ' + what + ').' };
  }

  function initLab() {
    const t = document.getElementById('st-t');
    if (!t) return;
    const op = document.getElementById('st-op');
    const fa = document.getElementById('st-a'), fb = document.getElementById('st-b');
    const aw = document.getElementById('st-aw'), bw = document.getElementById('st-bw');
    const al = document.getElementById('st-al'), bl = document.getElementById('st-bl');
    const view = document.getElementById('st-view'), out = document.getElementById('st-out');
    Object.entries(OPS).forEach(([k, o]) => { const x = el('option'); x.value = k; x.textContent = o.label; op.appendChild(x); });
    op.value = 'find';
    const update = () => {
      const o = OPS[op.value];
      aw.hidden = o.args.length < 1; bw.hidden = o.args.length < 2;
      if (o.args[0]) al.textContent = o.args[0];
      if (o.args[1]) bl.textContent = o.args[1];
      const args = [fa.value, fb.value];
      const text = t.value;
      const head = 'text = ' + esc(R(text)) + '<br>';
      try {
        const r = o.run(text, args);
        renderChars(view, text, r.hl);
        out.innerHTML = head + esc(o.call(args)) + '  →  <span class="ok">' + esc(r.r) + '</span>' + (r.note ? '<br><span class="small">' + esc(r.note) + '</span>' : '');
      } catch (e) {
        renderChars(view, text);
        out.innerHTML = head + esc(o.call(args)) + '  →  <span class="bad">' + esc(e.message) + '</span>';
      }
    };
    const choose = () => { const d = OPS[op.value].d || []; fa.value = d[0] || ''; fb.value = d[1] || ''; update(); };
    op.addEventListener('change', choose);
    [t, fa, fb].forEach((f) => f.addEventListener('input', update));
    choose();
  }

  L.onInit(() => { initChars(); initSlice(); initLab(); });

  /* ==========================================================
     Beispiel: Vokale zählen
     ========================================================== */
  L.addExamples({
    vokale: {
      memory: true,
      code:
`passwort = input("Neues Passwort: ")
ziffern = 0
grossbuchstaben = 0
for zeichen in passwort:
    if zeichen.isdigit():
        ziffern = ziffern + 1
    elif zeichen.isupper():
        grossbuchstaben = grossbuchstaben + 1

if "passwort" in passwort.lower():
    print("Ernsthaft? Das Wort Passwort im Passwort?")
elif len(passwort) < 12 or ziffern == 0 or grossbuchstaben == 0:
    print("Zu schwach. Mein Toaster knackt das in Sekunden.")
else:
    print("Stark! Jetzt bloß nicht auf einen Zettel schreiben.")`,
      lineNotes: {
        1: '<b>Eingabe</b> des Passworts (ein String).',
        2: '<b>Zähler</b> für Ziffern mit 0 starten.',
        3: '<b>Zähler</b> für Großbuchstaben mit 0 starten.',
        4: '<b>Zeichenweise durchlaufen:</b> <code>zeichen</code> bekommt nacheinander jedes Zeichen des Passworts.',
        5: '<b>Prüfen:</b> <code>isdigit()</code> liefert <code>True</code>, wenn das Zeichen eine Ziffer ist.',
        6: '<b>Ziffer zählen.</b>',
        7: '<b>Prüfen:</b> <code>isupper()</code> liefert <code>True</code>, wenn das Zeichen ein Großbuchstabe ist.',
        8: '<b>Großbuchstaben zählen.</b>',
        10: '<b>Der Klassiker:</b> <code>lower()</code> macht alles klein, damit auch „Passwort“ oder „PASSWORT“ erkannt wird. <code>in</code> prüft, ob der Text darin vorkommt.',
        11: 'Sarkastische Ausgabe – verdient.',
        12: '<b>Mindestanforderungen:</b> mindestens 12 Zeichen, mindestens eine Ziffer und mindestens ein Großbuchstabe. Ist <b>eine</b> Teilbedingung wahr, ist das Passwort zu schwach.',
        13: 'Ausgabe für zu schwache Passwörter.',
        15: 'Alle Anforderungen erfüllt.'
      },
      inputs: [{ name: 'passwort', type: 'text', value: 'Sommer2026' }],
      run(v) {
        const pw = v.passwort;
        const LIM = 20;
        const isDig = (c) => /^\p{Nd}$/u.test(c);
        const isUp = (c) => /^\p{Lu}$/u.test(c);
        const s = [
          { lines: [1], ask: ['Neues Passwort: ', pw], vars: { passwort: [R(pw), 'str'] } },
          { lines: [2], vars: { ziffern: ['0', 'int'] } },
          { lines: [3], vars: { grossbuchstaben: ['0', 'int'] } }
        ];
        const chars = Array.from(pw);
        let z = 0, g = 0, k = 0;
        chars.forEach((c) => { if (isDig(c)) z++; else if (isUp(c)) g++; });
        if (chars.length > LIM) s.push({ note: '# (Die Animation zeigt nur die ersten ' + LIM + ' Zeichen, gezählt werden alle.)' });
        let zz = 0, gg = 0;
        chars.slice(0, LIM).forEach((c) => {
          k++;
          s.push({ lines: [4], vars: { zeichen: [R(c), 'str'] }, iter: k, check: 'Zeichen ' + k + ': ' + R(c) });
          const d = isDig(c);
          s.push({ lines: [5], check: R(c) + '.isdigit()  →  ' + (d ? 'True' : 'False') });
          if (d) { zz++; s.push({ lines: [6], vars: { ziffern: [String(zz), 'int'] } }); return; }
          const u = isUp(c);
          s.push({ lines: [7], check: R(c) + '.isupper()  →  ' + (u ? 'True' : 'False') });
          if (u) { gg++; s.push({ lines: [8], vars: { grossbuchstaben: [String(gg), 'int'] } }); }
        });
        if (chars.length > LIM) s.push({ lines: [4], vars: { ziffern: [String(z), 'int'], grossbuchstaben: [String(g), 'int'] }, check: 'restliche Zeichen ebenso gezählt' });
        s.push({ lines: [4], check: 'alle Zeichen durchlaufen  →  Schleife endet' });
        const hasPw = pw.toLowerCase().includes('passwort');
        s.push({ lines: [10], check: '"passwort" in ' + R(pw.toLowerCase()) + '  →  ' + (hasPw ? 'True' : 'False') });
        if (hasPw) { s.push({ lines: [11], print: 'Ernsthaft? Das Wort Passwort im Passwort?' }); return s; }
        const n = chars.length;
        const weak = n < 12 || z === 0 || g === 0;
        s.push({ lines: [12], check: n + ' < 12 or ' + z + ' == 0 or ' + g + ' == 0  →  ' + (n < 12 ? 'True' : 'False') + ' or ' + (z === 0 ? 'True' : 'False') + ' or ' + (g === 0 ? 'True' : 'False') + '  →  ' + (weak ? 'True' : 'False') });
        if (weak) s.push({ lines: [13], print: 'Zu schwach. Mein Toaster knackt das in Sekunden.' });
        else { s.push({ lines: [14] }); s.push({ lines: [15], print: 'Stark! Jetzt bloß nicht auf einen Zettel schreiben.' }); }
        return s;
      }
    }
  });

  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Was liefert "Python"[1]?', opts: ['P', 'y', 't', 'Fehler'], a: 1,
      ex: 'Der Index beginnt bei 0: P = 0, y = 1.' },
    { q: 'Was liefert "Python"[-2:]?', opts: ["'on'", "'Pyth'", "'n'", "'ho'"], a: 0,
      ex: 'Ab dem vorletzten Zeichen (Index -2) bis zum Ende: <code>\'on\'</code>.' },
    { q: 'Was gibt das Programm aus?', code: 'text = "hallo"\ntext.upper()\nprint(text)', opts: ['HALLO', 'hallo', 'Hallo', 'None'], a: 1,
      ex: 'Strings sind unveränderlich. <code>upper()</code> liefert einen neuen String, der hier nicht gespeichert wird. Richtig: <code>text = text.upper()</code>.' },
    { q: 'Was liefert "a;b;c".split(";")?', opts: ["'abc'", "['a', 'b', 'c']", "['a;b;c']", "('a', 'b', 'c')"], a: 1,
      ex: '<code>split()</code> zerlegt den String am Trennzeichen in eine <b>Liste</b> von Strings.' },
    { q: 'Was liefert "Banane".find("x")?', opts: ['0', 'None', '-1', 'Fehlermeldung'], a: 2,
      ex: '<code>find()</code> liefert -1, wenn der gesuchte Text nicht vorkommt.' },
    { q: 'Was ergibt "12a".isdigit()?', opts: ['True', 'False'], a: 1,
      ex: 'Das „a“ ist keine Ziffer. <code>isdigit()</code> ist nur True, wenn <b>alle</b> Zeichen Ziffern sind.' },
    { q: 'Was ergibt "Banane".count("an")?', opts: ['1', '2', '3', '6'], a: 1,
      ex: '„an“ kommt zweimal vor: B<b>an</b><b>an</b>e.' },
    { q: 'Was gibt das Programm aus?', code: 'print(len("Hallo Welt"))', opts: ['9', '10', '11', '2'], a: 1,
      ex: '5 + 1 (Leerzeichen) + 4 = 10. Auch das Leerzeichen zählt als Zeichen.' }
  ]);
})();
