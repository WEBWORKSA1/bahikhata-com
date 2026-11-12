/* BahiKhata.com — GST invoice, quotation and receipt generator (runs in the browser) */
(function () {
  'use strict';
  var BK = window.BK; if (!BK) return;
  var $ = BK.$, $$ = BK.$$, num = BK.num, esc = BK.esc;
  var root = $('#inv'); if (!root) return;
  var KEY = 'bk-invoice-v1', SAVED = 'bk-invoices-v1';
  var CUR = { INR: ['₹', 'Rupees', 'Paise'], USD: ['$', 'US Dollars', 'Cents'], EUR: ['€', 'Euros', 'Cents'], GBP: ['£', 'Pounds', 'Pence'], AED: ['AED ', 'Dirhams', 'Fils'], CAD: ['C$', 'Canadian Dollars', 'Cents'], AUD: ['A$', 'Australian Dollars', 'Cents'], SGD: ['S$', 'Singapore Dollars', 'Cents'] };
  var DOCS = ['Tax invoice', 'Bill of supply', 'Quotation', 'Proforma invoice', 'Receipt', 'Delivery challan'];
  var fyNow = function () { var d = new Date(), y = d.getFullYear(), s = d.getMonth() >= 3 ? y : y - 1; return String(s).slice(2) + '-' + String(s + 1).slice(2); };

  function blank() {
    return {
      doc: 'Tax invoice', cur: 'INR', series: 'INV/' + fyNow() + '/', no: 1, date: BK.iso(new Date()), due: '',
      seller: { name: '', addr: '', gstin: '', phone: '', state: '' }, buyer: { name: '', addr: '', gstin: '', state: '' },
      items: [{ d: '', h: '', q: 1, u: 'pcs', r: 0, disc: 0, g: 18 }], other: 0, otherLabel: 'Shipping', round: true,
      notes: 'Thank you for your business.', bank: '', upi: '', logo: '', rcm: false
    };
  }
  var S = BK.store.get(KEY, null) || blank();
  if (!S.items || !S.items.length) S.items = blank().items;

  var stateOpts = '<option value="">Select state</option>' + Object.keys(BK.STATES || {}).map(function (k) { return '<option value="' + k + '">' + k + ' · ' + esc(BK.STATES[k]) + '</option>'; }).join('');
  $$('select[data-states]', root).forEach(function (s) { s.innerHTML = stateOpts; });
  $('#iv-doc').innerHTML = DOCS.map(function (d) { return '<option>' + d + '</option>'; }).join('');
  $('#iv-cur').innerHTML = Object.keys(CUR).map(function (c) { return '<option value="' + c + '">' + c + ' (' + CUR[c][0].trim() + ')</option>'; }).join('');

  var map = { 'iv-doc': 'doc', 'iv-cur': 'cur', 'iv-series': 'series', 'iv-no': 'no', 'iv-date': 'date', 'iv-due': 'due', 'iv-other': 'other', 'iv-other-l': 'otherLabel', 'iv-notes': 'notes', 'iv-bank': 'bank', 'iv-upi': 'upi',
    's-name': 'seller.name', 's-addr': 'seller.addr', 's-gstin': 'seller.gstin', 's-phone': 'seller.phone', 's-state': 'seller.state', 'b-name': 'buyer.name', 'b-addr': 'buyer.addr', 'b-gstin': 'buyer.gstin', 'b-state': 'buyer.state' };
  function getP(path) { return path.split('.').reduce(function (o, k) { return o ? o[k] : ''; }, S); }
  function setP(path, v) { var ks = path.split('.'), o = S; for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = v; }
  function loadForm() {
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) el.value = getP(map[id]) == null ? '' : getP(map[id]); });
    $('#iv-round').checked = !!S.round; $('#iv-rcm').checked = !!S.rcm;
    drawItems();
  }
  function drawItems() {
    var gstOn = S.doc !== 'Bill of supply' && S.doc !== 'Delivery challan';
    $('#iv-items').innerHTML = S.items.map(function (it, i) {
      return '<div class="inv-item" data-i="' + i + '"><div class="inv-item-top"><span class="inv-n">' + (i + 1) + '</span><input data-k="d" value="' + esc(it.d) + '" placeholder="Item or service description" aria-label="Description, item ' + (i + 1) + '"><button type="button" class="del" data-del="' + i + '" aria-label="Remove item ' + (i + 1) + '">×</button></div>' +
        '<div class="inv-item-grid"><label><span>HSN/SAC</span><input data-k="h" value="' + esc(it.h) + '"></label>' +
        '<label><span>Qty</span><input data-k="q" type="number" min="0" step="any" value="' + it.q + '"></label>' +
        '<label><span>Unit</span><input data-k="u" value="' + esc(it.u) + '"></label>' +
        '<label><span>Rate</span><input data-k="r" type="number" min="0" step="any" value="' + it.r + '"></label>' +
        '<label><span>Disc %</span><input data-k="disc" type="number" min="0" max="100" step="any" value="' + it.disc + '"></label>' +
        '<label' + (gstOn ? '' : ' hidden') + '><span>GST</span><select data-k="g">' + [0, 0.25, 3, 5, 18, 40].map(function (g) { return '<option value="' + g + '"' + (+it.g === g ? ' selected' : '') + '>' + g + '%</option>'; }).join('') + '</select></label></div></div>';
    }).join('');
    $$('[data-gst-col]', root).forEach(function (el) { el.hidden = !gstOn; });
  }

  function compute() {
    var gstOn = S.doc !== 'Bill of supply' && S.doc !== 'Delivery challan' && S.cur === 'INR';
    var inter = !!(S.seller.state && S.buyer.state && S.seller.state !== S.buyer.state);
    var lines = [], taxable = 0, tax = 0, byRate = {};
    S.items.forEach(function (it) {
      var gross = num(it.q) * num(it.r), d = gross * num(it.disc) / 100, tv = gross - d, g = gstOn ? num(it.g) : 0, tx = tv * g / 100;
      if (!it.d && !gross) return;
      lines.push({ it: it, gross: gross, disc: d, tv: tv, g: g, tx: tx });
      taxable += tv; tax += tx;
      if (gstOn) { byRate[g] = byRate[g] || { tv: 0, tx: 0 }; byRate[g].tv += tv; byRate[g].tx += tx; }
    });
    var other = num(S.other), pre = taxable + tax + other, total = S.round ? Math.round(pre) : Math.round(pre * 100) / 100;
    return { gstOn: gstOn, inter: inter, lines: lines, taxable: taxable, tax: tax, byRate: byRate, other: other, roundOff: total - pre, total: total };
  }

  var qrLib = null;
  function loadQR(cb) {
    if (window.qrcode) return cb();
    if (qrLib) { qrLib.push(cb); return; }
    qrLib = [cb];
    var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'; s.async = true;
    s.onload = function () { qrLib.forEach(function (f) { f(); }); qrLib = []; };
    s.onerror = function () { qrLib = []; };
    document.head.appendChild(s);
  }

  function preview() {
    var c = compute(), cur = CUR[S.cur] || CUR.INR, sym = cur[0], f = function (n) { return BK.fmt2(n, sym); };
    var no = (S.series || '') + S.no;
    var stateName = function (code) { return code && BK.STATES[code] ? BK.STATES[code] + ' (' + code + ')' : ''; };
    var head = '<div class="inv-top"><div>' + (S.logo ? '<img src="' + S.logo + '" alt="Logo">' : '') + '<h2>' + esc(S.doc) + '</h2>' +
      '<div><strong>' + esc(S.doc === 'Receipt' ? 'Receipt' : 'No.') + ' ' + esc(no) + '</strong></div><div>Date: ' + (S.date ? BK.niceDate(S.date) : '') + '</div>' + (S.due ? '<div>Due: ' + BK.niceDate(S.due) + '</div>' : '') + '</div>' +
      '<div style="text-align:right"><strong style="font-size:1.1rem">' + esc(S.seller.name || 'Your business name') + '</strong><div style="white-space:pre-line">' + esc(S.seller.addr) + '</div>' +
      (S.seller.gstin ? '<div>GSTIN: ' + esc(S.seller.gstin) + '</div>' : '') + (S.seller.state ? '<div>State: ' + esc(stateName(S.seller.state)) + '</div>' : '') + (S.seller.phone ? '<div>Phone: ' + esc(S.seller.phone) + '</div>' : '') + '</div></div>';
    var parties = '<div class="inv-parties"><div><h4>Bill to</h4><strong>' + esc(S.buyer.name || 'Customer name') + '</strong><div style="white-space:pre-line">' + esc(S.buyer.addr) + '</div>' + (S.buyer.gstin ? '<div>GSTIN: ' + esc(S.buyer.gstin) + '</div>' : '') + '</div>' +
      '<div>' + (c.gstOn ? '<h4>Place of supply</h4><div>' + esc(stateName(S.buyer.state) || '—') + '</div><div>' + (c.inter ? 'Inter-state supply (IGST)' : 'Intra-state supply (CGST + SGST)') + '</div><div>Reverse charge: ' + (S.rcm ? 'Yes' : 'No') + '</div>' : '') + '</div></div>';
    var thGst = c.gstOn ? (c.inter ? '<th class="num">IGST</th>' : '<th class="num">CGST</th><th class="num">SGST</th>') : '';
    var body = c.lines.map(function (l, i) {
      var tg = c.gstOn ? (c.inter ? '<td class="num">' + f(l.tx) + '<br><small>' + l.g + '%</small></td>' : '<td class="num">' + f(l.tx / 2) + '<br><small>' + (l.g / 2) + '%</small></td><td class="num">' + f(l.tx / 2) + '<br><small>' + (l.g / 2) + '%</small></td>') : '';
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(l.it.d) + (l.disc ? '<br><small>Discount ' + num(l.it.disc) + '%</small>' : '') + '</td><td>' + esc(l.it.h) + '</td><td class="num">' + num(l.it.q) + ' ' + esc(l.it.u) + '</td><td class="num">' + f(num(l.it.r)) + '</td><td class="num">' + f(l.tv) + '</td>' + tg + '<td class="num">' + f(l.tv + l.tx) + '</td></tr>';
    }).join('') || '<tr><td colspan="9" style="color:#6b7686">Add items on the left</td></tr>';
    var table = '<table><thead><tr><th>#</th><th>Description</th><th>HSN/SAC</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Taxable</th>' + thGst + '<th class="num">Amount</th></tr></thead><tbody>' + body + '</tbody></table>';
    var tot = '<div class="inv-tot"><div><span>Taxable value</span><span>' + f(c.taxable) + '</span></div>';
    if (c.gstOn) Object.keys(c.byRate).sort(function (a, b) { return a - b; }).forEach(function (g) { var x = c.byRate[g]; if (!x.tx) return; tot += c.inter ? '<div><span>IGST @ ' + g + '%</span><span>' + f(x.tx) + '</span></div>' : '<div><span>CGST @ ' + (g / 2) + '%</span><span>' + f(x.tx / 2) + '</span></div><div><span>SGST @ ' + (g / 2) + '%</span><span>' + f(x.tx / 2) + '</span></div>'; });
    if (c.other) tot += '<div><span>' + esc(S.otherLabel || 'Other charges') + '</span><span>' + f(c.other) + '</span></div>';
    if (Math.abs(c.roundOff) >= 0.005) tot += '<div><span>Round off</span><span>' + f(c.roundOff) + '</span></div>';
    tot += '<div class="grand"><span>Total</span><span>' + f(c.total) + '</span></div></div>';
    var words = '<p><strong>Amount in words:</strong> ' + esc(BK.words(c.total, { major: cur[1], minor: cur[2] })) + '</p>';
    var foot = '<div class="inv-foot"><div style="flex:1">' + (S.bank ? '<h4 style="font-size:.75rem;color:#6b7686;margin:0 0 4px">Bank details</h4><div style="white-space:pre-line">' + esc(S.bank) + '</div>' : '') +
      (S.notes ? '<h4 style="font-size:.75rem;color:#6b7686;margin:10px 0 4px">Notes and terms</h4><div style="white-space:pre-line">' + esc(S.notes) + '</div>' : '') + '</div>' +
      (S.upi && S.cur === 'INR' && c.total > 0 ? '<div class="inv-qr" style="text-align:center"><div id="inv-qr-box"></div><small>Scan to pay by UPI<br>' + esc(S.upi) + '</small></div>' : '') +
      '<div class="sign">For ' + esc(S.seller.name || 'your business') + '<div class="line">Authorised signatory</div></div></div>';
    var gen = '<p style="margin-top:14px;font-size:.72rem;color:#8d99aa">' + 'Made with the free invoice generator at BahiKhata.com</p>';
    $('#inv-paper').innerHTML = head + parties + table + tot + words + foot + gen;
    if (S.upi && S.cur === 'INR' && c.total > 0) loadQR(function () {
      var box = $('#inv-qr-box'); if (!box || !window.qrcode) return;
      var link = 'upi://pay?pa=' + encodeURIComponent(S.upi) + '&pn=' + encodeURIComponent(S.seller.name || 'Merchant') + '&am=' + c.total.toFixed(2) + '&cu=INR&tn=' + encodeURIComponent('Invoice ' + no);
      var q = window.qrcode(0, 'M'); q.addData(link); q.make(); box.innerHTML = q.createSvgTag({ cellSize: 3, margin: 2, scalable: true });
      var svg = box.querySelector('svg'); if (svg) { svg.setAttribute('width', '110'); svg.setAttribute('height', '110'); }
    });
    var warn = [];
    if (S.doc === 'Tax invoice' && S.cur === 'INR') {
      if (!S.seller.gstin) warn.push('Add your GSTIN: it is mandatory on a tax invoice.');
      else if (BK.gstinInfo && !BK.gstinInfo(S.seller.gstin).ok) warn.push('Your GSTIN does not pass the format check.');
      if (S.buyer.gstin && BK.gstinInfo && !BK.gstinInfo(S.buyer.gstin).ok) warn.push("The customer's GSTIN does not pass the format check.");
      if (!S.seller.state || !S.buyer.state) warn.push('Choose both states so CGST/SGST or IGST is applied correctly.');
      if (String(no).length > 16) warn.push('GST invoice numbers can be at most 16 characters.');
    }
    $('#inv-warn').innerHTML = warn.length ? '<div class="note"><strong>Check before you send:</strong><ul style="margin:6px 0 0;padding-left:1.1em">' + warn.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></div>' : '';
    BK.store.set(KEY, S);
  }

  root.addEventListener('input', function (e) {
    var el = e.target, row = el.closest('[data-i]');
    if (row && el.getAttribute('data-k')) { var it = S.items[+row.getAttribute('data-i')], k = el.getAttribute('data-k'); it[k] = (k === 'd' || k === 'h' || k === 'u') ? el.value : el.value; preview(); return; }
    var path = map[el.id];
    if (path) {
      setP(path, el.id === 'iv-no' ? el.value : el.value);
      if (el.id === 'b-gstin' || el.id === 's-gstin') {
        var code = el.value.trim().slice(0, 2); var target = el.id === 'b-gstin' ? 'b-state' : 's-state';
        if (/^\d\d$/.test(code) && BK.STATES[code]) { $('#' + target).value = code; setP(map[target], code); }
      }
      if (el.id === 'iv-doc' || el.id === 'iv-cur') drawItems();
      preview();
    }
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-del')) { S.items.splice(+b.getAttribute('data-del'), 1); if (!S.items.length) S.items.push(blank().items[0]); drawItems(); preview(); }
  });
  // change events on selects need to update state too
  root.addEventListener('change', function (e) {
    var el = e.target, row = el.closest('[data-i]');
    if (row && el.getAttribute('data-k')) { S.items[+row.getAttribute('data-i')][el.getAttribute('data-k')] = el.value; preview(); }
    else if (map[el.id]) { setP(map[el.id], el.value); if (el.id === 'iv-doc' || el.id === 'iv-cur') drawItems(); preview(); }
    else if (el.id === 'iv-round') { S.round = el.checked; preview(); }
    else if (el.id === 'iv-rcm') { S.rcm = el.checked; preview(); }
  });
  $('#iv-add').addEventListener('click', function () { var lastG = S.items.length ? S.items[S.items.length - 1].g : 18; S.items.push({ d: '', h: '', q: 1, u: 'pcs', r: 0, disc: 0, g: lastG }); drawItems(); preview(); var ins = $$('#iv-items [data-k=d]'); if (ins.length) ins[ins.length - 1].focus(); });
  $('#iv-logo').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    if (f.size > 400000) { BK.toast('Use a logo under 400 KB'); return; }
    var r = new FileReader(); r.onload = function () { S.logo = r.result; preview(); }; r.readAsDataURL(f);
  });
  $('#iv-logo-x').addEventListener('click', function () { S.logo = ''; $('#iv-logo').value = ''; preview(); });
  $('#iv-print').addEventListener('click', function () {
    document.body.classList.add('print-invoice'); var t = document.title; document.title = ((S.series || '') + S.no).replace(/[\/\\]/g, '-') + ' ' + (S.buyer.name || '');
    setTimeout(function () { window.print(); document.title = t; setTimeout(function () { document.body.classList.remove('print-invoice'); }, 400); }, 60);
  });
  function savedList() { return BK.store.get(SAVED, []); }
  function drawSaved() {
    var list = savedList();
    $('#iv-saved').innerHTML = list.length ? '<ul class="plist">' + list.map(function (x, i) { return '<li><button type="button" data-load="' + i + '"><span class="avatar">' + esc((x.buyer.name || '?').charAt(0).toUpperCase()) + '</span><span><span class="pname">' + esc((x.series || '') + x.no) + ' · ' + esc(x.buyer.name || 'Customer') + '</span><span class="psub">' + esc(x.doc) + ', ' + (x.date ? BK.niceDate(x.date) : '') + '</span></span><span class="pbal">' + BK.fmt2(x._total || 0, (CUR[x.cur] || CUR.INR)[0]) + '<small><a href="#" data-rm="' + i + '">Remove</a></small></span></button></li>'; }).join('') + '</ul>' : '<p class="muted small">Saved invoices appear here. They are stored only in this browser.</p>';
  }
  $('#iv-save').addEventListener('click', function () {
    var list = savedList(), copy = JSON.parse(JSON.stringify(S)); copy._total = compute().total; copy._saved = Date.now();
    var key = (copy.series || '') + copy.no, idx = list.findIndex(function (x) { return (x.series || '') + x.no === key; });
    if (idx >= 0) list[idx] = copy; else list.unshift(copy);
    BK.store.set(SAVED, list.slice(0, 50)); drawSaved(); BK.toast('Invoice saved');
  });
  $('#iv-new').addEventListener('click', function () {
    var keep = { seller: S.seller, logo: S.logo, bank: S.bank, upi: S.upi, notes: S.notes, series: S.series, cur: S.cur, doc: S.doc };
    var next = (parseInt(S.no, 10) || 0) + 1; S = blank(); Object.keys(keep).forEach(function (k) { S[k] = keep[k]; }); S.no = next; loadForm(); preview(); BK.toast('New ' + S.doc.toLowerCase() + ' ' + (S.series || '') + S.no);
  });
  $('#iv-reset').addEventListener('click', function () { if (!confirm('Clear every field, including your business details?')) return; S = blank(); loadForm(); preview(); });
  $('#iv-saved').addEventListener('click', function (e) {
    var rm = e.target.closest('[data-rm]');
    if (rm) { e.preventDefault(); e.stopPropagation(); var l = savedList(); l.splice(+rm.getAttribute('data-rm'), 1); BK.store.set(SAVED, l); drawSaved(); return; }
    var ld = e.target.closest('[data-load]'); if (!ld) return;
    S = JSON.parse(JSON.stringify(savedList()[+ld.getAttribute('data-load')])); loadForm(); preview(); BK.toast('Loaded'); root.scrollIntoView({ behavior: 'smooth' });
  });

  loadForm(); preview(); drawSaved();
})();
