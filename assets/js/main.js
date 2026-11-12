/* BahiKhata.com — shared site behaviour */
(function () {
  'use strict';
  var ROOT = window.BK_ROOT || './';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  var inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  var inr2 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var BK = window.BK = {
    $: $, $$: $$, ROOT: ROOT, MONTHS: MONTHS,
    num: function (v) { var n = parseFloat(String(v == null ? '' : v).replace(/[,\s₹]/g, '')); return isFinite(n) ? n : 0; },
    fmt: function (n, sym) { n = Math.round((+n || 0) * 100) / 100; return (sym === false ? '' : (sym || '₹')) + inr.format(n); },
    fmt2: function (n, sym) { return (sym === false ? '' : (sym || '₹')) + inr2.format(Math.round((+n || 0) * 100) / 100); },
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    pad: function (n) { return (n < 10 ? '0' : '') + n; },
    iso: function (d) { return d.getFullYear() + '-' + BK.pad(d.getMonth() + 1) + '-' + BK.pad(d.getDate()); },
    parseISO: function (s) { var p = String(s).split('-'); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); },
    niceDate: function (d) { if (typeof d === 'string') d = BK.parseISO(d); return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); },
    toast: function (msg) {
      var t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show');
      clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2600);
    },
    copy: function (text) {
      var done = function () { BK.toast('Copied'); };
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, function () { fallback(); }); }
      else fallback();
      function fallback() { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { } ta.remove(); }
    },
    download: function (name, text, mime) {
      var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },
    csv: function (rows) {
      return '﻿' + rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\r\n');
    },
    store: {
      get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
      set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
    }
  };

  /* ---------- amount in words (Indian and international) ---------- */
  var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''); }
  function three(n) { var h = Math.floor(n / 100), r = n % 100; return (h ? ONES[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? two(r) : ''); }
  function indianWords(n) {
    if (n === 0) return 'Zero';
    var out = [], crore = Math.floor(n / 1e7); n %= 1e7;
    if (crore) out.push((crore > 999 ? indianWords(crore) : three(crore)) + ' Crore');
    var lakh = Math.floor(n / 1e5); n %= 1e5; if (lakh) out.push(two(lakh) + ' Lakh');
    var th = Math.floor(n / 1000); n %= 1000; if (th) out.push(two(th) + ' Thousand');
    if (n) out.push(three(n));
    return out.join(' ');
  }
  function intlWords(n) {
    if (n === 0) return 'Zero';
    var units = ['', ' Thousand', ' Million', ' Billion', ' Trillion'], out = [], i = 0;
    while (n > 0 && i < units.length) { var c = n % 1000; if (c) out.unshift(three(c) + units[i]); n = Math.floor(n / 1000); i++; }
    return out.join(' ');
  }
  BK.words = function (amount, opts) {
    opts = opts || {};
    var neg = amount < 0; amount = Math.abs(+amount || 0);
    var rupees = Math.floor(amount + 1e-9), paise = Math.round((amount - rupees) * 100);
    if (paise === 100) { rupees += 1; paise = 0; }
    var fn = opts.system === 'intl' ? intlWords : indianWords;
    var major = opts.major == null ? 'Rupees' : opts.major, minor = opts.minor == null ? 'Paise' : opts.minor;
    var s = (major ? major + ' ' : '') + fn(rupees);
    if (paise) s += ' and ' + two(paise) + (minor ? ' ' + minor : '');
    return (neg ? 'Minus ' : '') + s + (opts.only === false ? '' : ' Only');
  };

  /* ---------- compliance due dates (statutory defaults) ---------- */
  BK.dueDates = function (from, days) {
    from = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    var to = new Date(from); to.setDate(to.getDate() + (days || 60));
    var ev = [];
    function add(y, m, d, title, who, tag) { var dt = new Date(y, m, d); if (dt >= from && dt <= to) ev.push({ date: dt, title: title, who: who, tag: tag }); }
    for (var y = from.getFullYear() - 1; y <= to.getFullYear() + 1; y++) {
      for (var m = 0; m < 12; m++) {
        var prev = MONTHS[(m + 11) % 12];
        if (m === 3) add(y, 3, 30, 'TDS and TCS deposit for March', 'Businesses that deduct or collect tax at source', 'tds');
        else add(y, m, 7, 'TDS and TCS deposit for ' + prev, 'Businesses that deduct or collect tax at source', 'tds');
        add(y, m, 11, 'GSTR-1 for ' + prev + ' (monthly filers)', 'Regular GST taxpayers filing monthly', 'gst');
        add(y, m, 15, 'PF and ESI contribution for ' + prev, 'Employers registered for PF and ESI', 'payroll');
        add(y, m, 20, 'GSTR-3B for ' + prev + ' (monthly filers)', 'Regular GST taxpayers filing monthly', 'gst');
        if (m === 0 || m === 3 || m === 6 || m === 9) {
          var qn = { 0: 'October–December', 3: 'January–March', 6: 'April–June', 9: 'July–September' }[m];
          add(y, m, 13, 'GSTR-1 for ' + qn + ' quarter (QRMP)', 'GST taxpayers in the QRMP scheme', 'qrmp');
          add(y, m, 18, 'CMP-08 for ' + qn + ' quarter', 'Composition scheme taxpayers', 'comp');
          add(y, m, 22, 'GSTR-3B for ' + qn + ' quarter (QRMP, 22nd or 24th by state)', 'GST taxpayers in the QRMP scheme', 'qrmp');
        } else {
          add(y, m, 13, 'IFF (optional B2B invoices) for ' + prev, 'GST taxpayers in the QRMP scheme', 'qrmp');
          add(y, m, 25, 'PMT-06 GST payment for ' + prev, 'GST taxpayers in the QRMP scheme', 'qrmp');
        }
      }
      add(y, 5, 15, 'Advance tax: first instalment (15%)', 'Taxpayers with tax above ₹10,000 for the year', 'it');
      add(y, 8, 15, 'Advance tax: second instalment (45%)', 'Taxpayers with tax above ₹10,000 for the year', 'it');
      add(y, 11, 15, 'Advance tax: third instalment (75%)', 'Taxpayers with tax above ₹10,000 for the year', 'it');
      add(y, 2, 15, 'Advance tax: final instalment (100%)', 'Taxpayers with tax above ₹10,000 for the year', 'it');
      add(y, 3, 30, 'GSTR-4 annual return for the last financial year', 'Composition scheme taxpayers', 'comp');
      add(y, 4, 31, 'TDS return for January–March quarter', 'TDS deductors', 'tds');
      add(y, 6, 31, 'TDS return for April–June quarter', 'TDS deductors', 'tds');
      add(y, 9, 31, 'TDS return for July–September quarter', 'TDS deductors', 'tds');
      add(y, 0, 31, 'TDS return for October–December quarter', 'TDS deductors', 'tds');
      add(y, 6, 31, 'Income-tax return (non-audit cases)', 'Individuals and businesses not needing a tax audit', 'it');
      add(y, 8, 30, 'Tax audit report', 'Businesses that need a tax audit', 'it');
      add(y, 9, 31, 'Income-tax return (tax audit cases)', 'Businesses that need a tax audit', 'it');
      add(y, 11, 31, 'GSTR-9 and GSTR-9C annual return', 'Regular GST taxpayers (optional below ₹2 crore)', 'gst');
    }
    ev.sort(function (a, b) { return a.date - b.date || a.title.localeCompare(b.title); });
    return ev;
  };
  function renderDates(el) {
    var limit = +el.getAttribute('data-limit') || 6;
    var list = BK.dueDates(new Date(), 75).slice(0, limit);
    var now = new Date();
    el.innerHTML = list.map(function (e) {
      var soon = (e.date - now) / 864e5 < 5;
      return '<li' + (soon ? ' class="soon"' : '') + '><div class="d"><b>' + e.date.getDate() + '</b><span>' + MONTHS[e.date.getMonth()].slice(0, 3) + '</span></div><div><strong>' + BK.esc(e.title) + '</strong><small>' + BK.esc(e.who) + '</small></div></li>';
    }).join('');
  }

  /* ---------- forms: send to the owner's inbox without exposing it ---------- */
  var _k = [122, 120, 116, 57, 123, 126, 118, 122, 112, 87, 38, 118, 100, 124, 101, 120, 96, 117, 114, 96];
  function inbox() { return _k.slice().reverse().map(function (c) { return String.fromCharCode(c ^ 23); }).join(''); }
  BK.mailto = function (subject, body) { window.location.href = 'mailto:' + inbox() + '?subject=' + encodeURIComponent(subject || 'Hello from BahiKhata.com') + '&body=' + encodeURIComponent(body || ''); };
  $$('[data-mail]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); BK.mailto(a.getAttribute('data-mail')); });
  });

  // capture campaign source once per session for lead attribution
  (function () {
    try {
      var q = new URLSearchParams(location.search), keep = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'].forEach(function (k) { if (q.get(k)) keep[k] = q.get(k); });
      if (Object.keys(keep).length) sessionStorage.setItem('bk-utm', JSON.stringify(keep));
      if (!sessionStorage.getItem('bk-landing')) sessionStorage.setItem('bk-landing', location.pathname + location.search);
      if (!sessionStorage.getItem('bk-ref') && document.referrer && document.referrer.indexOf(location.host) < 0) sessionStorage.setItem('bk-ref', document.referrer);
    } catch (e) { }
  })();

  function collect(form) {
    var data = {}, fd = new FormData(form);
    fd.forEach(function (v, k) {
      if (k === '_honey') return;
      if (typeof v !== 'string') return;
      v = v.trim(); if (!v) return;
      data[k] = data[k] ? data[k] + ', ' + v : v;
    });
    return data;
  }
  BK.send = function (subject, data) {
    var payload = {};
    Object.keys(data).forEach(function (k) { payload[k] = data[k]; });
    payload._subject = subject;
    payload._template = 'table';
    payload._captcha = 'false';
    payload['Page'] = location.href.split('#')[0];
    try {
      var utm = JSON.parse(sessionStorage.getItem('bk-utm') || 'null'); if (utm) payload['Campaign'] = JSON.stringify(utm);
      payload['Landing page'] = sessionStorage.getItem('bk-landing') || '';
      payload['Referrer'] = sessionStorage.getItem('bk-ref') || 'direct';
    } catch (e) { }
    payload['Submitted'] = new Date().toString();
    return fetch('https://formsubmit.co/ajax/' + inbox(), {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === 'false' || j.success === false) throw new Error(j.message || 'Send failed'); return j; }); });
  };
  function bodyText(data) { return Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n'); }

  function handleSubmit(form, e) {
    e.preventDefault();
    var msg = $('.form-msg', form);
    var hp = form.querySelector('[name=_honey]');
    if (hp && hp.value) { done(); return; }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var data = collect(form);
    var subject = form.getAttribute('data-subject') || 'Website enquiry';
    var sf = form.getAttribute('data-subject-field');
    if (sf && data[sf]) subject += ': ' + data[sf];
    if (data.city) subject += ' (' + data.city + ')';
    if (form.hasAttribute('data-before')) { try { window[form.getAttribute('data-before')](form, data); } catch (er) { } }
    var btn = form.querySelector('[type=submit]'); if (btn) { btn.disabled = true; btn._t = btn.textContent; btn.textContent = 'Sending…'; }
    BK.send(subject, data).then(done).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = btn._t; }
      if (msg) { msg.className = 'form-msg err'; msg.innerHTML = 'We could not send this automatically. <a href="#" class="js-mail-fallback">Send it by email instead</a> and we will reply from there.'; }
      var fb = form.querySelector('.js-mail-fallback'); if (fb) fb.addEventListener('click', function (ev) { ev.preventDefault(); BK.mailto(subject, bodyText(data)); });
    });
    function done() {
      if (btn) { btn.disabled = false; btn.textContent = btn._t || btn.textContent; }
      try { var n = BK.store.get('bk-sent', 0); BK.store.set('bk-sent', n + 1); } catch (er) { }
      var target = form.getAttribute('data-done');
      if (target && $(target)) { form.hidden = true; $(target).hidden = false; $(target).scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      else if (msg) { msg.className = 'form-msg ok'; msg.textContent = form.getAttribute('data-ok') || 'Thank you. We have received your message.'; form.reset(); }
      if (window.gtag) try { gtag('event', 'generate_lead', { form: subject }); } catch (er) { }
    }
  }
  $$('form.js-send').forEach(function (f) { f.addEventListener('submit', function (e) { handleSubmit(f, e); }); });

  /* ---------- multi-step forms ---------- */
  $$('.js-steps').forEach(function (form) {
    var steps = $$('.step', form), bar = $('.steps-bar', form), i = 0;
    if (bar) bar.innerHTML = steps.map(function () { return '<span></span>'; }).join('');
    function show(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      if (bar) $$('span', bar).forEach(function (s, k) { s.classList.toggle('on', k <= i); });
    }
    function valid(step) {
      var ok = true;
      $$('input,select,textarea', step).forEach(function (el) { if (ok && !el.checkValidity()) { el.reportValidity(); ok = false; } });
      var group = step.getAttribute('data-need-one');
      if (ok && group && !step.querySelector('input[name="' + group + '"]:checked')) {
        ok = false; var m = $('.step-msg', step); if (m) { m.className = 'form-msg err step-msg'; m.textContent = 'Choose at least one option to continue.'; }
      }
      return ok;
    }
    form.addEventListener('click', function (e) {
      var b = e.target.closest('[data-step]'); if (!b) return;
      e.preventDefault();
      var dir = +b.getAttribute('data-step');
      if (dir > 0 && !valid(steps[i])) return;
      show(i + dir);
      var top = form.getBoundingClientRect().top + window.scrollY - 100; if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    });
    form.addEventListener('change', function (e) { var m = $('.step-msg', steps[i]); if (m && e.target.type === 'checkbox') { m.className = 'form-msg step-msg'; } });
    try {
      var need = new URLSearchParams(location.search).get('need');
      if (need) $$('input[name="need"]', form).forEach(function (c) { if (c.getAttribute('data-key') === need) c.checked = true; });
    } catch (e) { }
    show(0);
  });

  /* ---------- theme, nav, cookie ---------- */
  var tb = $('#theme-btn');
  if (tb) tb.addEventListener('click', function () {
    var d = document.documentElement, next = d.dataset.theme === 'dark' ? 'light' : 'dark';
    d.dataset.theme = next; try { localStorage.setItem('bk-theme', next); } catch (e) { }
  });
  var mb = $('#menu-btn'), scrim = $('#nav-scrim');
  function navOpen(open) { document.body.classList.toggle('nav-open', open); if (mb) mb.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  if (mb) mb.addEventListener('click', function () { navOpen(!document.body.classList.contains('nav-open')); });
  if (scrim) scrim.addEventListener('click', function () { navOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { navOpen(false); $$('.nav details[open]').forEach(function (d) { d.open = false; }); } });
  document.addEventListener('click', function (e) { $$('.nav details[open]').forEach(function (d) { if (!d.contains(e.target)) d.open = false; }); });
  var ck = $('#cookie');
  if (ck && !BK.store.get('bk-cookie-ok', false)) { ck.classList.add('show'); }
  var cko = $('#cookie-ok'); if (cko) cko.addEventListener('click', function () { BK.store.set('bk-cookie-ok', true); ck.classList.remove('show'); });

  /* ---------- video facades ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.yt[data-id]'); if (!b || b.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-id') + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label') || 'YouTube video'; f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true;
    b.appendChild(f); var p = b.querySelector('.play'); if (p) p.remove();
  });
  $$('.vfilter').forEach(function (bar) {
    bar.addEventListener('click', function (e) {
      var c = e.target.closest('[data-vf]'); if (!c) return;
      $$('[data-vf]', bar).forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      var t = c.getAttribute('data-vf');
      $$('.vcard').forEach(function (v) { v.hidden = !(t === 'all' || v.getAttribute('data-topic') === t); });
    });
  });

  /* ---------- hero ledger demo ---------- */
  var demo = $('#demo-ledger');
  if (demo) {
    var rows = [{ n: 'Sharma General Store', g: 2400, r: 0 }, { n: 'Verma ji', g: 0, r: 1500 }, { n: 'Anita Tailors', g: 860, r: 0 }];
    var tbody = $('tbody', demo), total = $('.amt', demo), lbl = $('.lbl', demo);
    var draw = function (fresh) {
      tbody.innerHTML = rows.map(function (x, k) {
        return '<tr' + (fresh && k === rows.length - 1 ? ' class="new"' : '') + '><td class="name">' + BK.esc(x.n) + '</td><td class="num gave">' + (x.g ? BK.fmt(x.g, false) : '') + '</td><td class="num got">' + (x.r ? BK.fmt(x.r, false) : '') + '</td></tr>';
      }).join('');
      var bal = rows.reduce(function (s, x) { return s + x.g - x.r; }, 0);
      total.textContent = BK.fmt(Math.abs(bal));
      total.className = 'amt ' + (bal >= 0 ? 'pos' : 'neg');
      lbl.textContent = bal >= 0 ? 'You will get (lena)' : 'You will give (dena)';
    };
    draw();
    demo.addEventListener('click', function (e) {
      var b = e.target.closest('[data-demo]'); if (!b) return;
      var n = $('#demo-name').value.trim() || 'New customer', a = BK.num($('#demo-amt').value);
      if (!a) { $('#demo-amt').focus(); BK.toast('Enter an amount first'); return; }
      rows.push({ n: n, g: b.getAttribute('data-demo') === 'gave' ? a : 0, r: b.getAttribute('data-demo') === 'got' ? a : 0 });
      if (rows.length > 6) rows.shift();
      $('#demo-amt').value = ''; draw(true);
    });
  }

  /* ---------- auto-updating widgets ---------- */
  $$('[data-duedates]').forEach(renderDates);
  $$('[data-news]').forEach(function (el) {
    var limit = +el.getAttribute('data-limit') || 8;
    fetch(ROOT + 'assets/data/news.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (j) {
      var items = (j.items || []).slice(0, limit);
      if (!items.length) { el.innerHTML = '<li class="muted">Headlines refresh automatically every day. Check back shortly.</li>'; return; }
      el.innerHTML = items.map(function (n) {
        var d = n.published ? new Date(n.published) : null;
        return '<li><a href="' + BK.esc(n.link) + '" target="_blank" rel="noopener nofollow">' + BK.esc(n.title) + '</a><div class="src">' + BK.esc(n.source || '') + (d && !isNaN(d) ? ', ' + BK.niceDate(d) : '') + (n.topic ? ' · ' + BK.esc(n.topic) : '') + '</div></li>';
      }).join('');
      var u = $('[data-news-updated]'); if (u && j.updated) u.textContent = BK.niceDate(new Date(j.updated));
    }).catch(function () { el.innerHTML = '<li class="muted">Headlines could not load right now.</li>'; });
  });
  (function () {
    var now = new Date(), last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    $$('[data-contest-month]').forEach(function (el) { el.textContent = MONTHS[now.getMonth()] + ' ' + now.getFullYear(); });
    $$('[data-contest-deadline]').forEach(function (el) { el.textContent = BK.niceDate(last); });
    $$('[data-days-left]').forEach(function (el) { var d = Math.ceil((last - now) / 864e5); el.textContent = d + (d === 1 ? ' day' : ' days'); });
  })();

  /* ---------- site search ---------- */
  var sf = $('#search-form');
  if (sf) {
    var input = $('#q', sf), out = $('#search-results'), idx = null;
    var run = function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { out.innerHTML = ''; return; }
      var load = idx ? Promise.resolve(idx) : fetch(ROOT + 'assets/data/search-index.json').then(function (r) { return r.json(); }).then(function (j) { idx = j; return j; });
      load.then(function (list) {
        var terms = q.split(/\s+/);
        var res = list.map(function (p) {
          var t = p.t.toLowerCase(), d = (p.d || '').toLowerCase(), x = (p.x || '').toLowerCase(), s = 0;
          terms.forEach(function (w) { if (t.indexOf(w) >= 0) s += 5; if (d.indexOf(w) >= 0) s += 2; if (x.indexOf(w) >= 0) s += 1; });
          return { p: p, s: s };
        }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 20);
        out.innerHTML = res.length ? res.map(function (r) { return '<li><a href="' + ROOT + r.p.u + '">' + BK.esc(r.p.t) + '</a><p>' + BK.esc(r.p.d) + '</p></li>'; }).join('')
          : '<li class="empty">No pages match "' + BK.esc(q) + '". Try a simpler word such as GST, udhaar or invoice.</li>';
      });
    };
    sf.addEventListener('submit', function (e) { e.preventDefault(); run(); try { history.replaceState(null, '', '?q=' + encodeURIComponent(input.value)); } catch (er) { } });
    input.addEventListener('input', function () { clearTimeout(input._t); input._t = setTimeout(run, 180); });
    var q0 = new URLSearchParams(location.search).get('q'); if (q0) { input.value = q0; run(); }
  }

  /* ---------- quiz (contests page) ---------- */
  var quiz = $('.js-quiz');
  if (quiz) {
    $('#quiz-check').addEventListener('click', function () {
      var qs = $$('.quiz-q', quiz), score = 0, answered = 0;
      qs.forEach(function (q) {
        var pick = q.querySelector('input:checked'); q.classList.remove('right', 'wrong');
        if (!pick) return; answered++;
        if (pick.value === q.getAttribute('data-a')) { score++; q.classList.add('right'); } else q.classList.add('wrong');
      });
      var r = $('#quiz-result');
      if (answered < qs.length) { r.className = 'form-msg err'; r.textContent = 'Answer all ' + qs.length + ' questions to see your score.'; return; }
      r.className = 'form-msg ok'; r.textContent = 'You scored ' + score + ' out of ' + qs.length + '. ' + (score === qs.length ? 'Perfect hisaab! Submit your entry below.' : 'Read the explanations, then submit your score below.');
      var hidden = $('#quiz-score'); if (hidden) hidden.value = score + '/' + qs.length;
      var entry = $('#quiz-entry'); if (entry) entry.hidden = false;
    });
  }

  /* ---------- printable and spreadsheet templates ---------- */
  var TPL = {
    'cash-book': { title: 'Cash book (rokad bahi)', cols: ['Date', 'Particulars', 'Receipt no.', 'Cash in (₹)', 'Cash out (₹)', 'Balance (₹)'] },
    'party-ledger': { title: 'Party ledger (khata)', cols: ['Date', 'Particulars / bill no.', 'You gave (naam) ₹', 'You got (jama) ₹', 'Balance ₹', 'Dr/Cr'] },
    'udhaar-register': { title: 'Udhaar register', cols: ['Date', 'Customer name', 'Mobile', 'Items / bill no.', 'Amount ₹', 'Due date', 'Paid on', 'Remarks'] },
    'stock-register': { title: 'Stock register', cols: ['Date', 'Item', 'Opening qty', 'Received', 'Sold / issued', 'Closing qty', 'Reorder level', 'Remarks'] },
    'expense-tracker': { title: 'Monthly expense tracker', cols: ['Date', 'Expense head', 'Paid to', 'Mode (cash/UPI/bank)', 'Amount ₹', 'Bill attached (Y/N)'] },
    'daily-sales': { title: 'Daily sales register', cols: ['Date', 'Cash sales ₹', 'UPI / card sales ₹', 'Credit sales ₹', 'Returns ₹', 'Net sales ₹', 'Notes'] },
    'purchase-register': { title: 'Purchase register', cols: ['Date', 'Supplier', 'GSTIN', 'Invoice no.', 'Taxable value ₹', 'GST ₹', 'Total ₹', 'Paid / due'] },
    'salary-register': { title: 'Staff salary and advance register', cols: ['Month', 'Staff name', 'Days present', 'Salary ₹', 'Advance taken ₹', 'Deductions ₹', 'Net paid ₹', 'Signature'] }
  };
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-csv]'), p = e.target.closest('[data-print-template]');
    if (c) { var t = TPL[c.getAttribute('data-csv')]; if (!t) return; var rows = [t.cols]; for (var i = 0; i < 40; i++) rows.push(t.cols.map(function () { return ''; })); BK.download('bahikhata-' + c.getAttribute('data-csv') + '.csv', BK.csv(rows), 'text/csv;charset=utf-8'); BK.toast('Template downloaded'); }
    if (p) {
      var tp = TPL[p.getAttribute('data-print-template')]; if (!tp) return;
      var w = window.open('', '_blank'); if (!w) { BK.toast('Allow pop-ups to print'); return; }
      var body = '<tr>' + tp.cols.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';
      for (var j = 0; j < 26; j++) body += '<tr>' + tp.cols.map(function () { return '<td>&nbsp;</td>'; }).join('') + '</tr>';
      w.document.write('<!doctype html><title>' + tp.title + '</title><style>body{font-family:Mukta,Arial,sans-serif;margin:24px;color:#1b2430}h1{font-size:20px;color:#A4161A;margin:0 0 4px}p{margin:0 0 12px;font-size:12px;color:#555}table{width:100%;border-collapse:collapse}th{font-size:11px;text-align:left;border-bottom:2px solid #A4161A;padding:6px}td{border-bottom:1px solid #9fb5d6;height:26px}td:first-child,th:first-child{border-right:2px solid #A4161A}@page{size:A4 landscape;margin:12mm}</style><h1>' + tp.title + '</h1><p>Business: ____________________ &nbsp; Month: __________ &nbsp; Page: ____ &nbsp;&nbsp; Free template from BahiKhata.com</p><table>' + body + '</table><script>window.onload=function(){window.print()}<\/script>');
      w.document.close();
    }
  });
})();
