/* ==========================================================
   Verzweigungen in Python – Interaktive Lernseite
   ----------------------------------------------------------
   Die Beispiele stehen weiter unten im Objekt EXAMPLES.
   Jedes Beispiel besteht aus:
     code      – der Python-Quelltext (Zeilen werden ab 1 gezählt)
     diagram   – das Struktogramm als Baum aus Bausteinen
                 stmt  = Anweisung        { t:'stmt', id, text, lines, info }
                 empty = leerer Zweig (∅) { t:'empty', id, lines, info }
                 if    = Verzweigung      { t:'if', id, cond, lines, info, split, yes:[…], no:[…] }
                 case  = Fallauswahl      { t:'case', id, expr, lines, info, cases:[{ id, label, lines, info, body:[…] }] }
                 "lines" verbindet den Baustein mit den Codezeilen.
     inputs    – Eingabefelder für "Ausprobieren"
     run(v)    – simuliert das Programm und liefert die Schritte
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Syntax-Hervorhebung ---------- */
  const KW = new Set(['if', 'elif', 'else', 'match', 'case', 'and', 'or', 'not', 'True', 'False', 'None', 'in', 'is']);
  const FN = new Set(['print', 'input', 'int', 'float', 'str', 'len']);

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
  const STEP_DELAY = reducedMotion ? 250 : 800;

  /* ==========================================================
     BEISPIELE
     ========================================================== */
  const EXAMPLES = {

    /* ---------- 2.1 Einseitige Verzweigung ---------- */
    einseitig: {
      code:
`temperatur = int(input("Wie warm ist es heute (°C)? "))

if temperatur > 25:
    print("Es ist heiß! Vergiss die Sonnencreme nicht.")

print("Schönen Tag noch!")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: temperatur', lines: [1],
          info: '<b>Eingabe:</b> Der Benutzer tippt eine Temperatur ein. <code>input()</code> liefert immer einen Text – <code>int()</code> macht daraus eine ganze Zahl, damit man sie vergleichen kann.' },
        { t: 'if', id: 'c', cond: 'temperatur > 25', lines: [3],
          info: '<b>Bedingung:</b> Hier wird gefragt: „Ist die Temperatur größer als 25?“ Die Antwort ist <code>True</code> oder <code>False</code>. Achte auf den <b>Doppelpunkt</b> am Ende der Zeile!',
          yes: [
            { t: 'stmt', id: 'y', text: 'Ausgabe: "Es ist heiß! Vergiss die Sonnencreme nicht."', lines: [4],
              info: '<b>Wahr-Zweig:</b> Diese Zeile ist um 4 Leerzeichen <b>eingerückt</b> – deshalb gehört sie zum <code>if</code>. Sie wird nur ausgeführt, wenn die Bedingung wahr ist.' }
          ],
          no: [
            { t: 'empty', id: 'n', lines: [],
              info: '<b>Falsch-Zweig (∅):</b> Hier passiert <b>nichts</b>. Bei einer einseitigen Verzweigung gibt es keinen <code>else</code>-Teil – deshalb gibt es dafür auch keine Codezeile.' }
          ] },
        { t: 'stmt', id: 'end', text: 'Ausgabe: "Schönen Tag noch!"', lines: [6],
          info: '<b>Nach der Verzweigung:</b> Diese Zeile ist <b>nicht eingerückt</b>. Sie gehört nicht mehr zum <code>if</code> und wird deshalb <b>immer</b> ausgeführt – egal, wie die Bedingung ausgegangen ist.' }
      ],
      inputs: [{ name: 'temperatur', type: 'int', value: '30' }],
      run(v) {
        const t = v.temperatur, ok = t > 25;
        const s = [
          { id: 'in', ask: ['Wie warm ist es heute (°C)? ', t] },
          { id: 'c', check: 'temperatur > 25  →  ' + t + ' > 25  →  ' + B(ok) }
        ];
        s.push(ok ? { id: 'y', print: 'Es ist heiß! Vergiss die Sonnencreme nicht.' } : { id: 'n', check: 'Falsch-Zweig: nichts zu tun' });
        s.push({ id: 'end', print: 'Schönen Tag noch!' });
        return s;
      }
    },

    /* ---------- 2.2 Zweiseitige Verzweigung ---------- */
    zweiseitig: {
      code:
`stunde = int(input("Wie spät ist es (volle Stunde)? "))

if stunde >= 8 and stunde < 18:
    print("Der Laden ist geöffnet.")
else:
    print("Der Laden ist geschlossen.")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: stunde', lines: [1],
          info: '<b>Eingabe:</b> Die Uhrzeit wird als ganze Zahl eingelesen, z. B. 14 für 14 Uhr.' },
        { t: 'if', id: 'c', cond: 'stunde >= 8 and stunde < 18', lines: [3],
          info: '<b>Bedingung mit <code>and</code>:</b> Zwei Vergleiche müssen <b>beide</b> wahr sein: Die Stunde ist mindestens 8 <b>und</b> kleiner als 18. Ist nur einer falsch, ist die ganze Bedingung falsch.',
          yes: [
            { t: 'stmt', id: 'y', text: 'Ausgabe: "Der Laden ist geöffnet."', lines: [4],
              info: '<b>Wahr-Zweig:</b> Wird ausgeführt, wenn die Bedingung wahr ist.' }
          ],
          no: [
            { t: 'stmt', id: 'n', text: 'Ausgabe: "Der Laden ist geschlossen."', lines: [5, 6],
              info: '<b>Falsch-Zweig mit <code>else</code>:</b> <code>else</code> bedeutet „sonst“. Dieser Block wird in <b>allen anderen Fällen</b> ausgeführt. <code>else</code> hat <b>keine</b> eigene Bedingung, aber einen Doppelpunkt.' }
          ] }
      ],
      inputs: [{ name: 'stunde', type: 'int', value: '14' }],
      run(v) {
        const h = v.stunde, a = h >= 8, b = h < 18, ok = a && b;
        const s = [
          { id: 'in', ask: ['Wie spät ist es (volle Stunde)? ', h] },
          { id: 'c', check: h + ' >= 8 → ' + B(a) + ',  ' + h + ' < 18 → ' + B(b) + '  →  ' + B(a) + ' and ' + B(b) + '  →  ' + B(ok) }
        ];
        s.push(ok ? { id: 'y', print: 'Der Laden ist geöffnet.' } : { id: 'n', print: 'Der Laden ist geschlossen.' });
        return s;
      }
    },

    /* ---------- 2.3 Verschachtelte Verzweigung ---------- */
    verschachtelt: {
      minWidth: 500,
      code:
`regen = input("Regnet es? (ja/nein) ")
temperatur = int(input("Wie warm ist es (°C)? "))

if regen == "ja":
    if temperatur < 10:
        print("Nimm Regenjacke und Mütze mit.")
    else:
        print("Ein Regenschirm reicht.")
else:
    if temperatur > 25:
        print("T-Shirt-Wetter!")
    else:
        print("Zieh einen Pullover an.")`,
      diagram: [
        { t: 'stmt', id: 'in1', text: 'Eingabe: regen', lines: [1],
          info: '<b>Eingabe:</b> Hier wird ein <b>Text</b> eingelesen („ja“ oder „nein“). Weil wir mit Text vergleichen, brauchen wir kein <code>int()</code>.' },
        { t: 'stmt', id: 'in2', text: 'Eingabe: temperatur', lines: [2],
          info: '<b>Eingabe:</b> Die Temperatur wird als ganze Zahl eingelesen.' },
        { t: 'if', id: 'c1', cond: 'regen == "ja"', lines: [4],
          info: '<b>Äußere Bedingung:</b> Zuerst wird gefragt, ob es regnet. Texte stehen in Anführungszeichen. Je nach Antwort geht es links (Wahr) oder rechts (Falsch) weiter.',
          yes: [
            { t: 'if', id: 'c2', cond: 'temperatur < 10', lines: [5],
              info: '<b>Innere Bedingung (im Wahr-Zweig):</b> Diese Frage wird <b>nur</b> gestellt, wenn es regnet. Im Code ist sie einmal eingerückt, weil sie zum äußeren <code>if</code> gehört.',
              yes: [{ t: 'stmt', id: 'y1', text: 'Ausgabe: "Nimm Regenjacke und Mütze mit."', lines: [6],
                      info: '<b>Regen und kalt:</b> Diese Zeile ist <b>doppelt</b> eingerückt (8 Leerzeichen) – sie gehört zum inneren <code>if</code>.' }],
              no: [{ t: 'stmt', id: 'n1', text: 'Ausgabe: "Ein Regenschirm reicht."', lines: [7, 8],
                     info: '<b>Regen, aber nicht kalt:</b> Das innere <code>else</code> gehört zum inneren <code>if</code> – man erkennt es daran, dass beide gleich weit eingerückt sind.' }]
            }
          ],
          no: [
            { t: 'if', id: 'c3', cond: 'temperatur > 25', lines: [9, 10],
              info: '<b>Innere Bedingung (im Falsch-Zweig):</b> Das äußere <code>else</code> (Zeile 9) führt hierher, wenn es <b>nicht</b> regnet. Dann wird gefragt, ob es heiß ist.',
              yes: [{ t: 'stmt', id: 'y2', text: 'Ausgabe: "T-Shirt-Wetter!"', lines: [11],
                      info: '<b>Kein Regen und heiß.</b>' }],
              no: [{ t: 'stmt', id: 'n2', text: 'Ausgabe: "Zieh einen Pullover an."', lines: [12, 13],
                     info: '<b>Kein Regen und nicht heiß.</b>' }]
            }
          ] }
      ],
      inputs: [
        { name: 'regen', type: 'select', options: ['ja', 'nein'], value: 'ja' },
        { name: 'temperatur', type: 'int', value: '15' }
      ],
      run(v) {
        const r = v.regen, t = v.temperatur, ok1 = r === 'ja';
        const s = [
          { id: 'in1', ask: ['Regnet es? (ja/nein) ', r] },
          { id: 'in2', ask: ['Wie warm ist es (°C)? ', t] },
          { id: 'c1', check: 'regen == "ja"  →  ' + q(r) + ' == "ja"  →  ' + B(ok1) }
        ];
        if (ok1) {
          const ok2 = t < 10;
          s.push({ id: 'c2', check: 'temperatur < 10  →  ' + t + ' < 10  →  ' + B(ok2) });
          s.push(ok2 ? { id: 'y1', print: 'Nimm Regenjacke und Mütze mit.' } : { id: 'n1', print: 'Ein Regenschirm reicht.' });
        } else {
          const ok3 = t > 25;
          s.push({ id: 'c3', check: 'temperatur > 25  →  ' + t + ' > 25  →  ' + B(ok3) });
          s.push(ok3 ? { id: 'y2', print: 'T-Shirt-Wetter!' } : { id: 'n2', print: 'Zieh einen Pullover an.' });
        }
        return s;
      }
    },

    /* ---------- 2.4 match: Ampel ---------- */
    ampel: {
      minWidth: 340,
      code:
`farbe = input("Welche Farbe hat die Ampel? ")

match farbe:
    case "rot":
        print("Stehen bleiben!")
    case "gelb":
        print("Achtung, warten!")
    case "grün":
        print("Du darfst gehen.")
    case _:
        print("Diese Farbe gibt es nicht.")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: farbe', lines: [1],
          info: '<b>Eingabe:</b> Die Farbe wird als Text eingelesen.' },
        { t: 'case', id: 'm', expr: 'farbe', lines: [3],
          info: '<b>match:</b> Der Wert der Variablen <code>farbe</code> wird nacheinander mit den Fällen darunter verglichen.',
          cases: [
            { id: 'k1', label: '"rot"', lines: [4], info: '<b>case "rot":</b> Passt, wenn <code>farbe</code> genau <code>"rot"</code> ist – auch Groß-/Kleinschreibung muss stimmen!',
              body: [{ t: 'stmt', id: 'b1', text: 'Ausgabe: "Stehen bleiben!"', lines: [5], info: 'Wird ausgeführt, wenn der Fall <code>"rot"</code> passt.' }] },
            { id: 'k2', label: '"gelb"', lines: [6], info: '<b>case "gelb":</b> Wird nur geprüft, wenn <code>"rot"</code> nicht gepasst hat.',
              body: [{ t: 'stmt', id: 'b2', text: 'Ausgabe: "Achtung, warten!"', lines: [7], info: 'Wird ausgeführt, wenn der Fall <code>"gelb"</code> passt.' }] },
            { id: 'k3', label: '"grün"', lines: [8], info: '<b>case "grün":</b> Dritter Fall.',
              body: [{ t: 'stmt', id: 'b3', text: 'Ausgabe: "Du darfst gehen."', lines: [9], info: 'Wird ausgeführt, wenn der Fall <code>"grün"</code> passt.' }] },
            { id: 'k4', label: 'sonst ( _ )', lines: [10], info: '<b>case _:</b> Der Unterstrich passt <b>immer</b>. Er ist wie <code>else</code> und fängt alle Werte auf, für die es keinen eigenen Fall gibt. Er muss deshalb ganz unten stehen.',
              body: [{ t: 'stmt', id: 'b4', text: 'Ausgabe: "Diese Farbe gibt es nicht."', lines: [11], info: 'Wird ausgeführt, wenn keiner der Fälle davor gepasst hat.' }] }
          ] }
      ],
      inputs: [{ name: 'farbe', type: 'text', value: 'grün', options: ['rot', 'gelb', 'grün', 'blau'] }],
      run(v) {
        const f = v.farbe;
        const s = [
          { id: 'in', ask: ['Welche Farbe hat die Ampel? ', f] },
          { id: 'm', check: 'match farbe  →  farbe ist ' + q(f) }
        ];
        const cases = [['k1', 'b1', 'rot', 'Stehen bleiben!'], ['k2', 'b2', 'gelb', 'Achtung, warten!'], ['k3', 'b3', 'grün', 'Du darfst gehen.']];
        for (const [k, b, val, out] of cases) {
          const hit = f === val;
          s.push({ id: k, check: 'case ' + q(val) + '  →  ' + q(f) + ' passt' + (hit ? '? Ja!' : '? Nein') });
          if (hit) { s.push({ id: b, print: out }); return s; }
        }
        s.push({ id: 'k4', check: 'case _  →  passt immer' });
        s.push({ id: 'b4', print: 'Diese Farbe gibt es nicht.' });
        return s;
      }
    },

    /* ---------- 2.4 match mit | : Wochentag ---------- */
    wochentag: {
      minWidth: 360,
      code:
`tag = input("Welcher Tag ist heute? ")

match tag:
    case "Samstag" | "Sonntag":
        print("Wochenende – ausschlafen!")
    case "Montag" | "Dienstag" | "Mittwoch" | "Donnerstag" | "Freitag":
        print("Schultag – Wecker stellen!")
    case _:
        print("Diesen Tag kenne ich nicht.")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: tag', lines: [1], info: '<b>Eingabe:</b> Der Wochentag wird als Text eingelesen.' },
        { t: 'case', id: 'm', expr: 'tag', lines: [3],
          info: '<b>match:</b> Der Wert von <code>tag</code> wird mit den Fällen verglichen.',
          cases: [
            { id: 'k1', label: '"Samstag" | "Sonntag"', lines: [4],
              info: '<b>Mehrere Werte mit <code>|</code>:</b> Der Fall passt, wenn <code>tag</code> „Samstag“ <b>oder</b> „Sonntag“ ist. So spart man sich einen zweiten case mit derselben Ausgabe.',
              body: [{ t: 'stmt', id: 'b1', text: 'Ausgabe: "Wochenende – ausschlafen!"', lines: [5], info: 'Wird am Wochenende ausgeführt.' }] },
            { id: 'k2', label: '"Montag" | … | "Freitag"', lines: [6],
              info: '<b>Fünf Werte in einem Fall:</b> Montag bis Freitag werden mit <code>|</code> verknüpft. Passt einer davon, greift dieser Fall.',
              body: [{ t: 'stmt', id: 'b2', text: 'Ausgabe: "Schultag – Wecker stellen!"', lines: [7], info: 'Wird an Schultagen ausgeführt.' }] },
            { id: 'k3', label: 'sonst ( _ )', lines: [8],
              info: '<b>case _:</b> Fängt alle Eingaben ab, die kein Wochentag sind – z. B. Tippfehler oder „samstag“ in Kleinbuchstaben.',
              body: [{ t: 'stmt', id: 'b3', text: 'Ausgabe: "Diesen Tag kenne ich nicht."', lines: [9], info: 'Wird ausgeführt, wenn kein Fall passt.' }] }
          ] }
      ],
      inputs: [{ name: 'tag', type: 'text', value: 'Samstag', options: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] }],
      run(v) {
        const t = v.tag;
        const we = ['Samstag', 'Sonntag'];
        const wt = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
        const s = [
          { id: 'in', ask: ['Welcher Tag ist heute? ', t] },
          { id: 'm', check: 'match tag  →  tag ist ' + q(t) }
        ];
        const h1 = we.includes(t);
        s.push({ id: 'k1', check: 'case "Samstag" | "Sonntag"  →  ist ' + q(t) + ' dabei? ' + (h1 ? 'Ja!' : 'Nein') });
        if (h1) { s.push({ id: 'b1', print: 'Wochenende – ausschlafen!' }); return s; }
        const h2 = wt.includes(t);
        s.push({ id: 'k2', check: 'case "Montag" | … | "Freitag"  →  ist ' + q(t) + ' dabei? ' + (h2 ? 'Ja!' : 'Nein') });
        if (h2) { s.push({ id: 'b2', print: 'Schultag – Wecker stellen!' }); return s; }
        s.push({ id: 'k3', check: 'case _  →  passt immer' });
        s.push({ id: 'b3', print: 'Diesen Tag kenne ich nicht.' });
        return s;
      }
    },

    /* ---------- 2.5 elif ---------- */
    elif: {
      minWidth: 540,
      code:
`temperatur = int(input("Wie warm ist es (°C)? "))

if temperatur < 0:
    print("Es friert! Vorsicht, Glatteis.")
elif temperatur < 15:
    print("Es ist kühl. Jacke anziehen!")
elif temperatur < 25:
    print("Angenehmes Wetter.")
else:
    print("Es ist heiß! Viel trinken.")`,
      diagram: [
        { t: 'stmt', id: 'in', text: 'Eingabe: temperatur', lines: [1], info: '<b>Eingabe:</b> Die Temperatur wird als ganze Zahl eingelesen.' },
        { t: 'if', id: 'c1', cond: 'temperatur < 0', lines: [3], split: 38,
          info: '<b>if:</b> Die erste Bedingung wird immer geprüft.',
          yes: [{ t: 'stmt', id: 'y1', text: 'Ausgabe: "Es friert! …"', lines: [4], info: 'Wird ausgeführt, wenn es unter 0 °C ist.' }],
          no: [
            { t: 'if', id: 'c2', cond: 'temperatur < 15', lines: [5], split: 38,
              info: '<b>elif = „else if“:</b> Diese Bedingung wird nur geprüft, wenn die vorherige <b>falsch</b> war. Deshalb steht sie im Struktogramm im <b>Falsch-Zweig</b> der ersten Verzweigung.',
              yes: [{ t: 'stmt', id: 'y2', text: 'Ausgabe: "Es ist kühl. …"', lines: [6], info: 'Wird ausgeführt bei 0 bis 14 °C.' }],
              no: [
                { t: 'if', id: 'c3', cond: 'temperatur < 25', lines: [7], split: 45,
                  info: '<b>Zweites elif:</b> Wird nur erreicht, wenn <b>beide</b> Bedingungen davor falsch waren. Man muss also nicht mehr prüfen, ob die Temperatur mindestens 15 ist – das ist hier schon klar.',
                  yes: [{ t: 'stmt', id: 'y3', text: 'Ausgabe: "Angenehmes Wetter."', lines: [8], info: 'Wird ausgeführt bei 15 bis 24 °C.' }],
                  no: [{ t: 'stmt', id: 'n3', text: 'Ausgabe: "Es ist heiß! …"', lines: [9, 10], info: '<b>else:</b> Wird ausgeführt, wenn <b>keine</b> der Bedingungen wahr war – also ab 25 °C.' }]
                }
              ]
            }
          ] }
      ],
      inputs: [{ name: 'temperatur', type: 'int', value: '10' }],
      run(v) {
        const t = v.temperatur;
        const s = [{ id: 'in', ask: ['Wie warm ist es (°C)? ', t] }];
        const steps = [
          ['c1', 'y1', 0, 'Es friert! Vorsicht, Glatteis.'],
          ['c2', 'y2', 15, 'Es ist kühl. Jacke anziehen!'],
          ['c3', 'y3', 25, 'Angenehmes Wetter.']
        ];
        for (const [c, y, lim, out] of steps) {
          const ok = t < lim;
          s.push({ id: c, check: 'temperatur < ' + lim + '  →  ' + t + ' < ' + lim + '  →  ' + B(ok) });
          if (ok) { s.push({ id: y, print: out }); return s; }
        }
        s.push({ id: 'n3', print: 'Es ist heiß! Viel trinken.' });
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

  function makeClickable(st, node, item) {
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.dataset.id = item.id;
    st.cells[item.id] = { el: node, lines: item.lines || [], info: item.info || '' };
    node.addEventListener('click', (e) => { e.stopPropagation(); selectCell(st, item.id); });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); selectCell(st, item.id); }
    });
  }

  function renderSeq(st, items, parent) {
    items.forEach((item) => parent.appendChild(renderItem(st, item)));
  }

  function renderItem(st, item) {
    if (item.t === 'stmt') {
      const c = el('div', 'ns-cell ns-stmt');
      c.textContent = item.text;
      makeClickable(st, c, item);
      c.setAttribute('aria-label', item.text);
      return c;
    }
    if (item.t === 'empty') {
      const c = el('div', 'ns-cell ns-empty', '∅');
      makeClickable(st, c, item);
      c.setAttribute('aria-label', 'Leerer Zweig');
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
      makeClickable(st, cond, item);
      const br = el('div', 'ns-branches');
      br.style.gridTemplateColumns = split + '% minmax(0, 1fr)';
      const yes = el('div', 'ns-col'), no = el('div', 'ns-col');
      renderSeq(st, item.yes, yes);
      renderSeq(st, item.no, no);
      br.append(yes, no);
      wrap.append(cond, br);
      return wrap;
    }
    if (item.t === 'case') {
      const n = item.cases.length;
      const S = ((n - 1) / n) * 100;
      const wrap = el('div', 'ns-case');
      const head = el('div', 'ns-cell ns-case-head', svgLines('0,0 ' + S.toFixed(2) + ',100 100,0'));
      const expr = el('span', 'case-expr');
      expr.textContent = item.expr;
      expr.style.left = (S * 0.62).toFixed(1) + '%';
      head.appendChild(expr);
      const labels = el('div', 'case-labels');
      labels.style.gridTemplateColumns = 'repeat(' + n + ', minmax(0, 1fr))';
      head.setAttribute('aria-label', 'Fallunterscheidung: match ' + item.expr);
      makeClickable(st, head, item);

      const cols = el('div', 'ns-case-cols');
      cols.style.gridTemplateColumns = 'repeat(' + n + ', minmax(0, 1fr))';
      item.cases.forEach((cs) => {
        const lab = el('span', 'case-label');
        lab.textContent = cs.label;
        lab.setAttribute('aria-label', 'Fall ' + cs.label);
        makeClickable(st, lab, cs);
        labels.appendChild(lab);
        const col = el('div', 'ns-col');
        renderSeq(st, cs.body, col);
        cols.appendChild(col);
      });
      head.appendChild(labels);
      wrap.append(head, cols);
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
    const st = { key, ex, host, cells: {}, lines: [], timer: null };

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
    ex.code.split('\n').forEach((line, i) => {
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
      let field;
      if (inp.type === 'select') {
        field = el('select');
        inp.options.forEach((o) => {
          const opt = el('option');
          opt.value = o; opt.textContent = o;
          field.appendChild(opt);
        });
        field.value = inp.value;
      } else {
        field = el('input');
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
        if (inp.options) {
          const dl = el('datalist');
          dl.id = id + '-list';
          inp.options.forEach((o) => { const opt = el('option'); opt.value = o; dl.appendChild(opt); });
          f.appendChild(dl);
          field.setAttribute('list', dl.id);
        }
      }
      field.id = id;
      st.fields[inp.name] = { el: field, type: inp.type };
      f.prepend(lab);
      f.appendChild(field);
      form.appendChild(f);
    });
    const btns = el('div', 'run-buttons');
    const runBtn = el('button', 'btn primary', '▶ Ausführen');
    runBtn.type = 'submit';
    const resetBtn = el('button', 'btn', 'Zurücksetzen');
    resetBtn.type = 'button';
    btns.append(runBtn, resetBtn);
    form.appendChild(btns);
    st.runBtn = runBtn;
    form.addEventListener('submit', (e) => { e.preventDefault(); runProgram(st); });
    resetBtn.addEventListener('click', () => resetExample(st));
    pRun.appendChild(form);
    st.console = el('div', 'console');
    st.console.setAttribute('aria-live', 'polite');
    st.console.setAttribute('aria-label', 'Programmausgabe');
    pRun.appendChild(st.console);
    consolePlaceholder(st);

    grid.append(pDia, pCode, pRun);
    host.appendChild(grid);
  }

  /* ---------- Markieren ---------- */
  function clearClass(st, cls) {
    st.host.querySelectorAll('.' + cls).forEach((e) => e.classList.remove(cls));
  }

  function markCell(st, c, cls) {
    c.el.classList.add(cls);
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
    if (!hits.length) {
      st.info.innerHTML = '<p><b>Zeile ' + n + ':</b> Eine Leerzeile. Sie hat keine Wirkung, macht den Code aber übersichtlicher.</p>';
      st.info.classList.add('is-sel');
      return;
    }
    hits.forEach((c) => markCell(st, c, 'is-sel'));
    showInfo(st, hits[0].info, hits[0].lines);
    reveal(hits[0].el);
  }

  /* ---------- Konsole ---------- */
  function consolePlaceholder(st) {
    st.console.innerHTML = '<span class="c-line c-muted">Gib einen Wert ein und drücke „Ausführen“. Hier erscheint dann die Ausgabe des Programms.</span>';
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

  /* ---------- Programm ausführen ---------- */
  function stopRun(st) {
    if (st.timer) clearTimeout(st.timer);
    st.timer = null;
    st.runBtn.disabled = false;
  }

  function resetExample(st) {
    stopRun(st);
    ['is-sel', 'is-run', 'is-now'].forEach((c) => clearClass(st, c));
    st.info.innerHTML = DEFAULT_INFO;
    st.info.classList.remove('is-sel');
    consolePlaceholder(st);
  }

  function readInputs(st) {
    const v = {};
    for (const [name, f] of Object.entries(st.fields)) {
      const raw = f.el.value;
      if (f.type === 'int') {
        if (!/^\s*-?\d+\s*$/.test(raw)) {
          return { error: 'ValueError: invalid literal for int(): ' + q(raw), hint: 'int() kann „' + raw + '“ nicht in eine ganze Zahl umwandeln. Bitte gib bei „' + name + '“ eine ganze Zahl ein, z. B. 12.' };
        }
        v[name] = parseInt(raw, 10);
      } else {
        v[name] = raw;
      }
    }
    return { values: v };
  }

  function runProgram(st) {
    stopRun(st);
    ['is-sel', 'is-run', 'is-now'].forEach((c) => clearClass(st, c));
    st.info.classList.remove('is-sel');
    st.info.innerHTML = '<p>Das Programm läuft … Der <b>grüne Weg</b> zeigt, welche Felder und Zeilen ausgeführt werden. Graue Kommentare in der Konsole zeigen, wie die Bedingungen ausgewertet werden.</p>';
    st.console.innerHTML = '';

    const r = readInputs(st);
    if (r.error) {
      cLine(st, [['c-err', r.error]]);
      cLine(st, [['c-muted', '# ' + r.hint]]);
      return;
    }

    const steps = st.ex.run(r.values);
    st.runBtn.disabled = true;
    let i = 0;
    const tick = () => {
      clearClass(st, 'is-now');
      if (i >= steps.length) {
        cLine(st, [['c-muted', '>>> Programm beendet']]);
        st.runBtn.disabled = false;
        st.timer = null;
        return;
      }
      const step = steps[i++];
      const c = st.cells[step.id];
      markCell(st, c, 'is-run');
      markCell(st, c, 'is-now');
      if (step.ask) cLine(st, [[null, step.ask[0]], ['c-user', String(step.ask[1])]]);
      if (step.check) cLine(st, [['c-eval', '# ' + step.check]]);
      if (step.print != null) cLine(st, [[null, step.print]]);
      st.timer = setTimeout(tick, STEP_DELAY);
    };
    tick();
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
     Bedingungs-Tester und Logik
     ========================================================== */
  function setBool(out, val) {
    out.textContent = B(val);
    out.classList.toggle('is-true', val);
    out.classList.toggle('is-false', !val);
  }

  function initTester() {
    const a = document.getElementById('t-a');
    const b = document.getElementById('t-b');
    const op = document.getElementById('t-op');
    const out = document.getElementById('t-out');
    if (!a) return;
    const update = () => {
      const x = parseFloat(a.value), y = parseFloat(b.value);
      if (isNaN(x) || isNaN(y)) { out.textContent = '?'; out.classList.remove('is-true', 'is-false'); return; }
      const r = { '==': x === y, '!=': x !== y, '>': x > y, '<': x < y, '>=': x >= y, '<=': x <= y }[op.value];
      setBool(out, r);
    };
    [a, b, op].forEach((e) => e.addEventListener('input', update));
    update();
  }

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
    };
    box.querySelectorAll('.bool-btn').forEach((btn) => {
      btn.addEventListener('click', () => { vals[btn.dataset.var] = !vals[btn.dataset.var]; update(); });
    });
    update();
  }

  /* ==========================================================
     Quiz
     ========================================================== */
  const QUIZ = [
    { q: 'Was gibt dieses Programm aus?',
      code: 'x = 7\nif x > 10:\n    print("groß")\nelse:\n    print("klein")',
      opts: ['groß', 'klein', 'groß und klein', 'Nichts'], a: 1,
      ex: '<code>7 > 10</code> ist <code>False</code>. Deshalb wird der <code>else</code>-Zweig ausgeführt.' },
    { q: 'Mit welchem Operator prüfst du, ob zwei Werte gleich sind?',
      opts: ['=', '==', '!=', '=>'], a: 1,
      ex: '<code>=</code> speichert einen Wert, <code>==</code> vergleicht. <code>!=</code> bedeutet „ungleich“.' },
    { q: 'Was gibt dieses Programm aus?',
      code: 'temperatur = 10\nif temperatur < 0:\n    print("Frost")\nelif temperatur < 15:\n    print("kühl")\nelif temperatur < 25:\n    print("angenehm")\nelse:\n    print("heiß")',
      opts: ['kühl', 'kühl und angenehm', 'angenehm', 'heiß'], a: 0,
      ex: '<code>10 < 15</code> ist wahr → „kühl“. Danach werden alle weiteren <code>elif</code>/<code>else</code>-Zweige übersprungen – obwohl <code>10 < 25</code> auch wahr wäre.' },
    { q: 'Die Variable farbe enthält "Rot" (mit großem R). Welche Ausgabe erscheint?',
      code: 'match farbe:\n    case "rot":\n        print("Stehen bleiben!")\n    case _:\n        print("Diese Farbe gibt es nicht.")',
      opts: ['Stehen bleiben!', 'Diese Farbe gibt es nicht.', 'Beide Ausgaben', 'Eine Fehlermeldung'], a: 1,
      ex: 'Python unterscheidet Groß- und Kleinschreibung: <code>"Rot"</code> ist nicht gleich <code>"rot"</code>. Deshalb greift <code>case _</code>.' },
    { q: 'Was fehlt in dieser Zeile?',
      code: 'if alter >= 18',
      opts: ['Ein Semikolon ;', 'Ein Doppelpunkt :', 'Klammern ( )', 'Nichts'], a: 1,
      ex: 'Jede Zeile mit <code>if</code>, <code>elif</code>, <code>else</code>, <code>match</code> oder <code>case</code> endet mit einem Doppelpunkt.' },
    { q: 'stunde ist 20. Ist diese Bedingung wahr?',
      code: 'stunde >= 8 and stunde < 18',
      opts: ['Ja, True', 'Nein, False'], a: 1,
      ex: '<code>20 >= 8</code> ist <code>True</code>, aber <code>20 < 18</code> ist <code>False</code>. Bei <code>and</code> müssen <b>beide</b> Teile wahr sein – also ist das Ergebnis <code>False</code>.' }
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
    document.querySelectorAll('pre.py').forEach((pre) => {
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

  /* ---------- Start ---------- */
  function init() {
    initTheme();
    highlightStatic();
    document.querySelectorAll('.example[data-example]').forEach(buildExample);
    initTester();
    initLogic();
    initQuiz();
    initNav();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
