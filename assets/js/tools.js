/* BahiKhata.com — business calculators */
(function () {
  'use strict';
  var BK = window.BK; if (!BK) return;
  var $ = BK.$, $$ = BK.$$, num = BK.num, fmt = BK.fmt, fmt2 = BK.fmt2, esc = BK.esc;

  BK.STATES = { '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat', '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman and Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh', '97': 'Other Territory', '99': 'Centre Jurisdiction' };
  var OLD_STATES = { '25': 'Daman and Diu (merged into 26)', '28': 'Andhra Pradesh (old code)' };
  var PAN_TYPES = { P: 'Individual or proprietor', C: 'Company', H: 'Hindu Undivided Family (HUF)', F: 'Partnership firm', A: 'Association of Persons', T: 'Trust', B: 'Body of Individuals', L: 'Local authority', J: 'Artificial juridical person', G: 'Government', E: 'Limited Liability Partnership' };
  var CH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  BK.gstinCheckChar = function (first14) {
    var sum = 0, factor = 2, mod = 36;
    for (var i = first14.length - 1; i >= 0; i--) {
      var cp = CH.indexOf(first14.charAt(i)); if (cp < 0) return null;
      var add = factor * cp; factor = factor === 2 ? 1 : 2;
      add = Math.floor(add / mod) + (add % mod); sum += add;
    }
    return CH.charAt((mod - (sum % mod)) % mod);
  };
  BK.gstinInfo = function (g) {
    g = String(g || '').toUpperCase().replace(/\s/g, '');
    var r = { gstin: g, ok: false, issues: [] };
    if (g.length !== 15) { r.issues.push('A GSTIN has exactly 15 characters; this has ' + g.length + '.'); return r; }
    if (!/^[0-9A-Z]{15}$/.test(g)) { r.issues.push('Only capital letters and digits are allowed.'); return r; }
    r.stateCode = g.slice(0, 2); r.state = BK.STATES[r.stateCode] || OLD_STATES[r.stateCode] || null;
    if (!r.state) r.issues.push('The first two digits (' + r.stateCode + ') are not a valid state code.');
    r.pan = g.slice(2, 12);
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(r.pan)) r.issues.push('Characters 3 to 12 should be a PAN (5 letters, 4 digits, 1 letter).');
    else r.panType = PAN_TYPES[r.pan.charAt(3)] || 'Other';
    r.entity = g.charAt(12);
    if (!/[1-9A-Z]/.test(r.entity)) r.issues.push('Character 13 should be 1–9 or A–Z (registration number under this PAN in the state).');
    if (g.charAt(13) !== 'Z') r.issues.push('Character 14 is "Z" for regular taxpayers; this is "' + g.charAt(13) + '". Some special registrations differ.');
    r.expected = BK.gstinCheckChar(g.slice(0, 14));
    r.checkOk = r.expected === g.charAt(14);
    if (!r.checkOk) r.issues.push('The check digit should be "' + r.expected + '" but is "' + g.charAt(14) + '". There is probably a typing mistake.');
    r.ok = r.issues.length === 0;
    return r;
  };

  function on(root, fn) { root.addEventListener('input', fn); root.addEventListener('change', fn); fn(); }
  function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }
  function radio(root, name) { var r = root.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
  function setHTML(id, h) { var el = document.getElementById(id); if (el) el.innerHTML = h; }
  function rows(list) { return list.map(function (r) { return '<div class="res"><span class="res-k">' + r[0] + '</span><span class="res-v">' + r[1] + '</span></div>'; }).join(''); }
  function pct(n) { return (Math.round(n * 100) / 100).toLocaleString('en-IN') + '%'; }
  function chipGroup(root, sel, cb) {
    $$(sel, root).forEach(function (c) {
      c.addEventListener('click', function () { $$(sel, root).forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); }); cb(c.getAttribute('data-v')); });
    });
  }
  $$('[data-copy-from]').forEach(function (b) { b.addEventListener('click', function () { var s = document.getElementById(b.getAttribute('data-copy-from')); if (s) BK.copy(s.textContent.trim()); }); });

  var tools = {
    gst: function (root) {
      var rate = 18;
      chipGroup(root, '.chip[data-v]', function (v) { rate = +v; $('#g-custom').value = ''; calc(); });
      function calc() {
        var amt = num(val('g-amt')), qty = num(val('g-qty')) || 1, mode = radio(root, 'g-mode'), inter = radio(root, 'g-supply') === 'inter';
        var custom = val('g-custom'); var r = custom !== '' ? num(custom) : rate;
        if (custom !== '') $$('.chip[data-v]', root).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        var gross = amt * qty, base, tax;
        if (mode === 'remove') { base = gross / (1 + r / 100); tax = gross - base; } else { base = gross; tax = gross * r / 100; }
        var total = base + tax;
        setHTML('g-big', fmt2(total)); setHTML('g-big-l', mode === 'remove' ? 'Price including GST' : 'Total including GST');
        var split = inter ? [['IGST @ ' + pct(r), fmt2(tax)]] : [['CGST @ ' + pct(r / 2), fmt2(tax / 2)], ['SGST/UTGST @ ' + pct(r / 2), fmt2(tax / 2)]];
        setHTML('g-out', rows([['Taxable value (before GST)', fmt2(base)]].concat(split).concat([['Total GST', fmt2(tax)], ['Total amount', fmt2(total)]]).concat(qty > 1 ? [['Per unit before GST', fmt2(base / qty)], ['Per unit with GST', fmt2(total / qty)]] : [])));
        setHTML('g-sum', 'Taxable value ' + fmt2(base) + ' + GST ' + fmt2(tax) + ' at ' + pct(r) + (inter ? ' (IGST)' : ' (CGST ' + fmt2(tax / 2) + ' + SGST ' + fmt2(tax / 2) + ')') + ' = ' + fmt2(total));
      }
      on(root, calc);
    },

    emi: function (root) {
      var view = 'year';
      chipGroup(root, '.chip[data-v]', function (v) { view = v; calc(); });
      function schedule(P, r, n, emi) {
        var out = [], bal = P;
        for (var i = 1; i <= n; i++) { var int = bal * r, pr = Math.min(emi - int, bal); if (r === 0) pr = Math.min(emi, bal); bal = Math.max(0, bal - pr); out.push({ i: i, int: int, pr: pr, bal: bal }); }
        return out;
      }
      var last = null;
      function calc() {
        var P = num(val('e-p')), ann = num(val('e-r')), tn = num(val('e-t')), unit = radio(root, 'e-unit');
        var n = Math.round(unit === 'months' ? tn : tn * 12), r = ann / 12 / 100;
        if (!(P > 0) || !(n > 0)) { setHTML('e-big', '—'); setHTML('e-out', ''); setHTML('e-table', ''); return; }
        var emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        var total = emi * n, interest = total - P;
        setHTML('e-big', fmt(Math.round(emi)));
        setHTML('e-out', rows([['Loan amount', fmt(P)], ['Total interest', fmt(Math.round(interest))], ['Total payment', fmt(Math.round(total))], ['Tenure', n + ' months'], ['Interest as share of total', pct(interest / total * 100)]]));
        var pp = P / total * 100;
        setHTML('e-bar', '<div class="bar"><i style="width:' + pp + '%;background:var(--ink)"></i><i style="width:' + (100 - pp) + '%;background:var(--red)"></i></div><div class="legend"><span><b style="background:var(--ink)"></b>Principal ' + pct(pp) + '</span><span><b style="background:var(--red)"></b>Interest ' + pct(100 - pp) + '</span></div>');
        var s = schedule(P, r, n, emi); last = s;
        var start = val('e-start') ? BK.parseISO(val('e-start') + '-01') : null;
        var label = function (i) { if (!start) return (view === 'year' ? 'Year ' : 'Month ') + i; var d = new Date(start.getFullYear(), start.getMonth() + i - 1, 1); return BK.MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
        var body;
        if (view === 'year') {
          var yrs = [];
          s.forEach(function (x) { var y = Math.ceil(x.i / 12); if (!yrs[y]) yrs[y] = { i: y, int: 0, pr: 0, bal: 0 }; yrs[y].int += x.int; yrs[y].pr += x.pr; yrs[y].bal = x.bal; });
          body = yrs.filter(Boolean).map(function (y) { return '<tr><td>Year ' + y.i + '</td><td class="num">' + fmt(Math.round(y.pr)) + '</td><td class="num">' + fmt(Math.round(y.int)) + '</td><td class="num">' + fmt(Math.round(y.pr + y.int)) + '</td><td class="num">' + fmt(Math.round(y.bal)) + '</td></tr>'; }).join('');
        } else {
          body = s.map(function (x) { return '<tr><td>' + label(x.i) + '</td><td class="num">' + fmt(Math.round(x.pr)) + '</td><td class="num">' + fmt(Math.round(x.int)) + '</td><td class="num">' + fmt(Math.round(emi)) + '</td><td class="num">' + fmt(Math.round(x.bal)) + '</td></tr>'; }).join('');
        }
        setHTML('e-table', '<div class="tbl-wrap"><table class="table"><thead><tr><th>' + (view === 'year' ? 'Year' : 'Month') + '</th><th class="num">Principal</th><th class="num">Interest</th><th class="num">Payment</th><th class="num">Balance</th></tr></thead><tbody>' + body + '</tbody></table></div>');
      }
      var dl = $('#e-csv'); if (dl) dl.addEventListener('click', function () {
        if (!last) return; var rowsC = [['Month', 'Principal', 'Interest', 'Balance']];
        last.forEach(function (x) { rowsC.push([x.i, x.pr.toFixed(2), x.int.toFixed(2), x.bal.toFixed(2)]); });
        BK.download('emi-schedule.csv', BK.csv(rowsC), 'text/csv');
      });
      on(root, calc);
    },

    interest: function (root) {
      function calc() {
        var P = num(val('i-p')), rtype = radio(root, 'i-rtype'), rv = num(val('i-r')), kind = radio(root, 'i-kind'), period = radio(root, 'i-period');
        var annual = rtype === 'per100' ? rv * 12 : rv;
        $$('[data-period]', root).forEach(function (el) { el.hidden = el.getAttribute('data-period') !== period; });
        $('#i-comp-wrap').hidden = kind !== 'compound';
        var days, years;
        if (period === 'dates') {
          var a = val('i-from'), b = val('i-to');
          if (!a || !b) { setHTML('i-big', '—'); setHTML('i-out', '<p class="muted">Choose both dates.</p>'); return; }
          days = Math.round((BK.parseISO(b) - BK.parseISO(a)) / 864e5);
          if (days < 0) { setHTML('i-big', '—'); setHTML('i-out', '<p class="muted">The end date is before the start date.</p>'); return; }
          years = days / 365;
        } else {
          var y = num(val('i-y')), m = num(val('i-m')), d = num(val('i-d'));
          years = y + m / 12 + d / 365; days = Math.round(years * 365);
        }
        var interest, eff = annual;
        if (kind === 'compound') {
          var n = +val('i-comp') || 12;
          var A = P * Math.pow(1 + annual / 100 / n, n * years); interest = A - P;
          eff = (Math.pow(1 + annual / 100 / n, n) - 1) * 100;
        } else interest = P * annual / 100 * years;
        setHTML('i-big', fmt2(interest));
        var monthly100 = annual / 12;
        setHTML('i-out', rows([['Principal (mool)', fmt2(P)], ['Interest (byaj)', fmt2(interest)], ['Total to repay', fmt2(P + interest)], ['Period', days.toLocaleString('en-IN') + ' days (' + (Math.round(years * 100) / 100) + ' years)'], ['Rate per year', pct(annual)], ['Same rate per ₹100 per month', '₹' + (Math.round(monthly100 * 100) / 100)]].concat(kind === 'compound' ? [['Effective annual rate', pct(eff)]] : [])));
      }
      var to = $('#i-to'); if (to && !to.value) to.value = BK.iso(new Date());
      on(root, calc);
    },

    margin: function (root) {
      function calc() {
        var mode = radio(root, 'm-mode'), cost = num(val('m-cost')), x = num(val('m-x')), g = num(val('m-gst'));
        var labels = { price: 'Selling price (before GST)', margin: 'Target margin (%)', markup: 'Markup on cost (%)' };
        setHTML('m-x-l', labels[mode]);
        var price;
        if (mode === 'price') price = x;
        else if (mode === 'margin') price = x >= 100 ? NaN : cost / (1 - x / 100);
        else price = cost * (1 + x / 100);
        if (!(price > 0) || !(cost >= 0)) { setHTML('m-big', '—'); setHTML('m-out', '<p class="muted">Enter a cost and a valid ' + labels[mode].toLowerCase() + '.</p>'); return; }
        var profit = price - cost, margin = profit / price * 100, markup = cost > 0 ? profit / cost * 100 : 0;
        setHTML('m-big', pct(margin)); setHTML('m-big-l', 'Gross margin on selling price');
        setHTML('m-out', rows([['Cost price', fmt2(cost)], ['Selling price (before GST)', fmt2(price)], ['Profit per unit', fmt2(profit)], ['Margin (on price)', pct(margin)], ['Markup (on cost)', cost > 0 ? pct(markup) : '—']].concat(g ? [['GST @ ' + pct(g), fmt2(price * g / 100)], ['Price to charge with GST', fmt2(price * (1 + g / 100))]] : [])));
      }
      on(root, calc);
    },

    breakeven: function (root) {
      function calc() {
        var F = num(val('b-fixed')), v = num(val('b-var')), p = num(val('b-price')), exp = num(val('b-exp'));
        var c = p - v;
        if (!(p > 0) || c <= 0) { setHTML('b-big', '—'); setHTML('b-out', '<p class="muted">' + (p > 0 ? 'The selling price must be higher than the variable cost per unit, or you lose money on every sale.' : 'Enter your selling price per unit.') + '</p>'); return; }
        var units = F / c, sales = units * p, cm = c / p * 100;
        setHTML('b-big', Math.ceil(units).toLocaleString('en-IN') + ' units');
        var list = [['Contribution per unit', fmt2(c)], ['Contribution margin', pct(cm)], ['Break-even units', Math.ceil(units).toLocaleString('en-IN')], ['Break-even sales', fmt(Math.round(sales))]];
        if (exp > 0) { var prof = exp * c - F, mos = (exp - units) / exp * 100; list.push(['Profit at ' + exp.toLocaleString('en-IN') + ' units', '<span class="' + (prof >= 0 ? 'pos' : 'neg') + '">' + fmt(Math.round(prof)) + '</span>'], ['Margin of safety', exp > units ? pct(mos) : 'Below break-even']); }
        setHTML('b-out', rows(list));
        setHTML('b-day', 'That is about <strong>' + Math.ceil(units / 26).toLocaleString('en-IN') + ' units a day</strong> over 26 working days, or ' + fmt(Math.round(sales / 26)) + ' of sales a day.');
      }
      on(root, calc);
    },

    discount: function (root) {
      function calc() {
        var price = num(val('d-price')), d1 = num(val('d-1')), d2 = num(val('d-2')), flat = num(val('d-flat')), cost = num(val('d-cost')), q = num(val('d-qty')) || 1;
        var after1 = price * (1 - d1 / 100), after2 = after1 * (1 - d2 / 100), final = Math.max(0, after2 - flat);
        var save = price - final, eff = price ? save / price * 100 : 0;
        setHTML('d-big', fmt2(final * q)); setHTML('d-big-l', q > 1 ? 'You pay for ' + q + ' units' : 'Final price');
        var list = [['Original price', fmt2(price)], ['After ' + pct(d1) + ' discount', fmt2(after1)]];
        if (d2) list.push(['After further ' + pct(d2), fmt2(after2)]);
        if (flat) list.push(['After flat ₹' + flat + ' off', fmt2(final)]);
        list.push(['You save', fmt2(save * q)], ['Effective discount', pct(eff)]);
        if (d1 && d2) list.push(['Note', pct(d1) + ' + ' + pct(d2) + ' is ' + pct(eff) + ', not ' + pct(d1 + d2)]);
        if (cost > 0 && price > 0) {
          var m0 = (price - cost) / price * 100, m1 = final > 0 ? (final - cost) / final * 100 : -100, p0 = price - cost, p1 = final - cost;
          list.push(['Seller margin before', pct(m0)], ['Seller margin after', '<span class="' + (m1 >= 0 ? '' : 'neg') + '">' + pct(m1) + '</span>']);
          if (p1 > 0) list.push(['Extra sales (₹) needed for the same profit', pct((p0 / p1 * final / price - 1) * 100)]);
          else list.push(['Profit per unit after discount', '<span class="neg">' + fmt2(p1) + ' (a loss)</span>']);
        }
        setHTML('d-out', rows(list));
      }
      on(root, calc);
    },

    words: function (root) {
      function calc() {
        var a = num(val('w-amt')), sys = radio(root, 'w-sys'), style = radio(root, 'w-style');
        var opts = { system: sys };
        if (style === 'plain') { opts.major = ''; opts.minor = ''; opts.only = false; }
        var w = BK.words(a, opts);
        setHTML('w-out', esc(style === 'cheque' ? w.replace(/^Rupees /, 'Rupees ') : w));
        var inF = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(a), usF = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(a);
        setHTML('w-fig', rows([['Indian grouping', '₹' + inF], ['International grouping', usF], ['In lakh', (a / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 4 }) + ' lakh'], ['In crore', (a / 1e7).toLocaleString('en-IN', { maximumFractionDigits: 6 }) + ' crore']]));
      }
      on(root, calc);
    },

    gstin: function (root) {
      function calc() {
        var g = val('v-in');
        if (!g.trim()) { setHTML('v-big', '—'); setHTML('v-out', '<p class="muted">Type or paste a 15-character GSTIN.</p>'); return; }
        var r = BK.gstinInfo(g);
        setHTML('v-big', r.ok ? '<span class="pos">Format valid</span>' : '<span class="neg">Not valid</span>');
        var list = [];
        if (r.state) list.push(['State', esc(r.stateCode + ' · ' + r.state)]);
        if (r.pan) list.push(['PAN', esc(r.pan)]);
        if (r.panType) list.push(['Entity type (from PAN)', esc(r.panType)]);
        if (r.entity) list.push(['Registration number in this state', esc(r.entity)]);
        if (r.expected) list.push(['Check digit', r.checkOk ? '<span class="pos">' + esc(r.expected) + ' matches</span>' : '<span class="neg">expected ' + esc(r.expected) + '</span>']);
        setHTML('v-out', rows(list) + (r.issues.length ? '<ul class="mt1">' + r.issues.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="small muted mt1">A valid format does not prove the registration is active. Confirm status on the official GST portal\'s "Search Taxpayer" page before billing.</p>'));
      }
      var bulk = $('#v-bulk-go');
      if (bulk) bulk.addEventListener('click', function () {
        var list = val('v-bulk').split(/[\s,;]+/).filter(Boolean).slice(0, 200);
        setHTML('v-bulk-out', list.length ? '<div class="tbl-wrap"><table class="table"><thead><tr><th>GSTIN</th><th>Result</th><th>State</th></tr></thead><tbody>' + list.map(function (g) { var r = BK.gstinInfo(g); return '<tr><td>' + esc(r.gstin) + '</td><td class="' + (r.ok ? 'pos' : 'neg') + '">' + (r.ok ? 'Valid format' : 'Check: ' + esc(r.issues[0] || '')) + '</td><td>' + esc(r.state || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '');
      });
      on(root, calc);
    },

    calendar: function (root) {
      var current = [];
      function calc() {
        var days = +val('c-range') || 90, keep = $$('input[name="c-who"]:checked', root).map(function (c) { return c.value; });
        current = BK.dueDates(new Date(), days).filter(function (e) { return keep.indexOf(e.tag) >= 0; });
        if (!current.length) { setHTML('c-list', '<div class="empty">No dates for the chosen filters in this period.</div>'); return; }
        var html = '', month = '';
        current.forEach(function (e) {
          var m = BK.MONTHS[e.date.getMonth()] + ' ' + e.date.getFullYear();
          if (m !== month) { if (month) html += '</ul>'; html += '<h3 class="mt2">' + m + '</h3><ul class="dates">'; month = m; }
          var d0 = BK.iso(e.date).replace(/-/g, ''), d1n = new Date(e.date); d1n.setDate(d1n.getDate() + 1);
          var gc = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(e.title) + '&dates=' + d0 + '/' + BK.iso(d1n).replace(/-/g, '') + '&details=' + encodeURIComponent(e.who + '. Statutory due date; confirm on the official portal. From BahiKhata.com');
          html += '<li><div class="d"><b>' + e.date.getDate() + '</b><span>' + BK.MONTHS[e.date.getMonth()].slice(0, 3) + '</span></div><div><strong>' + esc(e.title) + '</strong><small>' + esc(e.who) + ' · <a href="' + gc + '" target="_blank" rel="noopener">Add to Google Calendar</a></small></div></li>';
        });
        setHTML('c-list', html + '</ul>');
      }
      var ics = $('#c-ics'); if (ics) ics.addEventListener('click', function () {
        var stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BahiKhata.com//Due dates//EN', 'CALSCALE:GREGORIAN'];
        current.forEach(function (e, i) {
          var d0 = BK.iso(e.date).replace(/-/g, ''), n = new Date(e.date); n.setDate(n.getDate() + 1);
          lines.push('BEGIN:VEVENT', 'UID:bk-' + d0 + '-' + i + '@bahikhata.com', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d0, 'DTEND;VALUE=DATE:' + BK.iso(n).replace(/-/g, ''), 'SUMMARY:' + e.title.replace(/[,;]/g, ' '), 'DESCRIPTION:' + e.who.replace(/[,;]/g, ' ') + '. Confirm on the official portal.', 'BEGIN:VALARM', 'TRIGGER:-P2D', 'ACTION:DISPLAY', 'DESCRIPTION:' + e.title.replace(/[,;]/g, ' '), 'END:VALARM', 'END:VEVENT');
        });
        lines.push('END:VCALENDAR');
        BK.download('bahikhata-due-dates.ics', lines.join('\r\n'), 'text/calendar');
      });
      on(root, calc);
    }
  };

  $$('[data-tool]').forEach(function (root) { var fn = tools[root.getAttribute('data-tool')]; if (fn) fn(root); });
})();
