/* ==========================================================
   Inhalte der Lernseite „15 Textdateien“
   (Der Programmkern steht in js/engine.js.)
   ========================================================== */
(function () {
  'use strict';
  const L = window.Lernseite;
  const { el, esc, highlight, pyFloat, py } = L.util;
  const R = (s) => py.strRepr(s);

  /* ---------- Dateiinhalt mit sichtbaren Zeilenumbrüchen ---------- */
  function showFile(box, content) {
    if (content === null) { box.innerHTML = '<span class="missing">Die Datei existiert nicht.</span>'; return; }
    if (content === '') { box.innerHTML = '<span class="missing">(leere Datei)</span>'; return; }
    box.innerHTML = content.split('\n').map(esc).join('<span class="nl">↵</span>\n');
  }

  /* ==========================================================
     Datei-Labor
     ========================================================== */
  function initFileLab() {
    const body = document.getElementById('fl-body');
    if (!body) return;
    const fileBox = document.getElementById('fl-file');
    const mode = document.getElementById('fl-mode'), act = document.getElementById('fl-act');
    const text = document.getElementById('fl-text'), tw = document.getElementById('fl-tw');
    const code = document.getElementById('fl-code'), log = document.getElementById('fl-log');
    const START = 'Brot\nMilch\n';
    let content;
    const line = (cls, t) => { const d = el('div', cls); d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    const unescape = (s) => s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    const draw = (changed) => {
      showFile(body, content);
      if (changed) { fileBox.classList.remove('is-changed'); void fileBox.offsetWidth; fileBox.classList.add('is-changed'); }
    };
    const preview = () => {
      tw.hidden = act.value !== 'write';
      const lines = ['with open("notizen.txt", "' + mode.value + '", encoding="utf-8") as datei:'];
      if (act.value === 'write') lines.push('    datei.write("' + text.value + '")');
      else lines.push('    print(datei.read())');
      code.innerHTML = lines.map(highlight).join('\n');
    };
    const reset = () => { content = START; log.innerHTML = ''; line('c-muted', '# notizen.txt enthält ' + R(content)); draw(); preview(); };
    const run = () => {
      const m = mode.value, a = act.value, t = unescape(text.value);
      line('c-in', '>>> ' + code.textContent.split('\n').join('\n... '));
      const before = content;
      // 1. Öffnen
      if ((m === 'r' || m === 'r+') && content === null) {
        line('c-err', "FileNotFoundError: [Errno 2] No such file or directory: 'notizen.txt'");
        line('c-muted', '# Im Modus "' + m + '" muss die Datei bereits existieren.');
        return;
      }
      if (m === 'w' || m === 'w+') {
        content = '';
        line('c-muted', before === null ? '# Datei existierte nicht → wurde neu erstellt.' : '# Modus "' + m + '": Der bisherige Inhalt wurde beim Öffnen gelöscht!');
      }
      if (m === 'a' && content === null) { content = ''; line('c-muted', '# Datei existierte nicht → wurde neu erstellt.'); }
      // 2. Zugriff
      if (a === 'write') {
        if (m === 'r') line('c-err', 'io.UnsupportedOperation: not writable');
        else {
          if (m === 'a') content = content + t;
          else if (m === 'r+') content = t + content.slice(t.length);
          else content = t;
          line('c-muted', '# ' + t.length + ' Zeichen geschrieben' + (m === 'a' ? ' (am Ende angehängt)' : m === 'r+' ? ' (ab dem Anfang, vorhandene Zeichen wurden überschrieben)' : ''));
        }
      } else {
        if (m === 'w' || m === 'a') line('c-err', 'io.UnsupportedOperation: not readable');
        else {
          line('', content);
          line('c-muted', '# read() lieferte ' + R(content) + (m === 'w+' && content === '' ? '  – leer, weil "w+" den Inhalt beim Öffnen gelöscht hat.' : ''));
        }
      }
      line('c-muted', '# Datei geschlossen (Ende des with-Blocks)');
      draw(before !== content);
    };
    [mode, act].forEach((s) => s.addEventListener('change', preview));
    text.addEventListener('input', preview);
    text.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    document.getElementById('fl-run').addEventListener('click', run);
    document.getElementById('fl-reset').addEventListener('click', reset);
    document.getElementById('fl-del').addEventListener('click', () => { content = null; line('c-muted', '# notizen.txt wurde gelöscht'); draw(true); });
    reset();
  }

  /* ==========================================================
     CSV-Labor
     ========================================================== */
  const CSV = 'Stadt;Temperatur;Regen\nSaarlouis;12.5;3.2\nDillingen;11.8;4\nSaarbrücken;13.1;0.5\nMerzig;10.9;6.75\n';

  const isNum = (s) => /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/.test(s);

  // Ausgabe im Stil von tabulate (Format "simple")
  function tabulate(rows, headers) {
    const ncol = Math.max(headers.length, ...rows.map((r) => r.length));
    const cols = [];
    for (let c = 0; c < ncol; c++) {
      const vals = rows.map((r) => (r[c] === undefined ? '' : r[c].trim()));
      const numeric = vals.length && vals.every((v) => v !== '' && isNum(v));
      let cells;
      if (numeric) {
        const hasFloat = vals.some((v) => /[.eE]/.test(v));
        const nums = vals.map((v) => (hasFloat ? String(parseFloat(v)) : String(parseInt(v, 10))));
        const ip = nums.map((n) => n.split('.')[0]), fp = nums.map((n) => (n.includes('.') ? '.' + n.split('.')[1] : ''));
        const wi = Math.max(...ip.map((x) => x.length)), wf = Math.max(...fp.map((x) => x.length));
        cells = nums.map((n, i) => ip[i].padStart(wi) + fp[i].padEnd(wf));
      } else cells = vals;
      const h = headers[c] === undefined ? '' : headers[c];
      const w = Math.max(h.length + 2, ...cells.map((x) => x.length)); // tabulate: mindestens 2 Zeichen mehr als die Überschrift
      cols.push({ numeric, h: numeric ? h.padStart(w) : h.padEnd(w), cells: cells.map((x) => (numeric ? x.padStart(w) : x.padEnd(w))), w });
    }
    const out = [cols.map((c) => c.h).join('  '), cols.map((c) => '-'.repeat(c.w)).join('  ')];
    rows.forEach((_, i) => out.push(cols.map((c) => c.cells[i]).join('  ')));
    return out.map((l) => l.replace(/\s+$/, '')).join('\n');
  }

  function initCsv() {
    const ta = document.getElementById('csv-in');
    if (!ta) return;
    const selLine = document.getElementById('csv-line'), selCol = document.getElementById('csv-col');
    const steps = document.getElementById('csv-steps'), table = document.getElementById('csv-table'), ev = document.getElementById('csv-eval');
    ta.value = CSV.trimEnd();
    let lines = [], headers = [], rows = [];
    const parse = () => {
      const raw = ta.value.replace(/\r/g, '');
      const all = raw.split('\n');
      lines = all.map((l, i) => (i < all.length - 1 ? l + '\n' : l)).filter((l) => l.trim() !== '');
      headers = lines.length ? lines[0].trim().split(';') : [];
      rows = lines.slice(1).map((l) => l.trim().split(';'));
      // Auswahlfelder neu füllen
      const keepL = selLine.value, keepC = selCol.value;
      selLine.innerHTML = ''; selCol.innerHTML = '';
      lines.forEach((l, i) => { const o = el('option'); o.value = i; o.textContent = (i === 0 ? 'Überschrift: ' : 'Zeile ' + i + ': ') + l.trim().slice(0, 20); selLine.appendChild(o); });
      headers.forEach((h, i) => {
        if (rows.length && rows.every((r) => r[i] !== undefined && isNum(r[i]))) { const o = el('option'); o.value = i; o.textContent = h + ' (Index ' + i + ')'; selCol.appendChild(o); }
      });
      if (keepL && +keepL < lines.length) selLine.value = keepL; else if (lines.length > 1) selLine.value = 1;
      if (keepC && selCol.querySelector('option[value="' + keepC + '"]')) selCol.value = keepC;
    };
    const showSteps = () => {
      const i = +selLine.value;
      const l = lines[i];
      if (l === undefined) { steps.textContent = 'Die Datei ist leer.'; return; }
      const s = l.trim(), parts = s.split(';');
      steps.innerHTML =
        (i === 0 ? 'ueberschrift = datei.readline()' : 'zeile') + '  →  <b>' + esc(R(l)) + '</b><br>' +
        '.strip()  →  <b>' + esc(R(s)) + '</b>  <span class="small">(Zeilenumbruch entfernt)</span><br>' +
        '.split(";")  →  <span class="ok">' + esc(py.repr(parts)) + '</span>  <span class="small">(Liste mit ' + parts.length + ' Elementen – alles Strings!)</span>';
    };
    const evCode = document.getElementById('csv-eval-code');
    const evOut = document.getElementById('csv-eval-out');
    const showEval = () => {
      if (!selCol.value) {
        evCode.textContent = '';
        evOut.textContent = 'Keine Spalte gefunden, die nur Zahlen enthält.';
        return;
      }
      const c = +selCol.value;
      const name = headers[c];
      const code = [
        'spalte = []      # alle Werte der Spalte "' + name + '"',
        'staedte = []     # die Namen aus Spalte 0',
        '',
        'with open("wetter.csv", "r", encoding="utf-8") as datei:',
        '    ueberschrift = datei.readline().strip().split(";")',
        '    for zeile in datei:',
        '        werte = zeile.strip().split(";")',
        '        staedte.append(werte[0])',
        '        spalte.append(float(werte[' + c + ']))     # Spalte "' + name + '"',
        '',
        'summe = sum(spalte)',
        'durchschnitt = summe / len(spalte)',
        'i = spalte.index(max(spalte))',
        '',
        'print(f"Summe: {round(summe, 2)}")',
        'print(f"Durchschnitt: {round(durchschnitt, 2)}")',
        'print(f"Größter Wert: {max(spalte)} ({staedte[i]})")'
      ];
      evCode.innerHTML = code.map(highlight).join('\n');
      const nums = rows.map((r) => parseFloat(r[c]));
      let sum = 0; nums.forEach((n) => { sum += n; });
      let mi = 0; nums.forEach((n, k) => { if (n > nums[mi]) mi = k; });
      const pr = L.util.pyRound;
      evOut.textContent = 'Summe: ' + pyFloat(pr(sum, 2)) + '\n' +
        'Durchschnitt: ' + pyFloat(pr(sum / nums.length, 2)) + '\n' +
        'Größter Wert: ' + pyFloat(nums[mi]) + ' (' + (rows[mi][0] || '').trim() + ')';
    };
    const update = () => { parse(); showSteps(); table.textContent = lines.length ? tabulate(rows, headers) : ''; showEval(); };
    ta.addEventListener('input', update);
    selLine.addEventListener('change', showSteps);
    selCol.addEventListener('change', showEval);
    update();
  }


  /* ==========================================================
     Was liefert die Schleife? split / csv.reader / DictReader
     ========================================================== */
  function initCsvCompare() {
    const out = document.getElementById('csv-compare-out');
    if (!out) return;
    const ta = document.getElementById('csv-in');
    const btns = document.querySelectorAll('#csv-compare [data-m]');
    let mode = 'split';
    const line = (cls, t) => { const d = el('div', cls); d.textContent = t; out.appendChild(d); };
    const show = () => {
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
      out.innerHTML = '';
      const lines = ta.value.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
      if (!lines.length) { line('c-muted', '# Die Datei ist leer.'); return; }
      const head = lines[0].trim().split(';');
      const rows = lines.slice(1).map((l) => l.trim().split(';'));
      if (mode === 'split') {
        line('c-in', 'ueberschrift = datei.readline().strip().split(";")');
        line('', '# ueberschrift = ' + py.repr(head));
        rows.forEach((r) => line('', '# werte = ' + py.repr(r)));
        line('c-muted', '# Jede Zeile wird zur Liste von Strings.');
      } else if (mode === 'reader') {
        line('c-in', 'ueberschrift = next(leser)');
        line('', '# ueberschrift = ' + py.repr(head));
        rows.forEach((r) => line('', '# werte = ' + py.repr(r)));
        line('c-muted', '# Wie bei split() – nur übernimmt das Modul das Zerlegen und Säubern.');
      } else {
        line('c-in', 'for zeile in csv.DictReader(datei, delimiter=";"):');
        rows.forEach((r) => {
          const d = new Map(); head.forEach((h, i) => d.set(h, r[i] === undefined ? null : r[i]));
          line('', '# zeile = ' + py.repr(d));
        });
        line('c-muted', '# Die erste Zeile liefert die Schlüssel, jede weitere Zeile wird zu einem Dictionary.');
      }
    };
    btns.forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; show(); }));
    ta.addEventListener('input', show);
    show();
  }

  /* ==========================================================
     Ganze Dateien schreiben: vier Wege
     ========================================================== */
  const WRITE = {
    txt: {
      name: 'einkauf.txt',
      code: [
        'einkauf = ["Brot", "Milch", "Eier", "Kaffee"]',
        '',
        'with open("einkauf.txt", "w", encoding="utf-8") as datei:',
        '    for eintrag in einkauf:',
        '        datei.write(eintrag + "\\n")',
        '',
        '# kürzer: datei.write("\\n".join(einkauf) + "\\n")'
      ],
      file: 'Brot\nMilch\nEier\nKaffee\n',
      note: 'Jedes Element der Liste wird zu einer Zeile. Die auskommentierte Variante mit <code>join()</code> fügt alle Elemente mit Zeilenumbrüchen zu einem einzigen String zusammen.'
    },
    csvw: {
      name: 'wetter_neu.csv',
      code: [
        'ueberschrift = ["Stadt", "Temperatur", "Regen"]',
        'daten = [["Saarlouis", 12.5, 3.2],',
        '         ["Dillingen", 11.8, 4],',
        '         ["Merzig", 10.9, 6.75]]',
        '',
        'with open("wetter_neu.csv", "w", encoding="utf-8") as datei:',
        '    datei.write(";".join(ueberschrift) + "\\n")',
        '    for zeile in daten:',
        '        datei.write(f"{zeile[0]};{zeile[1]};{zeile[2]}\\n")'
      ],
      file: 'Stadt;Temperatur;Regen\nSaarlouis;12.5;3.2\nDillingen;11.8;4\nMerzig;10.9;6.75\n',
      note: 'Ohne Zusatzmodul: Die Überschrift wird mit <code>join()</code> verbunden, jede Datenzeile mit einem f-String zusammengesetzt. Zahlen muss man dabei nicht umwandeln – der f-String macht daraus automatisch Text.'
    },
    writer: {
      name: 'wetter_neu.csv',
      code: [
        'import csv',
        '',
        'ueberschrift = ["Stadt", "Temperatur", "Regen"]',
        'daten = [["Saarlouis", 12.5, 3.2],',
        '         ["Dillingen", 11.8, 4],',
        '         ["Merzig", 10.9, 6.75]]',
        '',
        'with open("wetter_neu.csv", "w", encoding="utf-8", newline="") as datei:',
        '    schreiber = csv.writer(datei, delimiter=";")',
        '    schreiber.writerow(ueberschrift)     # eine Zeile',
        '    schreiber.writerows(daten)           # alle Zeilen auf einmal'
      ],
      file: 'Stadt;Temperatur;Regen\nSaarlouis;12.5;3.2\nDillingen;11.8;4\nMerzig;10.9;6.75\n',
      note: '<code>csv.writer</code> übernimmt das Trennen, Umwandeln und die Zeilenumbrüche. <code>writerows()</code> schreibt eine ganze zweidimensionale Liste ohne eigene Schleife. Das Ergebnis ist dieselbe Tabelle – einziger Unterschied: Das Modul beendet jede Zeile nach CSV-Standard mit <code>\\r\\n</code>. Deshalb öffnet man die Datei mit <code>newline=""</code>.'
    },
    dictwriter: {
      name: 'wetter_neu.csv',
      code: [
        'import csv',
        '',
        'daten = [{"Stadt": "Saarlouis", "Temperatur": 12.5, "Regen": 3.2},',
        '         {"Stadt": "Dillingen", "Temperatur": 11.8, "Regen": 4},',
        '         {"Stadt": "Merzig", "Temperatur": 10.9, "Regen": 6.75}]',
        '',
        'with open("wetter_neu.csv", "w", encoding="utf-8", newline="") as datei:',
        '    schreiber = csv.DictWriter(datei, fieldnames=["Stadt", "Temperatur", "Regen"],',
        '                               delimiter=";")',
        '    schreiber.writeheader()      # Überschriften aus fieldnames',
        '    schreiber.writerows(daten)'
      ],
      file: 'Stadt;Temperatur;Regen\nSaarlouis;12.5;3.2\nDillingen;11.8;4\nMerzig;10.9;6.75\n',
      note: 'Das Gegenstück zum <code>DictReader</code>: Die Daten liegen als Liste von Dictionaries vor. <code>fieldnames</code> legt fest, welche Schlüssel in welcher Reihenfolge als Spalten geschrieben werden. Auch hier entsteht dieselbe Datei.'
    }
  };

  function initWriteCompare() {
    const codeEl = document.getElementById('wc-code');
    if (!codeEl) return;
    const nameEl = document.getElementById('wc-name'), fileEl = document.getElementById('wc-file'), noteEl = document.getElementById('wc-note');
    const btns = document.querySelectorAll('#write-compare [data-w]');
    const show = (k) => {
      const w = WRITE[k];
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.w === k)));
      codeEl.innerHTML = w.code.map(highlight).join('\n');
      nameEl.textContent = '📄 ' + w.name;
      showFile(fileEl, w.file);
      noteEl.innerHTML = w.note;
    };
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.w)));
    show('txt');
  }

  L.onInit(() => { initFileLab(); initCsv(); initCsvCompare(); initWriteCompare(); });

  /* ==========================================================
     Beispiele: Zeilenweise lesen ohne und mit strip()
     ========================================================== */
  function readExample(withStrip) {
    const code = [
      'with open("notizen.txt", "w", encoding="utf-8") as datei:',
      '    datei.write("Brot\\n")',
      '    datei.write("Milch\\n")',
      '',
      'with open("notizen.txt", "r", encoding="utf-8") as datei:',
      '    for zeile in datei:'
    ];
    if (withStrip) code.push('        zeile = zeile.strip()');
    code.push('        print(zeile)');
    code.push('print("Ende")');
    const pl = withStrip ? 8 : 7, endL = withStrip ? 9 : 8;
    const notes = {
      1: '<b>Datei zum Schreiben öffnen.</b> Im Modus "w" wird sie neu angelegt (bzw. geleert). Mit <code>as datei</code> wird sie im with-Block unter dem Namen <code>datei</code> angesprochen.',
      2: '<b>Schreiben:</b> <code>\\n</code> sorgt für einen Zeilenumbruch nach „Brot“.',
      3: '<b>Zweite Zeile</b> schreiben.',
      5: '<b>Datei zum Lesen öffnen.</b> Die erste Datei wurde am Ende des ersten with-Blocks automatisch geschlossen.',
      6: '<b>Zeilenweise lesen:</b> <code>zeile</code> enthält bei jedem Durchlauf eine Zeile der Datei – <b>einschließlich</b> des <code>\\n</code> am Ende.'
    };
    if (withStrip) notes[7] = '<b>strip()</b> entfernt den Zeilenumbruch (und Leerzeichen) am Anfang und Ende der Zeile.';
    notes[pl] = withStrip ? '<b>Ausgabe</b> ohne zusätzliche Leerzeile.' : '<b>Ausgabe:</b> <code>zeile</code> endet mit <code>\\n</code>, und <code>print()</code> hängt noch einen Zeilenumbruch an – deshalb entsteht jeweils eine <b>Leerzeile</b>.';
    notes[endL] = '<b>Nach der Schleife.</b>';
    return {
      memory: true,
      code: code.join('\n'),
      lineNotes: notes,
      inputs: [],
      run() {
        const F = 'notizen.txt (Datei)';
        const s = [
          { lines: [1], vars: { datei: ['geöffnet: "w"', 'file'], [F]: ["''", 'file'] }, check: 'Datei geöffnet zum Schreiben (leer)' },
          { lines: [2], vars: { [F]: ["'Brot\\n'", 'file'] } },
          { lines: [3], vars: { [F]: ["'Brot\\nMilch\\n'", 'file'] } },
          { lines: [1], vars: { datei: ['geschlossen', 'file'] }, check: 'with-Block zu Ende → Datei automatisch geschlossen' },
          { lines: [5], vars: { datei: ['geöffnet: "r"', 'file'] }, check: 'Datei geöffnet zum Lesen' }
        ];
        ['Brot', 'Milch'].forEach((w) => {
          s.push({ lines: [6], vars: { zeile: ["'" + w + "\\n'", 'str'] }, check: 'nächste Zeile gelesen: ' + "'" + w + "\\n'" });
          if (withStrip) s.push({ lines: [7], vars: { zeile: ["'" + w + "'", 'str'] }, check: "strip()  →  '" + w + "'" });
          s.push({ lines: [pl], print: withStrip ? w : w + '\n' });
        });
        s.push({ lines: [6], check: 'keine weiteren Zeilen → Schleife endet' });
        s.push({ lines: [5], vars: { datei: ['geschlossen', 'file'] }, check: 'with-Block zu Ende → Datei geschlossen' });
        s.push({ lines: [endL], print: 'Ende' });
        return s;
      }
    };
  }
  L.addExamples({ lesen1: readExample(false), lesen2: readExample(true) });

  L.addExamples({
    schreiben_csv: {
      memory: true,
      code: [
        'daten = [["Saarlouis", 12.5, 3.2],',
        '         ["Dillingen", 11.8, 4],',
        '         ["Merzig", 10.9, 6.75]]',
        '',
        'with open("wetter_neu.csv", "w", encoding="utf-8") as datei:',
        '    datei.write("Stadt;Temperatur;Regen\\n")',
        '    for zeile in daten:',
        '        datei.write(f"{zeile[0]};{zeile[1]};{zeile[2]}\\n")',
        '',
        'print("wetter_neu.csv wurde gespeichert.")'
      ].join('\n'),
      lineNotes: {
        1: '<b>Daten:</b> Eine zweidimensionale Liste – jede innere Liste ist eine Zeile der späteren Tabelle.',
        5: '<b>Datei zum Schreiben öffnen.</b> Modus <code>"w"</code>: Die Datei wird neu angelegt bzw. geleert.',
        6: '<b>Überschriftenzeile</b> schreiben – mit Semikolon als Trennzeichen und <code>\\n</code> am Ende.',
        7: '<b>Schleife über alle Zeilen</b> der Liste. <code>zeile</code> ist jeweils eine innere Liste, z. B. <code>["Saarlouis", 12.5, 3.2]</code>.',
        8: '<b>Eine Datenzeile schreiben:</b> Der f-String setzt die drei Werte mit Semikolons dazwischen zusammen. Zahlen werden dabei automatisch zu Text.',
        10: '<b>Nach dem with-Block</b> ist die Datei geschlossen und vollständig gespeichert.'
      },
      inputs: [],
      run() {
        const F = 'wetter_neu.csv (Datei)';
        const rows = [['Saarlouis', '12.5', '3.2'], ['Dillingen', '11.8', '4'], ['Merzig', '10.9', '6.75']];
        let content = '';
        const fv = () => [R(content), 'file'];
        const s = [
          { lines: [1, 2, 3], vars: { daten: ["[['Saarlouis', 12.5, 3.2], ['Dillingen', 11.8, 4], ['Merzig', 10.9, 6.75]]", 'list'] } },
          { lines: [5], vars: { datei: ['geöffnet: "w"', 'file'], [F]: ["''", 'file'] }, check: 'Datei geöffnet (leer)' }
        ];
        content += 'Stadt;Temperatur;Regen\n';
        s.push({ lines: [6], vars: { [F]: fv() }, check: 'Überschriftenzeile geschrieben' });
        rows.forEach((r, i) => {
          s.push({ lines: [7], vars: { zeile: ["['" + r[0] + "', " + r[1] + ', ' + r[2] + ']', 'list'] }, iter: i + 1, check: 'Zeile ' + (i + 1) + ' von 3' });
          content += r.join(';') + '\n';
          s.push({ lines: [8], vars: { [F]: fv() }, check: 'geschrieben: ' + R(r.join(';') + '\n') });
        });
        s.push({ lines: [7], check: 'alle Zeilen geschrieben  →  Schleife endet' });
        s.push({ lines: [5], vars: { datei: ['geschlossen', 'file'] }, check: 'with-Block zu Ende → Datei geschlossen' });
        s.push({ lines: [10], print: 'wetter_neu.csv wurde gespeichert.' });
        return s;
      }
    }
  });


  /* ==========================================================
     Quiz
     ========================================================== */
  L.setQuiz([
    { q: 'Was passiert, wenn man eine vorhandene Datei im Modus "w" öffnet?', opts: ['Neuer Text wird angehängt', 'Der bisherige Inhalt wird gelöscht', 'Es gibt einen Fehler', 'Die Datei wird nur gelesen'], a: 1,
      ex: '"w" leert die Datei schon beim Öffnen. Zum Anhängen verwendet man "a".' },
    { q: 'Welcher Modus führt zu einem Fehler, wenn die Datei nicht existiert?', opts: ['"w"', '"a"', '"r"', '"w+"'], a: 2,
      ex: 'Lesen kann man nur aus einer vorhandenen Datei: <code>FileNotFoundError</code>. "w" und "a" erstellen die Datei bei Bedarf.' },
    { q: 'Welchen Vorteil hat die with-Anweisung?', opts: ['Die Datei wird schneller gelesen', 'Die Datei wird automatisch geschlossen', 'Man braucht keinen Dateinamen', 'Die Datei wird verschlüsselt'], a: 1,
      ex: 'Am Ende des with-Blocks schließt Python die Datei automatisch – man kann das Schließen nicht vergessen.' },
    { q: 'Was liefert "Merzig;10.9;6.75\\n".strip().split(";")?', opts: ['["Merzig", 10.9, 6.75]', "['Merzig', '10.9', '6.75']", "['Merzig;10.9;6.75']", "['Merzig', '10.9', '6.75\\n']"], a: 1,
      ex: '<code>strip()</code> entfernt das <code>\\n</code>, <code>split(";")</code> trennt am Semikolon. Alle Teile bleiben <b>Strings</b>.' },
    { q: 'Was ist an dieser Zeile falsch?', code: 'datei.write(42)', opts: ['Nichts', 'write() akzeptiert nur Strings', 'Es fehlt encoding', 'write() braucht zwei Argumente'], a: 1,
      ex: 'Zahlen müssen vorher umgewandelt werden: <code>datei.write(str(42))</code>.' },
    { q: 'Warum entstehen beim Ausgeben gelesener Zeilen Leerzeilen?', code: 'for zeile in datei:\n    print(zeile)', opts: ['Die Datei ist fehlerhaft', 'Jede Zeile endet mit \\n und print() fügt noch einen Umbruch hinzu', 'print() gibt immer zwei Zeilen aus', 'Weil die Datei nicht geschlossen wurde'], a: 1,
      ex: 'Abhilfe: <code>print(zeile.strip())</code>.' },
    { q: 'Was liefert csv.DictReader bei jedem Schleifendurchlauf?', opts: ['Einen String', 'Eine Liste von Strings', 'Ein Dictionary mit den Überschriften als Schlüssel', 'Eine Zahl'], a: 2,
      ex: 'Der <code>DictReader</code> liest die erste Zeile als Schlüssel ein. Jede weitere Zeile wird zu einem Dictionary, z. B. <code>zeile["Temperatur"]</code>.' },
    { q: 'Welcher Aufruf schreibt eine ganze zweidimensionale Liste auf einmal in eine CSV-Datei?', opts: ['datei.write(tabelle)', 'schreiber.writerow(tabelle)', 'schreiber.writerows(tabelle)', 'csv.save(tabelle)'], a: 2,
      ex: '<code>writerows()</code> (mit s) schreibt alle Zeilen. <code>writerow()</code> schreibt nur eine Zeile, und <code>write()</code> akzeptiert nur Strings.' },
    { q: 'Was muss man vor der ersten Verwendung von tabulate tun?', opts: ['Nichts, es gehört zur Standardbibliothek', 'Es mit pip installieren', 'Eine CSV-Datei anlegen', 'Python neu starten'], a: 1,
      ex: '<code>tabulate</code> ist eine externe Bibliothek: <code>py -m pip install tabulate</code>.' }
  ]);
})();
