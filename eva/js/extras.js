/* ==========================================================
   Lernseite – Ergänzungen (auf allen Seiten gleich)
   - „Nice to know“-Kästen: Klick auf die Glühbirne oder die
     Überschrift blendet den Text ein und aus.
   - Auswahlfelder werden so breit wie ihr längster Eintrag.
   - Statische Codeblöcke bekommen einen hängenden Einzug,
     damit umbrochene Zeilen gut lesbar bleiben.

   Ein Kasten wird im HTML so geschrieben:
     <aside class="ntk" data-title="Überschrift">
       <p>Text …</p>
     </aside>
   ========================================================== */
(function () {
  'use strict';

  const BULB = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>';
  let counter = 0;

  /* ---------- Nice to know ---------- */
  function initNtk() {
    document.querySelectorAll('aside.ntk:not([data-ready])').forEach((box) => {
      box.dataset.ready = '1';
      const id = 'ntk-' + (++counter);
      const body = document.createElement('div');
      body.className = 'ntk-body';
      body.id = id;
      while (box.firstChild) body.appendChild(box.firstChild);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ntk-toggle';
      btn.setAttribute('aria-controls', id);
      btn.innerHTML = '<span class="ntk-icon">' + BULB + '</span>' +
        '<span class="ntk-head"><span class="ntk-label">Nice to know</span><span class="ntk-title"></span></span>' +
        '<span class="ntk-more" aria-hidden="true"></span>';
      btn.querySelector('.ntk-title').textContent = box.dataset.title || '';

      const set = (open) => {
        btn.setAttribute('aria-expanded', String(open));
        body.hidden = !open;
        box.classList.toggle('is-open', open);
        btn.querySelector('.ntk-more').textContent = open ? 'ausblenden' : 'einblenden';
      };
      btn.addEventListener('click', () => set(body.hidden));
      box.append(btn, body);
      set(false);
    });
  }

  /* ---------- Auswahlfelder breit genug ---------- */
  const canvas = document.createElement('canvas').getContext('2d');
  function fitSelect(sel) {
    const cs = getComputedStyle(sel);
    canvas.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    let max = 0;
    Array.from(sel.options).forEach((o) => { max = Math.max(max, canvas.measureText(o.text).width); });
    const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) + (parseFloat(cs.borderLeftWidth) || 0) * 2;
    sel.style.minWidth = Math.ceil(max + pad + 30) + 'px'; // + Platz für den Pfeil
    sel.classList.add('is-fitted');
  }
  function fitAll() { document.querySelectorAll('select').forEach(fitSelect); }

  /* ---------- Hängender Einzug in Codeblöcken ---------- */
  function wrapCodeLines() {
    document.querySelectorAll('pre.py:not([data-lines])').forEach((pre) => {
      pre.dataset.lines = '1';
      pre.innerHTML = pre.innerHTML.split('\n').map((l) => '<span class="pl">' + (l || ' ') + '</span>').join('');
    });
  }

  /* ---------- Breite Tabellen als Karten ---------- */
  function initTables() {
    document.querySelectorAll('table.ops').forEach((t) => {
      // In Code-Zellen nach Punkt, Klammer und Komma umbrechen dürfen statt mitten im Wort
      t.querySelectorAll('td code').forEach((c) => {
        if (!c.children.length) c.innerHTML = c.innerHTML.replace(/([.(,=])/g, '$1<wbr>');
      });
      const heads = Array.from(t.querySelectorAll('thead th')).map((th) => th.textContent.trim());
      t.querySelectorAll('tbody tr').forEach((tr) => {
        Array.from(tr.children).forEach((td, i) => { if (td.tagName === 'TD' && !td.hasAttribute('data-label')) td.setAttribute('data-label', heads[i] || ''); });
      });
      const check = () => {
        const box = t.parentElement;
        if (!box || !box.clientWidth) return;
        t.classList.remove('is-stacked');
        if (t.scrollWidth > box.clientWidth + 1) t.classList.add('is-stacked');
      };
      if ('ResizeObserver' in window) new ResizeObserver(check).observe(t.parentElement);
      check();
    });
  }

  function init() {
    initNtk();
    initTables();
    wrapCodeLines();
    fitAll();
    // Auswahlfelder, deren Einträge sich später ändern (z. B. CSV-Labor), neu anpassen
    const mo = new MutationObserver((list) => {
      list.forEach((m) => {
        const s = m.target.closest ? m.target.closest('select') : null;
        if (s) fitSelect(s);
      });
    });
    document.querySelectorAll('select').forEach((s) => mo.observe(s, { childList: true }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
  else setTimeout(init, 0);
})();
