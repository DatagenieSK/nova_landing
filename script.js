(() => {
  const root = document.documentElement;
  root.classList.add('js');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  // Page content waits for the preloader to lift before it animates in
  const readyCbs = []; let isReady = false;
  const onReady = fn => (isReady ? fn() : readyCbs.push(fn));
  const setReady = () => { if (isReady) return; isReady = true; readyCbs.splice(0).forEach(fn => fn()); };
  setTimeout(setReady, 7000); // absolute failsafe so content can never stay hidden

  // Run a callback while an element is on screen (used to pause demos that nobody can see)
  function whenVisible(el, onChange, threshold = 0.2) {
    if (!el) return;
    new IntersectionObserver(([e]) => onChange(e.isIntersecting), { threshold }).observe(el);
  }

  /* ------------------------------------------------ */
  /* 1. Nav: shadow, scroll progress, scrollspy        */
  /* ------------------------------------------------ */
  const nav = $('#nav'), progress = $('#progress');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
      nav.classList.toggle('scrolled', window.scrollY > 12);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const spyLinks = $$('.nav-links a[href^="#"]');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      spyLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['how-it-works', 'features', 'live-board', 'technology', 'gallery', 'faq'].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ------------------------------------------------ */
  /* 2. Mobile menu                                    */
  /* ------------------------------------------------ */
  const menuBtn = $('#menuBtn'), menu = $('#mobileMenu');
  function setMenu(open) {
    menuBtn.classList.toggle('active', open);
    menu.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('active')));
  $$('.mobile-link').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('active')) { setMenu(false); menuBtn.focus(); } });
  window.matchMedia('(min-width: 992px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ------------------------------------------------ */
  /* 3. Scroll reveal + journey + count-ups            */
  /* ------------------------------------------------ */
  const countUp = el => {
    const target = Number(el.dataset.count) || 0;
    if (reduce) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const revealIO = new IntersectionObserver((entries, io) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('active');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  onReady(() => $$('.reveal').forEach(el => revealIO.observe(el)));

  const journey = $('#journey');
  if (journey) {
    const jio = new IntersectionObserver(([e], io) => { if (e.isIntersecting) { journey.classList.add('active'); io.disconnect(); } }, { threshold: 0.35 });
    jio.observe(journey);
  }

  /* ------------------------------------------------ */
  /* 4. Typewriter                                     */
  /* ------------------------------------------------ */
  const tw = $('#typewriter');
  const words = ['Activity Tracking.', 'VIP Logistics.', 'Travel & Hotel Desk.', 'Secure QR Entry.', 'Live MIS Analytics.'];
  if (tw) {
    if (reduce) {
      tw.textContent = words[0];
    } else {
      let w = 0, c = 0, del = false;
      const type = () => {
        const word = words[w];
        c += del ? -1 : 1;
        tw.textContent = word.substring(0, c);
        let speed = del ? 45 : 90;
        if (!del && c === word.length) { speed = 1800; del = true; }
        else if (del && c === 0) { del = false; w = (w + 1) % words.length; speed = 400; }
        setTimeout(type, speed);
      };
      onReady(() => setTimeout(type, 300));
    }
  }

  /* ------------------------------------------------ */
  /* 5. Decorative QR codes (no third-party requests)  */
  /* ------------------------------------------------ */
  function makeQR(seed, n) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    const rnd = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    const finder = (x, y) => {
      for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
        const edge = i === 0 || j === 0 || i === 6 || j === 6, core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        m[y + i][x + j] = edge || core ? 1 : 0;
      }
    };
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const inFinder = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
      if (!inFinder) m[y][x] = rnd() < 0.5 ? 1 : 0;
    }
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) d += 'M' + x + ' ' + y + 'h1v1h-1z';
    return '<svg viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" aria-hidden="true"><path d="' + d + '" fill="currentColor"/></svg>';
  }
  $$('[data-qr]').forEach(el => { el.innerHTML = makeQR(el.dataset.seed || 'nova', Number(el.dataset.n) || 25); });

  /* ------------------------------------------------ */
  /* 6. Hero: one badge, scanned at every checkpoint   */
  /* ------------------------------------------------ */
  const scene = $('#scene'), badge = $('#heroBadge'), qrBox = $('#heroQr'), resultEl = $('#scanResult');
  const ICONS = {
    ok:  '<svg class="ic" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    bad: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    vip: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z"/></svg>'
  };
  const SCANS = [
    { t: 'ok',  label: 'Gate',       text: 'Entry granted' },
    { t: 'ok',  label: 'Lunch',      text: '1 of 1 used' },
    { t: 'bad', label: 'Lunch',      text: 'Limit reached' },
    { t: 'vip', label: 'VIP',        text: 'Now on the live board' },
    { t: 'ok',  label: 'Workshop B', text: 'Entry granted' }
  ];

  function showResult(s) {
    resultEl.innerHTML = '';
    const chip = document.createElement('div');
    chip.className = 'chip-res ' + s.t;
    chip.innerHTML = '<span class="ci">' + ICONS[s.t] + '</span><span class="cl"></span><span class="ct"></span>';
    chip.querySelector('.cl').textContent = s.label + ' \u00b7';
    chip.querySelector('.ct').textContent = s.text;
    resultEl.appendChild(chip);
  }

  if (scene) {
    if (reduce) {
      showResult(SCANS[0]);
    } else {
      let i = 0, sceneVisible = true, timer = null;
      const cycle = () => {
        if (sceneVisible && !document.hidden) {
          resultEl.innerHTML = '';
          scene.classList.remove('scanning');
          void scene.offsetWidth;
          scene.classList.add('scanning');
          setTimeout(() => {
            const s = SCANS[i++ % SCANS.length];
            showResult(s);
            if (s.t !== 'bad') { qrBox.classList.remove('flash'); void qrBox.offsetWidth; qrBox.classList.add('flash'); }
          }, 1450);
        }
        timer = setTimeout(cycle, 4200);
      };
      whenVisible(scene, v => { sceneVisible = v; }, 0.15);
      onReady(() => { timer = setTimeout(cycle, 600); });
    }

    // gentle 3D tilt that follows the pointer
    if (finePointer && !reduce) {
      scene.addEventListener('pointermove', e => {
        const r = scene.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        badge.style.setProperty('--ry', (px * 14).toFixed(2) + 'deg');
        badge.style.setProperty('--rx', (py * -12).toFixed(2) + 'deg');
      });
      scene.addEventListener('pointerleave', () => { badge.style.setProperty('--rx', '0deg'); badge.style.setProperty('--ry', '0deg'); });
    }
  }

  /* ------------------------------------------------ */
  /* 7. Live board preview (sample data)               */
  /* ------------------------------------------------ */
  const mock = $('#boardMock');
  if (mock) {
    const dial = $('#mockDial');
    const ticks = [];
    for (let i = 0; i < 100; i++) {
      const t = document.createElementNS(NS, 'line');
      const th = i === 64 || i === 84;
      t.setAttribute('x1', 100); t.setAttribute('x2', 100);
      t.setAttribute('y1', 4);   t.setAttribute('y2', th ? 22 : 15);
      t.setAttribute('transform', 'rotate(' + (i * 3.6) + ' 100 100)');
      t.setAttribute('class', 'mtick z' + (i >= 84 ? 2 : i >= 64 ? 1 : 0));
      dial.appendChild(t); ticks.push(t);
    }

    const el = id => document.getElementById(id);
    const tween = (node, to, suffix = '') => {
      const from = Number(node.dataset.v || 0);
      node.dataset.v = to;
      if (reduce || from === to) { node.textContent = to + suffix; return; }
      const t0 = performance.now(), dur = 900;
      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        node.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    let prev = 0;
    const setPct = n => {
      ticks.forEach((t, i) => {
        const on = i < n;
        if (on !== t.classList.contains('on')) {
          t.style.transitionDelay = reduce ? '0ms' : Math.abs(i - prev) * 10 + 'ms';
          t.classList.toggle('on', on);
        }
      });
      prev = n;
    };

    const guests = [['Sarah Jenkins', 'Keynote Speaker'], ['Arjun Mehta', 'Chief Guest'], ['Priya Nair', 'Panelist']];
    const state = { inside: 62, reg: 214, vip: 2, g: 0 };
    const paint = () => {
      setPct(state.inside);
      tween(el('mockPct'), state.inside, '%');
      tween(el('mockIn'), state.inside);
      tween(el('mockIn2'), state.inside);
      tween(el('mockReg'), state.reg);
      tween(el('mockVip'), state.vip);
    };

    let started = false, running = false, timer = null;
    const tick = () => {
      if (!running) return;
      state.inside = Math.max(48, Math.min(79, state.inside + (Math.random() < 0.75 ? 1 + Math.floor(Math.random() * 3) : -2)));
      state.reg += Math.random() < 0.6 ? 1 : 0;
      if (Math.random() < 0.3) {
        state.g = (state.g + 1) % guests.length;
        state.vip = 2 + (state.g % 2);
        const spot = $('.mock-spot', mock);
        el('mockName').textContent = guests[state.g][0];
        el('mockRole').textContent = guests[state.g][1];
        el('mockAv').textContent = guests[state.g][0].charAt(0);
        spot.classList.remove('swap'); void spot.offsetWidth; spot.classList.add('swap');
      }
      paint();
      timer = setTimeout(tick, 2600);
    };

    whenVisible(mock, v => {
      if (v && !started) { started = true; paint(); }
      if (reduce) return;
      if (v && !running) { running = true; timer = setTimeout(tick, 2600); }
      if (!v) { running = false; clearTimeout(timer); }
    }, 0.3);
  }

  /* ------------------------------------------------ */
  /* 8. Scan log (sample data)                         */
  /* ------------------------------------------------ */
  const log = $('#scanLog');
  if (log) {
    const timeFmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const EVENTS = [
      ['ENTRY', 'Sarah Jenkins (VIP)', true, 'granted'],
      ['ENTRY', 'Arjun Mehta', true, 'granted'],
      ['LUNCH', 'Priya Nair', true, '1 of 1'],
      ['LUNCH', 'Priya Nair', false, 'limit reached'],
      ['WORKSHOP B', 'Rohan Das', true, 'granted'],
      ['ENTRY', 'Meera Iyer', true, 'granted'],
      ['EXIT', 'Arjun Mehta', true, 'logged'],
      ['DINNER', 'Sarah Jenkins (VIP)', true, '1 of 1']
    ];
    let n = 0;
    const addLine = () => {
      const [k, who, ok, res] = EVENTS[n++ % EVENTS.length];
      const row = document.createElement('div');
      row.className = 't-line';
      row.innerHTML = '<time></time><span class="k"></span><span class="who"></span><span class="res"></span>';
      $('time', row).textContent = timeFmt.format(new Date());
      $('.k', row).textContent = k;
      $('.who', row).textContent = who;
      const r = $('.res', row);
      r.textContent = (ok ? '\u2713 ' : '\u2715 ') + res;
      r.classList.add(ok ? 'ok' : 'no');
      log.appendChild(row);
      while (log.children.length > 9) log.firstElementChild.remove();
    };
    for (let i = 0; i < 6; i++) addLine();
    if (!reduce) {
      let vis = false;
      whenVisible(log, v => { vis = v; }, 0.2);
      setInterval(() => { if (vis && !document.hidden) addLine(); }, 1900);
    }
  }

  /* ------------------------------------------------ */
  /* 9. Gallery lightbox                               */
  /* ------------------------------------------------ */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  if (lb) {
    $$('.g-btn').forEach(btn => btn.addEventListener('click', () => {
      const img = $('img', btn), cap = btn.parentElement.querySelector('figcaption');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = cap ? cap.textContent : '';
      if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    }));
    $('#lbClose').addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  }
  /* ------------------------------------------------ */
  /* 10. Preloader                                     */
  /* ------------------------------------------------ */
  const loader = $('#loader');
  if (!loader || root.classList.contains('no-loader')) {
    if (loader) loader.remove();
    setReady();
  } else {
    const MIN = reduce ? 400 : 1600;     // shortest time the loader stays up
    const MAX = 5000;                    // never wait longer than this
    const t0 = performance.now();
    const status = $('#loaderStatus');
    let loaded = document.readyState === 'complete', finished = false, raf = 0;

    const tickBar = () => {
      if (finished) return;
      const p = Math.min(0.9, ((performance.now() - t0) / MIN) * 0.9);
      loader.style.setProperty('--p', p.toFixed(3));
      raf = requestAnimationFrame(tickBar);
    };
    tickBar();

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      loader.style.setProperty('--p', 1);
      status.textContent = 'SYSTEMS ONLINE';
      loader.classList.add('done');
      setTimeout(() => {
        loader.classList.add('leave');
        loader.setAttribute('aria-hidden', 'true');
        setReady();
        try { sessionStorage.setItem('novaLoaded', '1'); } catch (e) {}
        setTimeout(() => loader.remove(), reduce ? 0 : 950);
      }, reduce ? 0 : 650);
    };
    const tryFinish = () => { if (loaded && performance.now() - t0 >= MIN) finish(); };

    window.addEventListener('load', () => { loaded = true; tryFinish(); });
    setTimeout(tryFinish, MIN);
    setTimeout(finish, MAX);
  }
})();