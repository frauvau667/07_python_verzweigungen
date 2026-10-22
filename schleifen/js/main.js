/* ==========================================================
   Schleifen in Python – Interaktive Lernseite
   ----------------------------------------------------------
   Die Beispiele stehen weiter unten im Objekt EXAMPLES.
   Jedes Beispiel besteht aus:
     code       – der Python-Quelltext (Zeilen werden ab 1 gezählt)
     diagram    – das Struktogramm als Baum aus Bausteinen:
                  stmt    = Anweisung              { t:'stmt', id, text, lines, info, jump? }
                  empty   = leerer Zweig (∅)       { t:'empty', id, lines, info }
                  if      = Verzweigung            { t:'if', id, cond, lines, info, split?, yes:[…], no:[…] }
                  while   = kopfgesteuerte Schleife / Zählschleife
                                                   { t:'while', id, head, lines, info, body:[…] }
                  dowhile = fußgesteuerte Schleife { t:'dowhile', id, lines, info, body:[…],
                                                     footId, foot, footLines, footInfo }
                  "lines" verbindet den Baustein mit den Codezeilen.
     lineNotes  – Erklärungen für Codezeilen ohne eigenes Feld (z. B. Kommentare)
     inputs     – Eingabefelder für "Ausprobieren"
     run(v)     – simuliert das Programm und liefert die Schritte
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Syntax-Hervorhebung ---------- */
  const KW = new Set(['if', 'elif', 'else', 'while', 'for', 'in', 'break', 'continue', 'and', 'or', 'not',
    'True', 'False', 'None', 'is', 'import', 'from', 'pass', 'match', 'case']);
  const FN = new Set(['print', 'input', 'int', 'float', 'str', 'len', 'range']);

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(line) {
    const re = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_][A-Za-z0-9_]*)|(\d+(?:\.\d+)?)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += '<span class="t-com">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="t-str">' + esc(m[2]) + '</span>';
      else if (m[3]) {
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
     BEISPIELE
     ========================================================== */
  const EXAMPLES = {

    /* ---------- 1 Kopfgesteuert: Countdown ---------- */
    countdown: {
      code:
`bugs = int(input("Wie viele Bugs hat der Code? "))

while bugs > 0:
    print(f"{bugs} kleine Bugs im Code … einer gefixt!")
    bugs = bugs - 1

print("Keine Bugs mehr! (Bis zum nächsten Test.)")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: bugs', lines: [1],
          info: '<b>Eingabe:</b> Die Anzahl der Bugs wird als ganze Zahl eingelesen.' },
        { t: 'while', id: 'loop', head: 'solange bugs > 0', lines: [3],
          info: '<b>Schleifenkopf:</b> Vor <b>jedem</b> Durchlauf wird die Bedingung <code>bugs > 0</code> geprüft. Ist sie wahr, wird der eingerückte Block ausgeführt – danach springt das Programm wieder hierher zurück. Ist sie falsch, endet die Schleife.',
          body: [
            { t: 'stmt', id: 'out', text: 'Ausgabe: "{bugs} kleine Bugs im Code … einer gefixt!"', lines: [4],
              info: '<b>Schleifenkörper:</b> Diese Zeile ist eingerückt und gehört deshalb zur Schleife. Sie wird bei jedem Durchlauf ausgeführt.' },
            { t: 'stmt', id: 'dec', text: 'bugs = bugs - 1', lines: [5],
              info: '<b>Ganz wichtig:</b> Hier wird <code>bugs</code> um 1 kleiner. Nur deshalb wird die Bedingung irgendwann falsch und die Schleife endet. Ohne diese Zeile gäbe es eine <b>Endlosschleife</b>.' }
          ] },
        { t: 'stmt', id: 'end', text: 'Ausgabe: "Keine Bugs mehr! (Bis zum nächsten Test.)"', lines: [7],
          info: '<b>Nach der Schleife:</b> Diese Zeile ist nicht eingerückt. Sie wird erst ausgeführt, wenn die Schleife beendet ist – und nur <b>einmal</b>.' }
      ],
      inputs: [{ name: 'bugs', type: 'int', value: '3', min: -5, max: 15 }],
      run(v) {
        let z = v.bugs, n = 0;
        const s = [{ id: 'in', ask: ['Wie viele Bugs hat der Code? ', z], vars: { bugs: z } }];
        for (;;) {
          const ok = z > 0;
          s.push({ id: 'loop', check: 'bugs > 0  →  ' + z + ' > 0  →  ' + B(ok) + (ok ? '' : '  →  Schleife endet'), iter: ok ? ++n : undefined });
          if (!ok) break;
          s.push({ id: 'out', print: z + ' kleine Bugs im Code … einer gefixt!' });
          z -= 1;
          s.push({ id: 'dec', check: 'bugs = ' + (z + 1) + ' - 1  →  bugs ist jetzt ' + z, vars: { bugs: z } });
        }
        s.push({ id: 'end', print: 'Keine Bugs mehr! (Bis zum nächsten Test.)' });
        return s;
      }
    },

    /* ---------- 1 Kopfgesteuert: Endlosschleife ---------- */
    endlos: {
      code:
`bugs = 3

while bugs > 0:
    print(f"{bugs} kleine Bugs im Code … einer gefixt!")
    # Hier fehlt: bugs = bugs - 1

print("Keine Bugs mehr!")`,
      lineNotes: {
        5: '<b>Kommentar:</b> Alles hinter <code>#</code> ignoriert Python. Hier fehlt die Zeile, die <code>bugs</code> verkleinert – der Bug wird also nur <i>angeblich</i> gefixt. <code>bugs</code> ändert sich nie.'
      },
      diagram: [
        { t: 'stmt', id: 'set', text: 'bugs = 3', lines: [1], info: '<b>Startwert:</b> <code>bugs</code> bekommt den Wert 3.' },
        { t: 'while', id: 'loop', head: 'solange bugs > 0', lines: [3],
          info: '<b>Schleifenkopf:</b> <code>bugs</code> ist 3 und wird im Schleifenkörper nie verändert. Die Bedingung <code>3 > 0</code> ist also <b>immer wahr</b> – die Schleife endet nie.',
          body: [
            { t: 'stmt', id: 'out', text: 'Ausgabe: "{bugs} kleine Bugs im Code … einer gefixt!"', lines: [4],
              info: '<b>Schleifenkörper:</b> Hier wird nur ausgegeben. Es fehlt eine Anweisung, die <code>bugs</code> verändert.' }
          ] },
        { t: 'stmt', id: 'end', text: 'Ausgabe: "Keine Bugs mehr!"', lines: [7],
          info: '<b>Wird nie erreicht!</b> Weil die Schleife nie endet, kommt das Programm hier nie an. (Kommt Ihnen das aus echten Projekten bekannt vor?)' }
      ],
      inputs: [],
      run() {
        const s = [{ id: 'set', vars: { bugs: 3 }, check: 'bugs = 3' }];
        for (let n = 1; n <= 6; n++) {
          s.push({ id: 'loop', check: 'bugs > 0  →  3 > 0  →  True', iter: n });
          s.push({ id: 'out', print: '3 kleine Bugs im Code … einer gefixt!' });
        }
        s.push({ err: 'Die Lernseite hat hier nach 6 Durchläufen abgebrochen.' });
        s.push({ note: '# Python würde endlos weitermachen – eine Endlosschleife! „Keine Bugs mehr!“ wird nie erreicht. In echtem Python stoppt man so ein Programm mit Strg + C.' });
        return s;
      }
    },

    /* ---------- 2 Fußgesteuert: Würfeln ---------- */
    wuerfel: {
      code:
`import random

while True:
    wurf = random.randint(1, 6)
    print(f"Gewürfelt: {wurf}")
    if wurf == 6:
        break

print("Endlich eine 6!")`,
      lineNotes: {
        1: '<b>import random:</b> Lädt das Zusatzmodul <code>random</code> für Zufallszahlen. Es hat kein eigenes Feld im Struktogramm, weil hier noch nichts „passiert“.'
      },
      diagram: [
        { t: 'dowhile', id: 'loop', lines: [3],
          info: '<b>Schleifenbeginn mit <code>while True</code>:</b> <code>True</code> ist immer wahr – die Schleife würde also endlos laufen. Sie wird erst durch <code>break</code> beendet. So beginnt jeder Durchlauf <b>ohne</b> vorherige Prüfung.',
          body: [
            { t: 'stmt', id: 'roll', text: 'wurf = Zufallszahl von 1 bis 6', lines: [4],
              info: '<b>Würfeln:</b> <code>random.randint(1, 6)</code> liefert eine zufällige ganze Zahl von 1 bis 6 – hier sind beide Grenzen dabei.' },
            { t: 'stmt', id: 'out', text: 'Ausgabe: "Gewürfelt: {wurf}"', lines: [5],
              info: '<b>Ausgabe mit f-String:</b> An der Stelle <code>{wurf}</code> wird die gewürfelte Zahl eingesetzt.' }
          ],
          footId: 'cond', foot: 'solange wurf ≠ 6', footLines: [6, 7],
          footInfo: '<b>Schleifenfuß:</b> Die Bedingung wird erst <b>am Ende</b> jedes Durchlaufs geprüft – deshalb wird mindestens einmal gewürfelt. Im Code steht das Gegenteil: <code>if wurf == 6: break</code> – „wenn eine 6 kommt, brich ab“.' },
        { t: 'stmt', id: 'end', text: 'Ausgabe: "Endlich eine 6!"', lines: [9],
          info: '<b>Nach der Schleife:</b> Hierher springt das Programm nach dem <code>break</code>.' }
      ],
      inputs: [],
      run() {
        const s = [];
        let n = 0, w;
        do {
          n++;
          s.push({ id: 'loop', check: 'while True  →  Durchlauf ' + n + ' beginnt (ohne Prüfung)', iter: n });
          w = 1 + Math.floor(Math.random() * 6);
          s.push({ id: 'roll', vars: { wurf: w }, check: 'wurf = ' + w });
          s.push({ id: 'out', print: 'Gewürfelt: ' + w });
          s.push({ id: 'cond', check: 'wurf == 6  →  ' + w + ' == 6  →  ' + B(w === 6) + (w === 6 ? '  →  break' : '  →  noch einmal') });
        } while (w !== 6 && n < 40);
        if (w !== 6) {
          s.push({ err: 'So viel Pech! Die Lernseite bricht nach 40 Würfen ab.' });
          return s;
        }
        s.push({ id: 'end', print: 'Endlich eine 6!' });
        return s;
      }
    },

    /* ---------- 3 Zählschleife: Einmaleins ---------- */
    einmaleins: {
      code:
`reihe = int(input("Welche Einmaleins-Reihe? "))

for i in range(1, 11):
    print(f"{reihe} mal {i} = {reihe * i}")

print("Fertig!")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: reihe', lines: [1], info: '<b>Eingabe:</b> Welche Reihe soll berechnet werden?' },
        { t: 'while', id: 'loop', head: 'für i von 1 bis 10', lines: [3],
          info: '<b>Zählschleife:</b> <code>range(1, 11)</code> erzeugt die Zahlen 1, 2, …, 10. Die 11 ist <b>nicht</b> dabei! Die Laufvariable <code>i</code> bekommt bei jedem Durchlauf automatisch den nächsten Wert – man muss nicht selbst hochzählen.',
          body: [
            { t: 'stmt', id: 'out', text: 'Ausgabe: "{reihe} mal {i} = {reihe · i}"', lines: [4],
              info: '<b>Schleifenkörper:</b> Wird 10-mal ausgeführt, jedes Mal mit einem anderen Wert von <code>i</code>.' }
          ] },
        { t: 'stmt', id: 'end', text: 'Ausgabe: "Fertig!"', lines: [6], info: '<b>Nach der Schleife:</b> Wird einmal ausgeführt, wenn alle Werte von <code>range</code> durchlaufen sind.' }
      ],
      inputs: [{ name: 'reihe', type: 'int', value: '7', min: -100, max: 100 }],
      run(v) {
        const r = v.reihe;
        const s = [{ id: 'in', ask: ['Welche Einmaleins-Reihe? ', r], vars: { reihe: r } }];
        for (let i = 1; i <= 10; i++) {
          s.push({ id: 'loop', check: 'nächster Wert aus range(1, 11)  →  i = ' + i, vars: { i: i }, iter: i });
          s.push({ id: 'out', print: r + ' mal ' + i + ' = ' + r * i });
        }
        s.push({ id: 'loop', check: 'range(1, 11) hat keine Werte mehr  →  Schleife endet' });
        s.push({ id: 'end', print: 'Fertig!' });
        return s;
      }
    },

    /* ---------- 4 continue: Aufzug ---------- */
    aufzug: {
      minWidth: 320,
      code:
`for stockwerk in range(10, 16):
    if stockwerk == 13:
        continue
    print(f"Halt in Stockwerk {stockwerk}")`,
      diagram: [
        { t: 'while', id: 'loop', head: 'für stockwerk von 10 bis 15', lines: [1],
          info: '<b>Zählschleife:</b> <code>range(10, 16)</code> liefert 10, 11, 12, 13, 14, 15. Die 16 ist nicht dabei.',
          body: [
            { t: 'if', id: 'c', cond: 'stockwerk == 13', lines: [2],
              info: '<b>Bedingung:</b> Bei jedem Durchlauf wird geprüft, ob gerade das 13. Stockwerk dran ist.',
              yes: [{ t: 'stmt', id: 'cont', jump: true, text: 'continue → nächster Durchlauf', lines: [3],
                      info: '<b>continue:</b> Der <b>Rest dieses Durchlaufs</b> wird übersprungen – die Ausgabe darunter wird also nicht ausgeführt. Die Schleife macht direkt mit dem nächsten Wert (14) weiter.' }],
              no: [{ t: 'empty', id: 'no', lines: [], info: '<b>Falsch-Zweig:</b> Es passiert nichts Besonderes – das Programm macht mit der Ausgabe weiter.' }] },
            { t: 'stmt', id: 'out', text: 'Ausgabe: "Halt in Stockwerk {stockwerk}"', lines: [4],
              info: '<b>Ausgabe:</b> Wird in jedem Durchlauf ausgeführt – <b>außer</b> wenn vorher <code>continue</code> kam.' }
          ] }
      ],
      inputs: [],
      run() {
        const s = [];
        let n = 0;
        for (let k = 10; k <= 15; k++) {
          s.push({ id: 'loop', check: 'nächster Wert aus range(10, 16)  →  stockwerk = ' + k, vars: { stockwerk: k }, iter: ++n });
          const hit = k === 13;
          s.push({ id: 'c', check: 'stockwerk == 13  →  ' + k + ' == 13  →  ' + B(hit) });
          if (hit) {
            s.push({ id: 'cont', check: 'continue  →  Ausgabe überspringen, weiter mit dem nächsten Wert' });
            continue;
          }
          s.push({ id: 'no' });
          s.push({ id: 'out', print: 'Halt in Stockwerk ' + k });
        }
        s.push({ id: 'loop', check: 'range(10, 16) hat keine Werte mehr  →  Schleife endet' });
        return s;
      }
    },

    /* ---------- 4 break + else: Geheimzahl ---------- */
    geheim: {
      minWidth: 340,
      code:
`fehlerzeile = int(input("In welcher Zeile steckt der Bug? "))

for zeile in range(5):
    print(f"Prüfe Zeile {zeile} …")
    if zeile == fehlerzeile:
        print("Bug gefunden!")
        break
else:
    print("Kein Bug gefunden. Muss ein Feature sein.")

print("Feierabend!")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: fehlerzeile', lines: [1], info: '<b>Eingabe:</b> Die Zeile, in der sich der Bug versteckt.' },
        { t: 'while', id: 'loop', head: 'für zeile von 0 bis 4', lines: [3],
          info: '<b>Zählschleife:</b> <code>range(5)</code> ohne Startwert beginnt bei 0 und liefert 0, 1, 2, 3, 4.',
          body: [
            { t: 'stmt', id: 'out', text: 'Ausgabe: "Prüfe Zeile {zeile} …"', lines: [4], info: 'Zeigt, welche Zeile gerade geprüft wird.' },
            { t: 'if', id: 'c', cond: 'zeile == fehlerzeile', lines: [5],
              info: '<b>Bedingung:</b> Steckt der Bug in der aktuellen Zeile?',
              yes: [
                { t: 'stmt', id: 'found', text: 'Ausgabe: "Bug gefunden!"', lines: [6], info: 'Der Bug wurde gefunden.' },
                { t: 'stmt', id: 'brk', jump: true, text: 'break → Schleife verlassen', lines: [7],
                  info: '<b>break:</b> Die <b>ganze Schleife</b> wird sofort beendet. Die restlichen Zeilen werden nicht mehr geprüft – und auch der <code>else</code>-Block nach der Schleife wird übersprungen.' }
              ],
              no: [{ t: 'empty', id: 'no', lines: [], info: '<b>Falsch-Zweig:</b> Nichts passiert – der nächste Durchlauf beginnt.' }] }
          ] },
        { t: 'stmt', id: 'else', text: 'nur ohne break: Ausgabe "Kein Bug gefunden. Muss ein Feature sein."', lines: [8, 9],
          info: '<b>else nach der Schleife:</b> Steht auf derselben Höhe wie <code>for</code>. Dieser Block wird nur ausgeführt, wenn die Schleife <b>normal zu Ende</b> gelaufen ist, also <b>kein</b> <code>break</code> kam. (Und ja: „Das ist kein Bug, das ist ein Feature“ ist die älteste Ausrede der Softwareentwicklung.)' },
        { t: 'stmt', id: 'end', text: 'Ausgabe: "Feierabend!"', lines: [11], info: 'Wird immer ausgeführt – egal, ob mit oder ohne <code>break</code>.' }
      ],
      inputs: [{ name: 'fehlerzeile', type: 'int', value: '3', min: -99, max: 99 }],
      run(v) {
        const g = v.fehlerzeile;
        const s = [{ id: 'in', ask: ['In welcher Zeile steckt der Bug? ', g], vars: { fehlerzeile: g } }];
        for (let k = 0; k < 5; k++) {
          s.push({ id: 'loop', check: 'nächster Wert aus range(5)  →  zeile = ' + k, vars: { zeile: k }, iter: k + 1 });
          s.push({ id: 'out', print: 'Prüfe Zeile ' + k + ' …' });
          const hit = k === g;
          s.push({ id: 'c', check: 'zeile == fehlerzeile  →  ' + k + ' == ' + g + '  →  ' + B(hit) });
          if (hit) {
            s.push({ id: 'found', print: 'Bug gefunden!' });
            s.push({ id: 'brk', check: 'break  →  Schleife sofort verlassen, else wird übersprungen' });
            s.push({ id: 'end', print: 'Feierabend!' });
            return s;
          }
          s.push({ id: 'no' });
        }
        s.push({ id: 'loop', check: 'range(5) hat keine Werte mehr  →  Schleife endet ohne break' });
        s.push({ id: 'else', print: 'Kein Bug gefunden. Muss ein Feature sein.' });
        s.push({ id: 'end', print: 'Feierabend!' });
        return s;
      }
    }
  };

  /* ==========================================================
     Struktogramm zeichnen
     ========================================================== */
  function svgLines(points) {
    return '<svg class="ns-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<polyline points="' + points + '"/></svg>';
  }

  // Ein Baustein kann aus mehreren Elementen bestehen (z. B. Schleifenkopf + Klammer)
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

  function renderSeq(st, items, parent) {
    items.forEach((item) => parent.appendChild(renderItem(st, item)));
  }

  function renderItem(st, item) {
    if (item.t === 'stmt') {
      const c = el('div', 'ns-cell ns-stmt' + (item.jump ? ' ns-jump' : ''));
      c.textContent = item.text;
      c.setAttribute('aria-label', item.text);
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
      head.setAttribute('aria-label', 'Schleifenkopf: ' + item.head);
      makeClickable(st, head, item.id, item.lines, item.info);
      const inner = el('div', 'ns-loop-inner');
      const bar = el('div', 'ns-cell ns-loopbar');
      bar.setAttribute('aria-label', 'Schleife: ' + item.head);
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
      bar.setAttribute('aria-label', 'Schleifenbeginn');
      makeClickable(st, bar, item.id, item.lines, item.info);
      const body = el('div', 'ns-col');
      renderSeq(st, item.body, body);
      inner.append(bar, body);
      const foot = el('div', 'ns-cell ns-loopfoot');
      foot.textContent = item.foot;
      foot.setAttribute('aria-label', 'Schleifenfuß: ' + item.foot);
      makeClickable(st, foot, item.footId, item.footLines, item.footInfo);
      wrap.append(inner, foot);
      return wrap;
    }
    throw new Error('Unbekannter Baustein: ' + item.t);
  }

  /* ==========================================================
     Beispiel aufbauen
     ========================================================== */
  const DEFAULT_INFO = '<p>Tippe auf ein <b>Feld im Struktogramm</b> oder auf eine <b>Codezeile</b>, um zu sehen, was zusammengehört.</p>';

  function buildExample(host) {
    const key = host.dataset.example;
    const ex = EXAMPLES[key];
    if (!ex) return;
    const st = { key, ex, host, cells: {}, lines: [], codeLines: ex.code.split('\n'), timer: null, steps: null, pos: 0, vars: {}, iter: null };

    const grid = el('div', 'ex-grid');

    // Struktogramm
    const pDia = el('div', 'panel ex-diagram');
    pDia.appendChild(el('div', 'panel-title', '<span>Struktogramm</span>'));
    const scroll = el('div', 'ns-scroll');
    const ns = el('div', 'ns');
    if (ex.minWidth) ns.style.setProperty('--minw', ex.minWidth + 'px');
    renderSeq(st, ex.diagram, ns);
    scroll.appendChild(ns);
    pDia.appendChild(scroll);
    st.info = el('div', 'info', DEFAULT_INFO);
    st.info.setAttribute('aria-live', 'polite');
    pDia.appendChild(st.info);

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

    // Ausprobieren
    const pRun = el('div', 'panel ex-run');
    pRun.appendChild(el('div', 'panel-title', '<span>Ausprobieren</span>'));
    const form = el('form', 'run-form');
    form.noValidate = true;
    st.fields = {};
    ex.inputs.forEach((inp) => {
      const id = 'f-' + key + '-' + inp.name;
      const f = el('div', 'field');
      const lab = el('label', null);
      lab.htmlFor = id;
      lab.textContent = inp.name;
      const field = el('input');
      field.type = 'text';
      field.value = inp.value;
      field.autocomplete = 'off';
      field.setAttribute('autocapitalize', 'off');
      field.setAttribute('autocorrect', 'off');
      field.spellcheck = false;
      if (inp.type === 'int') {
        field.inputMode = 'numeric';
        field.setAttribute('pattern', '-?[0-9]*');
      }
      field.id = id;
      field.addEventListener('input', () => { stopRun(st); st.steps = null; });
      st.fields[inp.name] = { el: field, type: inp.type, min: inp.min, max: inp.max };
      f.append(lab, field);
      form.appendChild(f);
    });

    // Tempo
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
    stepBtn.title = 'Einen Schritt weiter';
    const resetBtn = el('button', 'btn', 'Zurücksetzen');
    resetBtn.type = 'button';
    btns.append(runBtn, stepBtn, resetBtn);
    form.appendChild(btns);
    st.runBtn = runBtn;
    form.addEventListener('submit', (e) => { e.preventDefault(); toggleRun(st); });
    stepBtn.addEventListener('click', () => singleStep(st));
    resetBtn.addEventListener('click', () => resetExample(st));
    pRun.appendChild(form);

    st.varsBox = el('div', 'vars');
    st.varsBox.setAttribute('aria-live', 'polite');
    pRun.appendChild(st.varsBox);
    st.console = el('div', 'console');
    st.console.setAttribute('aria-live', 'polite');
    st.console.setAttribute('aria-label', 'Programmausgabe');
    pRun.appendChild(st.console);
    consolePlaceholder(st);
    renderVars(st, []);

    grid.append(pDia, pCode, pRun);
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
    if (node && !isVisible(node)) {
      node.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    }
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
    box.innerHTML = '<span class="vars-label">Variablen</span>';
    const names = Object.keys(st.vars);
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
      const c = el('span', 'var-chip' + (changed.includes(k) ? ' changed' : ''));
      c.textContent = k + ' = ' + st.vars[k];
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
    st.vars = {};
    st.iter = null;
    ['is-sel', 'is-run', 'is-now'].forEach((c) => clearClass(st, c));
    st.info.innerHTML = DEFAULT_INFO;
    st.info.classList.remove('is-sel');
    consolePlaceholder(st);
    renderVars(st, []);
  }

  function readInputs(st) {
    const v = {};
    for (const [name, f] of Object.entries(st.fields)) {
      const raw = f.el.value;
      if (f.type === 'int') {
        if (!/^\s*-?\d+\s*$/.test(raw)) {
          return { error: 'ValueError: invalid literal for int(): ' + q(raw), hint: 'int() kann „' + raw + '“ nicht in eine ganze Zahl umwandeln. Bitte gib bei „' + name + '“ eine ganze Zahl ein.' };
        }
        const n = parseInt(raw, 10);
        if ((f.min != null && n < f.min) || (f.max != null && n > f.max)) {
          return { error: 'Bitte gib bei „' + name + '“ eine Zahl von ' + f.min + ' bis ' + f.max + ' ein.', hint: 'Python könnte auch größere Zahlen verarbeiten – die Grenze sorgt nur dafür, dass die Animation nicht zu lange dauert.' };
        }
        v[name] = n;
      } else {
        v[name] = raw;
      }
    }
    return { values: v };
  }

  // Bereitet einen neuen Programmlauf vor. Gibt false zurück, wenn die Eingabe ungültig ist.
  function prepare(st) {
    stopRun(st);
    ['is-sel', 'is-run', 'is-now'].forEach((c) => clearClass(st, c));
    st.info.classList.remove('is-sel');
    st.info.innerHTML = '<p>Das Programm läuft … Der <b>grüne Weg</b> zeigt, welche Felder und Zeilen schon ausgeführt wurden, der <b>dicke Rahmen</b> den aktuellen Schritt. Graue Kommentare in der Konsole zeigen, wie die Bedingungen ausgewertet werden.</p>';
    st.console.innerHTML = '';
    st.vars = {};
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

  // Führt genau einen Schritt aus
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
    if (step.iter != null && step.iter !== st.iter) { st.iter = step.iter; changed.push('#iter'); }
    if (step.vars) {
      Object.entries(step.vars).forEach(([k, v]) => { st.vars[k] = v; changed.push(k); });
    }
    if (changed.length) renderVars(st, changed);
    if (step.ask) cLine(st, [[null, step.ask[0]], ['c-user', String(step.ask[1])]]);
    if (step.check) cLine(st, [['c-eval', '# ' + step.check]]);
    if (step.print != null) cLine(st, [[null, step.print]]);
    if (step.err) cLine(st, [['c-err', '⚠ ' + step.err]]);
    if (step.note) cLine(st, [['c-muted', step.note]]);
    return true;
  }

  function tick(st) {
    if (doStep(st)) st.timer = setTimeout(() => tick(st), SPEEDS[st.speed.value]);
  }

  function toggleRun(st) {
    if (st.timer) { stopRun(st); return; } // Pause
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
    } else {
      fallbackCopy(text, done);
    }
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
     range-Labor
     ========================================================== */
  function initRangeLab() {
    const box = document.getElementById('range-lab');
    if (!box) return;
    const fStart = document.getElementById('r-start');
    const fStop = document.getElementById('r-stop');
    const fStep = document.getElementById('r-step');
    const code = document.getElementById('r-code');
    const chips = document.getElementById('r-chips');
    const note = document.getElementById('r-note');
    const isInt = (s) => /^\s*-?\d+\s*$/.test(s);

    const update = () => {
      const sRaw = fStart.value.trim(), eRaw = fStop.value.trim(), pRaw = fStep.value.trim();
      chips.innerHTML = '';
      note.className = 'range-note';
      let args;
      if (pRaw !== '') args = [sRaw === '' ? '0' : sRaw, eRaw, pRaw];
      else if (sRaw !== '') args = [sRaw, eRaw];
      else args = [eRaw];
      code.innerHTML = highlight('for i in range(' + args.join(', ') + '):') + '\n' + highlight('    print(i)');

      if (eRaw === '' || [sRaw, eRaw, pRaw].some((x) => x !== '' && !isInt(x))) {
        note.className = 'range-note err';
        note.textContent = 'Bitte nur ganze Zahlen eingeben. Der stop-Wert muss immer angegeben werden.';
        return;
      }
      const start = sRaw === '' ? 0 : parseInt(sRaw, 10);
      const stop = parseInt(eRaw, 10);
      const step = pRaw === '' ? 1 : parseInt(pRaw, 10);
      if (step === 0) {
        note.className = 'range-note err';
        note.textContent = 'ValueError: Die Schrittweite (step) darf nicht 0 sein – sonst käme die Schleife nie voran.';
        return;
      }
      const vals = [];
      for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        vals.push(i);
        if (vals.length > 60) break;
      }
      const tooMany = vals.length > 60;
      if (tooMany) vals.length = 60;
      vals.forEach((v, idx) => {
        const c = el('span', 'chip');
        c.textContent = v;
        if (!reducedMotion) c.style.animationDelay = Math.min(idx * 40, 800) + 'ms';
        chips.appendChild(c);
      });
      if (tooMany) chips.appendChild(el('span', 'chip-label', '… und noch mehr'));
      const stopChip = el('span', 'chip stop');
      stopChip.textContent = stop;
      stopChip.title = 'Der stop-Wert ist nicht dabei';
      chips.appendChild(stopChip);
      chips.appendChild(el('span', 'chip-label', '← stop, nicht dabei'));

      const parts = [];
      if (sRaw === '') parts.push('Kein start angegeben → es geht bei <b>0</b> los.');
      if (!vals.length) parts.push('<b>Keine Werte:</b> Vom Start aus wird der stop-Wert in dieser Richtung nie erreicht – die Schleife läuft <b>0-mal</b>.' + (step > 0 && start > stop ? ' Zum Rückwärtszählen braucht man einen negativen step.' : ''));
      else parts.push('Die Schleife läuft <b>' + (tooMany ? 'mehr als 60' : vals.length) + '-mal</b>, i wird nacheinander zu jeder dieser Zahlen.');
      if (step < 0) parts.push('Negativer step → es wird <b>rückwärts</b> gezählt.');
      note.innerHTML = parts.join(' ');
    };

    [fStart, fStop, fStep].forEach((f) => f.addEventListener('input', update));
    box.querySelectorAll('[data-preset]').forEach((b) => {
      b.addEventListener('click', () => {
        const [a, c, d] = b.dataset.preset.split(',');
        fStart.value = a; fStop.value = c; fStep.value = d;
        update();
      });
    });
    update();
  }

  /* ==========================================================
     Quiz
     ========================================================== */
  const QUIZ = [
    { q: 'Wie oft wird „Hallo“ ausgegeben?',
      code: 'for i in range(3):\n    print("Hallo")',
      opts: ['2-mal', '3-mal', '4-mal', 'Endlos'], a: 1,
      ex: '<code>range(3)</code> liefert 0, 1, 2 – das sind drei Werte, also drei Durchläufe.' },
    { q: 'Welche Zahlen liefert range(2, 6)?',
      opts: ['2, 3, 4, 5, 6', '2, 3, 4, 5', '3, 4, 5, 6', '2, 4, 6'], a: 1,
      ex: 'Der Startwert 2 ist dabei, der stop-Wert 6 aber <b>nicht</b>.' },
    { q: 'Was passiert bei diesem Programm?',
      code: 'i = 0\nwhile i < 3:\n    print(i)',
      opts: ['Es gibt 0, 1, 2 aus', 'Es gibt nichts aus', 'Es gibt endlos 0 aus', 'Fehlermeldung'], a: 2,
      ex: '<code>i</code> wird nie erhöht und bleibt 0. Die Bedingung <code>0 < 3</code> ist immer wahr – eine <b>Endlosschleife</b>. Es fehlt <code>i += 1</code>.' },
    { q: 'Welche Schleife wird auf jeden Fall mindestens einmal durchlaufen?',
      opts: ['Kopfgesteuerte Schleife (while Bedingung)', 'Fußgesteuerte Schleife (while True + break)', 'Zählschleife mit range(0)', 'Keine'], a: 1,
      ex: 'Bei der fußgesteuerten Schleife wird erst <b>am Ende</b> geprüft. Eine kopfgesteuerte Schleife kann 0-mal laufen, wenn die Bedingung schon am Anfang falsch ist.' },
    { q: 'Was gibt dieses Programm aus?',
      code: 'for i in range(1, 6):\n    if i == 3:\n        continue\n    print(i)',
      opts: ['1 2', '1 2 3 4 5', '1 2 4 5', '3'], a: 2,
      ex: 'Bei <code>i == 3</code> springt <code>continue</code> sofort zum nächsten Durchlauf – die 3 wird nicht ausgegeben. Danach geht es mit 4 und 5 weiter.' },
    { q: 'Was gibt dieses Programm aus?',
      code: 'for i in range(1, 6):\n    if i == 3:\n        break\n    print(i)',
      opts: ['1 2', '1 2 3', '1 2 4 5', 'Nichts'], a: 0,
      ex: '<code>break</code> beendet die <b>ganze</b> Schleife, sobald <code>i</code> 3 ist. Ausgegeben werden nur 1 und 2.' },
    { q: 'Wann wird der else-Block nach einer Schleife ausgeführt?',
      opts: ['Immer', 'Nur wenn die Schleife 0-mal lief', 'Nur wenn die Schleife ohne break zu Ende lief', 'Nur nach einem break'], a: 2,
      ex: 'Das <code>else</code> einer Schleife bedeutet „wenn nicht abgebrochen“. Nach einem <code>break</code> wird es übersprungen.' }
  ];

  function initQuiz() {
    const list = document.getElementById('quiz-list');
    const score = document.getElementById('quiz-score');
    if (!list) return;
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
     Statische Code-Blöcke, Navigation, Theme
     ========================================================== */
  function highlightStatic() {
    document.querySelectorAll('pre.py:not(.range-code)').forEach((pre) => {
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
            const left = a.offsetLeft - bar.clientWidth / 2 + a.clientWidth / 2;
            bar.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
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
      const current = root.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* ignorieren */ }
    });
  }

  /* ==========================================================
     Ein- und Ausklappen der Kapitel
     Jedes Kapitel ist zunächst zugeklappt (Klick auf die Überschrift öffnet es).
     ========================================================== */
  function setExpanded(btn, panel, open) {
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
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
        setExpanded(btn, body, open);
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
    initRangeLab();
    initQuiz();
    initCollapsible();
    initNav();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
