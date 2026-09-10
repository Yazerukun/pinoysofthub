
/* PinoySoftHub — client features.
   Module pattern; guarded so components only run when present. */
(function () {
  "use strict";

  /* ---------- Utilities ---------- */
  var toastWrap = document.querySelector('.toast-wrap');
  if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toast-wrap'; document.body.appendChild(toastWrap); }
  function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2600);
    setTimeout(function () { t.remove(); }, 3000);
  }

  /* ---------- Theme ---------- */
  var themeBtn = document.getElementById('themeToggle');
  function applyTheme(t) {
    /* Dark navy is the brand default (:root); light is an override attr. */
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    if (themeBtn) {
      themeBtn.textContent = (t === 'light') ? '☀' : '☾';
      themeBtn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    }
  }
  function initTheme() {
    /* Dark navy is the brand default; light is an explicit opt-in. */
    var saved = null;
    try { saved = localStorage.getItem('psh_theme'); } catch (e) {}
    if (saved !== 'light' && saved !== 'dark') saved = 'dark';
    applyTheme(saved);
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', 'Toggle color theme');
      themeBtn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        var next = cur === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('psh_theme', next); } catch (e) {}
      });
    }
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var btn = document.querySelector('.hamburger');
    var menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Header solidity on scroll ---------- */
  function initNavScroll() {
    var nav = document.getElementById('siteNav');
    if (!nav) return;
    var ticking = false;
    function update() {
      nav.classList.toggle('scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Mobile search button: opens menu + focuses search ---------- */
  function initNavSearchBtn() {
    var btn = document.getElementById('navSearchBtn');
    var menu = document.getElementById('mobileMenu');
    var hamburger = document.querySelector('.hamburger');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      if (menu.classList.contains('open')) {
        var inp = menu.querySelector('input[type=search]');
        if (inp) inp.focus();
      } else if (hamburger) {
        hamburger.click();
        setTimeout(function () {
          var inp = menu.querySelector('input[type=search]');
          if (inp) inp.focus();
        }, 60);
      }
    });
  }

  /* ---------- Hero Search button (and Enter-to-search) ---------- */
  function initHeroSearchBtn() {
    var btn = document.getElementById('heroSearchBtn');
    var input = document.querySelector('#heroSearch input[type=search]');
    if (!btn || !input) return;
    function go() {
      var q = input.value.trim();
      var url = BASE + 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      window.location.href = url;
    }
    btn.addEventListener('click', go);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); go(); }
    });
  }

  /* ---------- Slideshow ---------- */
  function initSlideshow() {
    var ss = document.getElementById('latestSlideshow');
    if (!ss) return;
    var slides = ss.querySelectorAll('.slide');
    var dots = ss.querySelectorAll('.dot');
    if (!slides.length) return;
    var cur = 0;
    var timer = null;

    function show(i) {
      cur = (i + slides.length) % slides.length;
      for (var j = 0; j < slides.length; j++) {
        slides[j].classList.toggle('active', j === cur);
        if (dots[j]) dots[j].classList.toggle('on', j === cur);
      }
    }
    function next() { show(cur + 1); restart(); }
    function prev() { show(cur - 1); restart(); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { show(cur + 1); }, 6000);
    }
    var btnNext = ss.querySelector('#slideNext');
    var btnPrev = ss.querySelector('#slidePrev');
    if (btnNext) btnNext.addEventListener('click', next);
    if (btnPrev) btnPrev.addEventListener('click', prev);
    for (var i = 0; i < dots.length; i++) {
      (function (idx) {
        dots[idx].addEventListener('click', function () { show(idx); restart(); });
      })(i);
    }
    restart();
  }

  /* ---------- Listing sort select ---------- */
  function initSort() {
    var sel = document.getElementById('sortSelect');
    var list = document.getElementById('swList');
    if (!sel || !list) return;
    sel.addEventListener('change', function () {
      var mode = sel.value;
      var cards = Array.prototype.slice.call(list.querySelectorAll('.sw-card'));
      cards.sort(function (a, b) {
        if (mode === 'listed') {
          var la = a.getAttribute('data-listed') || '0000';
          var lb = b.getAttribute('data-listed') || '0000';
          if (la === lb) {
            var ta = a.getAttribute('data-title') || '';
            var tb = b.getAttribute('data-title') || '';
            return ta < tb ? -1 : ta > tb ? 1 : 0;
          }
          return la < lb ? 1 : -1;
        }
        var na = a.getAttribute('data-title') || '';
        var nb = b.getAttribute('data-title') || '';
        return na < nb ? -1 : na > nb ? 1 : 0;
      });
      cards.forEach(function (c) { list.appendChild(c); });
    });
  }

  /* ---------- Soft-link (sidebar download panels, etc.) ---------- */
  function initToastLinks() {
    document.querySelectorAll('[data-toast]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var msg = el.getAttribute('data-toast');
        if (msg) { e.preventDefault(); toast(msg, 'success'); }
      });
    });
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    var wrap = document.getElementById('lightbox');
    if (!wrap) return;
    var img = wrap.querySelector('img');
    var close = wrap.querySelector('.lb-close');
    function closeLB() { wrap.classList.remove('active'); document.body.style.overflow = ''; }
    document.querySelectorAll('[data-zoom]').forEach(function (el) {
      el.addEventListener('click', function () {
        img.src = el.src;
        img.alt = el.alt || 'Preview';
        wrap.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
    close.addEventListener('click', closeLB);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) closeLB(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLB(); });
  }

  /* ---------- Client-side search (autocomplete) ---------- */
  var INDEX = null;
  function fetchIndex(cb) {
    if (INDEX) return cb(INDEX);
    /* Prefer the index inlined into the page (works on file:// where XHR is
       CORS-blocked). Fall back to fetching search-index.json when present. */
    if (window.__PSH_INDEX__ && Array.isArray(window.__PSH_INDEX__)) {
      INDEX = window.__PSH_INDEX__;
      return cb(INDEX);
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', BASE + 'data/search-index.json', true);
    xhr.onload = function () {
      if (xhr.status === 200) { try { INDEX = JSON.parse(xhr.responseText); } catch (e) { INDEX = []; } }
      else INDEX = [];
      cb(INDEX);
    };
    xhr.onerror = function () { INDEX = []; cb(INDEX); };
    xhr.send();
  }
  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function score(q, item) {
    /* Simple relevance: title match > category/developer match. */
    var title = norm(item.title), cat = norm(item.category), dev = norm(item.developer || '');
    var nq = norm(q);
    var t = title.indexOf(nq);
    if (t === 0) return 0;             /* prefix exact */
    if (t > -1) return 5;              /* anywhere in title */
    if (dev.indexOf(nq) > -1) return 12;
    if (cat.indexOf(nq) > -1) return 20;
    /* fuzzy: subsequence match on title */
    var k = 0; for (var i = 0; i < title.length && k < nq.length; i++) if (title[i] === nq[k]) k++;
    if (k === nq.length) return 25;
    return -1;
  }
  function initSearch(root) {
    var wrap = document.getElementById(root);
    if (!wrap) return;
    var input = wrap.querySelector('input[type=search], input');
    var results = wrap.querySelector('.search-results');
    if (!input || !results) return;

    input.addEventListener('input', function () {
      var q = input.value.trim();
      wrap.classList.toggle('has-value', !!q);
      if (q.length < 2) { results.innerHTML = ''; return; }
      fetchIndex(function (idx) {
        var hits = idx.map(function (it) { return { it: it, s: score(q, it) }; })
          .filter(function (h) { return h.s >= 0 && h.s < 30; })
          .sort(function (a, b) { return a.s - b.s; })
          .slice(0, 7);
        if (!hits.length) {
          results.innerHTML = '<div class="sr-empty">No matches for &ldquo;' + escapeHtml(q) + '&rdquo;</div>';
          return;
        }
        var html = '<div class="sr-head">Software</div>';
        hits.forEach(function (h) {
          html += '<a href="' + BASE + h.it.path + '" data-nav>'
            + '<div class="sr-title">' + escapeHtml(h.it.title) + '</div>'
            + '<div class="sr-meta"><span>' + escapeHtml(h.it.category) + '</span>'
            + (h.it.developer ? '<span>by ' + escapeHtml(h.it.developer) + '</span>' : '')
            + '</div></a>';
        });
        if (hits.length) {
          html += '<a class="sr-viewall" href="' + BASE + 'search.html?q=' + encodeURIComponent(q) + '" data-nav>View all results for &ldquo;' + escapeHtml(q) + '&rdquo; &rarr;</a>';
        }
        results.innerHTML = html;
      });
    });
    /* hide on outside click */
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) results.innerHTML = '';
    });
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Listing filters (client-side) ---------- */
  function initFilter() {
    var list = document.getElementById('swList');
    if (!list) return;
    var chips = document.querySelectorAll('[data-filter-attr]');
    var state = {};
    function apply() {
      var cards = list.querySelectorAll('.sw-card');
      var count = 0;
      cards.forEach(function (card) {
        var ok = true;
        for (var attr in state) {
          if (!state[attr] || state[attr].length === 0) continue;
          var val = (card.getAttribute('data-' + attr) || '').toLowerCase();
          if (state[attr].indexOf(val) === -1) { ok = false; break; }
        }
        card.style.display = ok ? '' : 'none';
        if (ok) count++;
      });
      var counter = document.getElementById('filterCount');
      if (counter) counter.textContent = count;
      var empty = document.getElementById('filterEmpty');
      if (empty) empty.style.display = count === 0 ? '' : 'none';
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var attr = chip.getAttribute('data-filter-attr');
        var val = chip.getAttribute('data-filter-val').toLowerCase();
        if (!state[attr]) state[attr] = [];
        var i = state[attr].indexOf(val);
        if (i > -1) { state[attr].splice(i, 1); chip.classList.remove('active'); }
        else { state[attr].push(val); chip.classList.add('active'); }
        apply();
      });
    });
    apply();
  }

  /* ---------- PC compatibility checker ---------- */
  var PROFILE_KEY = 'psh_pc_profile';
  function loadProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch (e) { return null; } }
  function saveProfile(p) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) {} }

  function detectOS() {
    var ua = navigator.userAgent || '';
    if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
    if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1';
    if (/Windows NT 6\.1/.test(ua)) return 'Windows 7';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac OS X|MacIntel/.test(ua)) return 'macOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Linux/.test(ua)) return 'Linux';
    if (/iPhone|iPad/.test(ua)) return 'iOS';
    return 'Unknown';
  }
  function detectGPU() {
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return null;
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (!dbg) return null;
      return gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || null;
    } catch (e) { return null; }
  }
  function detectAll() {
    var profile = {
      os: detectOS(),
      cores: navigator.hardwareConcurrency || 'Unknown',
      ram: (navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Unknown'),
      gpu: detectGPU() || 'Unknown',
      screen: screen.width + 'x' + screen.height,
      detected: true
    };
    saveProfile(profile);
    return profile;
  }

  function ramGB(v) {
    var m = String(v).match(/([\d.]+)\s*(gb|mb)/i);
    if (!m) return null;
    var n = parseFloat(m[1]);
    return m[2].toLowerCase() === 'mb' ? n / 1024 : n;
  }

  function compareEntry(req, yours) {
    if (!req) return { status: 'unk', label: 'Not specified' };
    var r = String(req).toLowerCase();
    var y = String(yours || '').toLowerCase();
    /* RAM / storage sizing */
    if (/gb|mb|tb/.test(r) && /gb|mb|tb/.test(y)) {
      var rr = sizeGB(r), yy = sizeGB(y);
      if (rr !== null && yy !== null) {
        if (yy >= rr) return { status: 'pass' };
        if (yy >= rr * 0.6) return { status: 'warn' };
        return { status: 'fail' };
      }
    }
    /* CPU tier comparison — only when the requirement is a CPU line. */
    var isCpuReq = /cpu|processor|intel|amd|ghz|i[3579]|ryzen|athlon|xeon|core /.test(r);
    if (isCpuReq) {
      var cpu = compareCPU(r, y);
      if (cpu) return cpu;
    }
    /* OS comparison */
    if (/windows|win /.test(r) || /win\d/.test(r)) {
      if (!/windows|win |win\d|win/.test(y)) return { status: 'fail' };
      var reqWin = reqWinVer(r), yourWin = reqWinVer(y);
      if (reqWin && yourWin) return { status: yourWin >= reqWin ? 'pass' : 'warn' };
      return { status: 'pass' };
    }
    if (/mac/.test(r)) { return (/mac/.test(y)) ? { status: 'pass' } : { status: 'fail' }; }
    if (/linux/.test(r)) { return (/linux/.test(y)) ? { status: 'pass' } : { status: 'fail' }; }
    /* DirectX */
    if (/directx/.test(r)) {
      var dxr = (r.match(/directx\s*(\d+)/) || [])[1] || '11';
      var dxy = (y.match(/directx\s*(\d+)/) || [])[1];
      if (!dxy) return { status: 'unknown' };
      return { status: parseInt(dxy) >= parseInt(dxr) ? 'pass' : 'warn' };
    }
    /* Generic keyword presence (CPU model reqs like "Intel or AMD 64-bit") */
    var key = r.replace(/[^a-z0-9 ]/g, '').trim().split(/\s+/).filter(function (w) { return w.length > 3; });
    if (key.length) {
      var partial = key.some(function (w) { return y.indexOf(w) > -1; });
      return partial ? { status: 'pass' } : { status: 'unknown' };
    }
    return { status: 'unknown' };
  }

  /* Convert "8 GB" / "10 GB free space" / "1 TB" to a number of GB. */
  function sizeGB(v) {
    var m = String(v).match(/([\d.]+)\s*(gb|mb|tb)/i);
    if (!m) return null;
    var n = parseFloat(m[1]);
    if (m[2].toLowerCase() === 'mb') return n / 1024;
    if (m[2].toLowerCase() === 'tb') return n * 1024;
    return n;
  }

  /* Compare CPU requirement to your CPU. Returns a result object or null. */
  function compareCPU(req, yours) {
    var r = String(req || '').toLowerCase(), y = String(yours || '').toLowerCase();
    /* Intel iN tier */
    var ri = (r.match(/i([3579])/) || [])[1];
    var yi = (y.match(/i([3579])/) || [])[1];
    /* AMD Ryzen NN tier */
    var ryz = (r.match(/ryzen\s*(\d)/) || [])[1];
    var yyz = (y.match(/ryzen\s*(\d)/) || [])[1];
    if (ri && yi) {
      return { status: parseInt(yi) >= parseInt(ri) ? 'pass' : 'warn' };
    }
    if (ryz && yyz) {
      return { status: parseInt(yyz) >= parseInt(ryz) ? 'pass' : 'warn' };
    }
    /* Architecture/capability wording ("64-bit") */
    if (r.indexOf('64-bit') > -1 || r.indexOf('64 bit') > -1) {
      /* A recognizable modern CPU is implicitly 64-bit capable. */
      var modern = /i[3579]|ryzen|core (i|ultra)|xeon|epyc|athlon (x4|ryzen)|m[1234]|m[0-9x]|snapdragon/.test(y);
      if (modern || y.indexOf('64') > -1 || y.indexOf('amd64') > -1) return { status: 'pass' };
      if (!y || y === '?') return { status: 'unknown' };
      return { status: 'warn' };   /* looks 32-bit or ambiguous */
    }
    return null;
  }

  /* Extract a Windows major version number (e.g. 10, 11) from a string. */
  function reqWinVer(s) {
    var m = s.match(/windows[^\d]*(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }

  function initCompat() {
    var panel = document.getElementById('compatPanel');
    if (!panel) return;

    var profile = loadProfile();
    var req = {};
    ['cpu', 'gpu', 'ram', 'storage', 'os'].forEach(function (k) {
      var el = document.querySelector('[data-req-' + k + ']');
      req[k] = el ? el.getAttribute('data-req-' + k) : '';
    });

    var detectBtn = document.getElementById('detectPc');
    var manualFields = document.querySelectorAll('.compat-form [name]');
    var resultBox = document.getElementById('compatResult');

    function readManual() {
      var p = {};
      manualFields.forEach(function (f) { p[f.name] = f.value; });
      return p;
    }
    function bindManual() {
      if (profile) manualFields.forEach(function (f) {
        if (profile[f.name] && !f.value) f.value = profile[f.name];
      });
    }
    function run(p) {
      if (!p) return;
      var rows = [
        { label: 'Operating System', field: 'os', req: req.os },
        { label: 'CPU', field: 'cpu', req: req.cpu },
        { label: 'RAM', field: 'ram', req: req.ram },
        { label: 'Storage', field: 'storage', req: req.storage }
      ];
      var passing = 0, total = 0, failures = 0, warns = 0;
      var html = '';
      rows.forEach(function (row) {
        var rv = row.req;
        total++;
        var res = compareEntry(rv, p[row.field]);
        var statusLabel = { pass: '✓ Compatible', warn: '⚠ Meets minimum', fail: '✕ Not enough', unk: '? Unknown' }[res.status] || '?';
        var cls = { pass: 'pass', warn: 'warn', fail: 'fail', unk: 'unk' }[res.status];
        if (res.status === 'pass') passing++;
        if (res.status === 'warn') warns++;
        if (res.status === 'fail') failures++;
        html += '<div class="cr-row">'
          + '<div class="cr-row-label">' + row.label + '</div>'
          + '<div class="cr-cell">' + esc(rv || 'not listed') + '</div>'
          + '<div class="cr-cell">' + esc(p[row.field] || '?') + '</div>'
          + '<div class="cr-status ' + cls + '">' + statusLabel + '</div></div>';
      });
      /* Overall verdict */
      var verdict, emoji, cls2, msg;
      if (failures > 0) {
        verdict = 'Not Recommended'; emoji = '🔴'; cls2 = 'red';
        msg = 'Your PC does not meet some minimum requirements. This software may not run properly.';
      } else if (warns > 0 || passing < total) {
        verdict = 'Moderate'; emoji = '🟡'; cls2 = 'yellow';
        msg = 'This software should run, but performance may vary on your hardware.';
      } else {
        verdict = 'Excellent'; emoji = '🟢'; cls2 = 'green';
        msg = 'Your PC meets all listed requirements. This should run well.';
      }
      resultBox.innerHTML =
        '<div class="cr-header ' + cls2 + '">'
        + '<div class="emoji">' + emoji + '</div>'
        + '<div><div class="cr-label">' + verdict + '</div>'
        + '<div class="cr-msg">' + msg + '</div>'
        + '<div class="cr-msg" style="margin-top:4px">' + passing + '/' + total + ' requirements met</div>'
        + '</div></div>'
        + '<div class="cr-compare">' + html + '</div>'
        + '<div class="compat-note" role="note">These results are an estimate based on the information you provided and the software&rsquo;s stated requirements. Always check the official page for exact specifications.</div>';
      resultBox.classList.add('show');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    function esc(s) { return escapeHtml(s || ''); }

    if (detectBtn) {
      detectBtn.addEventListener('click', function () {
        detectBtn.disabled = true;
        var spinner = document.getElementById('detectSpinner');
        if (spinner) spinner.style.display = 'inline-block';
        setTimeout(function () {
          var p = detectAll();
          bindManual();
          run(p);
          detectBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
          toast('PC detected. Results shown below.', 'success');
        }, 400);
      });
    }
    var checkBtn = document.getElementById('checkCompat');
    if (checkBtn) {
      checkBtn.addEventListener('click', function () { run(readManual()); });
    }
    bindManual();
  }

  /* ---------- Standalone PC Checker page ---------- */
  function initChecker() {
    var leaveDetect = document.getElementById('detectPc');
    var list = document.getElementById('detectedList');
    if (!leaveDetect || !list) return;

    function render(p) {
      var items = [
        ['OS', p.os], ['CPU cores', p.cores], ['RAM', p.ram],
        ['GPU', p.gpu], ['Screen', p.screen]
      ];
      list.innerHTML = items.map(function (it) {
        return '<div class="detected-item"><label>' + it[0] + '</label><span>' + escapeHtml(it[1]) + '</span></div>';
      }).join('');
    }
    var saved = loadProfile();
    if (saved) { bindSav(); render(saved); }

    function bindSav() {
      ['os', 'cpu', 'ram', 'storage', 'gpu'].forEach(function (k) {
        var el = document.getElementById('pc-' + k);
        if (el && saved && saved[k] && !el.value) el.value = saved[k] || '';
      });
    }
    var spinner = document.getElementById('detectSpinner');
    leaveDetect.addEventListener('click', function () {
      leaveDetect.disabled = true; if (spinner) spinner.style.display = 'inline-block';
      setTimeout(function () {
        var p = detectAll();
        render(p);
        bindSav.call(null);
        leaveDetect.disabled = false; if (spinner) spinner.style.display = 'none';
        toast('PC profile saved locally.', 'success');
      }, 400);
    });
    var clearBtn = document.getElementById('clearProfile');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      try { localStorage.removeItem(PROFILE_KEY); } catch (e) {}
      list.innerHTML = '<p class="compat-note">Profile cleared.</p>';
      toast('Saved PC profile cleared.', 'success');
    });
    document.querySelectorAll('.compat-form [name], #pc-checker [name]').forEach(function (f) {
      f.addEventListener('change', function () {
        var p = loadProfile() || {};
        p[this.name] = this.value; saveProfile(p);
      });
    });
  }

  /* ---------- Full live results page (search.html) ---------- */
  function cardHtml(it, base) {
    var src = it.img ? base + it.img : '';
    if (it.img && /^(https?:)?\/\//.test(it.img)) src = it.img;
    var img = src
      ? '<img loading="lazy" src="' + escapeAttr(src) + '" alt="" onerror="this.parentNode.innerHTML=this.parentNode.getAttribute(\'data-ph\')">'
      : '';
    var ph = '<div class="placeholder">' + (CAT_ICONS[it.category] || '&#128194;') + '</div>';
    var thumb = '<a href="' + base + it.path + '" class="sw-thumb" data-ph="' + escapeAttr(ph) + '" tabindex="-1" aria-hidden="true" style="display:block">'
      + (img || ph) + '</a>';
    var tier = TIER_LABELS[it.tier] || '';
    var meta = '<span>&#9989; Windows</span>';
    if (it.year) meta += '<span>&#169; ' + escapeHtml(it.year) + '</span>';
    if (it.date) meta += '<span>&#128197; ' + escapeHtml(it.date) + '</span>';
    if (it.size) meta += '<span>&#128190; ' + escapeHtml(it.size) + '</span>';
    if (it.version) meta += '<span class="badge-ver">' + escapeHtml(it.version) + '</span>';
    return '<article class="sw-card">' + thumb
      + '<div class="sw-body">'
      + '<h3 class="sw-title" style="margin:0"><a href="' + base + it.path + '">' + escapeHtml(it.title) + '</a></h3>'
      + '<p class="sw-desc">' + escapeHtml(it.desc) + '</p>'
      + '<div class="sw-meta"><span class="badge badge-primary">' + escapeHtml(CAT_LABELS[it.category] || it.category) + '</span>' + tier + '</div>'
      + '<div class="sw-meta">' + meta + '</div>'
      + '<a class="btn btn-primary" href="' + base + it.path + '" style="margin-top:2px">View Details</a>'
      + '</div></article>';
  }
  function initLiveSearch() {
    var input = document.getElementById('liveSearchInput');
    var results = document.getElementById('liveResults');
    if (!input || !results) return;

    var query = getQueryParam('q') || '';
    input.value = query;
    updateLiveResults(query || '');

    var timer = null;
    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(timer);
      timer = setTimeout(function () { updateLiveResults(q); }, 60);
    });
    function updateLiveResults(q) {
      fetchIndex(function (idx) {
        var hits;
        if (!q) {
          hits = idx.slice(0, 24).map(function (it) { return { it: it, s: 0 }; });
        } else {
          hits = idx.map(function (it) { return { it: it, s: score(q, it) }; })
            .filter(function (h) { return h.s >= 0; })
            .sort(function (a, b) { return a.s - b.s; });
        }
        var total = hits.length;
        var shown = hits.slice(0, 24);
        var countEl = document.getElementById('liveCount');
        if (countEl) {
          countEl.textContent = q
            ? (total + ' result' + (total === 1 ? '' : 's') + ' for "' + q + '"')
            : (total + ' titles available');
        }
        if (!shown.length) {
          results.innerHTML = '<div class="empty"><div class="e-emoji">&#128269;</div><h3>No matches for &ldquo;' + escapeHtml(q) + '&rdquo;</h3><p>Try a different keyword, or browse all software.</p></div>';
          var emptyCta = document.getElementById('liveEmptyCta');
          if (emptyCta) emptyCta.style.display = '';
          return;
        }
        var emptyCta = document.getElementById('liveEmptyCta');
        if (emptyCta) emptyCta.style.display = 'none';
        var base = window.BASE || '';
        results.innerHTML = shown.map(function (h) { return cardHtml(h.it, base); }).join('');
      });
    }
  }
  function getQueryParam(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }
  function initSerialsFilter() {
    var list = document.getElementById('serialsList');
    var input = document.getElementById('serialsFilterInput');
    var clear = document.getElementById('serialsFilterClear');
    if (!list || !input) return;
    var rows = Array.prototype.slice.call(list.querySelectorAll('.ss-row'));
    function apply() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (r) {
        var hit = !q || (r.getAttribute('data-title') || '').indexOf(q) !== -1;
        r.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      if (clear) clear.style.display = q ? '' : 'none';
      var noteEl = document.getElementById('serialsCount');
      if (noteEl) noteEl.textContent = q ? (shown + ' of ' + rows.length + ' entries') : (rows.length + ' entries');
    }
    input.addEventListener('input', apply);
    if (clear) clear.addEventListener('click', function () { input.value = ''; apply(); input.focus(); });
    apply();
  }
  function escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var CAT_ICONS = {
    'graphics-design': '&#127912;', 'video-editing': '&#127916;', 'productivity': '&#128196;',
    'multimedia': '&#127911;', 'audio': '&#127911;', 'security': '&#128737;',
    'utilities': '&#128295;', 'browsers': '&#127760;', 'internet': '&#127760;',
    'compression': '&#128230;', 'file-management': '&#128193;', 'development': '&#128187;',
    'education': '&#127891;', 'windows': '&#128421;', 'drivers': '&#9881;', 'games': '&#127918;'
  };
  var CAT_LABELS = {
    'graphics-design': 'Graphics Design', 'video-editing': 'Video Editing', 'productivity': 'Productivity',
    'multimedia': 'Multimedia', 'audio': 'Audio', 'security': 'Security', 'utilities': 'Utilities',
    'browsers': 'Browsers', 'internet': 'Internet', 'compression': 'Compression',
    'file-management': 'File Management', 'development': 'Development', 'education': 'Education',
    'windows': 'Windows', 'drivers': 'Drivers', 'games': 'Games'
  };
  var TIER_LABELS = { 'low': '<span class="badge badge-success">&#129428; Low-end friendly</span>', 'medium': '<span class="badge badge-warning">&#9878;&#65039; Mid-range</span>', 'high': '<span class="badge badge-danger">&#128293; High-end</span>' };

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initMenu();
    initNavScroll();
    initNavSearchBtn();
    initHeroSearchBtn();
    initSort();
    initSlideshow();
    initToastLinks();
    initLightbox();
    initSearch('navSearch');
    initSearch('heroSearch');
    initSearch('mobileSearch');
    initFilter();
    initCompat();
    initChecker();
    initLiveSearch();
    initSerialsFilter();
  });
})();
