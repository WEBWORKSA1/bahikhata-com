/* BahiKhata digital khata — runs fully in the browser; data stays in localStorage on this device. */
(function () {
  'use strict';
  var BK = window.BK; if (!BK) return;
  var $ = BK.$, $$ = BK.$$, esc = BK.esc;
  var host = $('#kapp'); if (!host) return;
  var KEY = 'bk-khata-v1';

  /* ---------- language ---------- */
  var T = {
    en: {
      get: 'You will get', give: 'You will give', cash: 'Cash in hand', net: 'Net balance', parties: 'Parties',
      customers: 'Customers', suppliers: 'Suppliers', cashbook: 'Cash book', reports: 'Reports', settings: 'Settings',
      search: 'Search by name or mobile', addCustomer: 'Add customer', addSupplier: 'Add supplier', sortRecent: 'Recent activity', sortHigh: 'Highest balance', sortName: 'Name A–Z', sortOld: 'Oldest dues',
      emptyC: 'No customers yet. Add the first person who buys from you on credit.', emptyS: 'No suppliers yet. Add the people you buy from on credit.', sample: 'Load sample data to explore',
      noMatch: 'No one matches your search.', back: 'Back', gave: 'You gave', got: 'You got', gaveTo: 'You gave to', gotFrom: 'You got from',
      remind: 'Remind on WhatsApp', sms: 'Send SMS', shareBal: 'Share balance', statement: 'Share statement', print: 'Print statement', edit: 'Edit', del: 'Delete',
      date: 'Date', details: 'Details', balance: 'Balance', noEntries: 'No entries yet. Use the buttons above to record udhaar or a payment.',
      amount: 'Amount (₹)', note: 'Note', notePh: 'Items, bill number or reference', mode: 'Paid by', due: 'Due date (optional)', bill: 'Bill no. (optional)',
      addToCash: 'Also record in cash book', save: 'Save', cancel: 'Cancel', name: 'Name', mobile: 'Mobile number', type: 'Type', customer: 'Customer', supplier: 'Supplier',
      opening: 'Opening balance (₹)', theyOwe: 'They owe me', iOwe: 'I owe them', notes: 'Notes', limit: 'Credit limit (₹, optional)', newParty: 'New party', editParty: 'Edit party',
      settled: 'Settled', owesYou: 'owes you', youOwe: 'you owe', lastEntry: 'Last entry', noActivity: 'No entries',
      cashIn: 'Cash in', cashOut: 'Cash out', openingCash: 'Opening cash', closingCash: 'Closing cash', today: 'Today', monthIn: 'Month cash in', monthOut: 'Month cash out',
      noCash: 'No cash entries on this day.', category: 'Category', setOpening: 'Set starting cash',
      cats: ['Sales', 'Payment received', 'Purchase', 'Payment to supplier', 'Rent', 'Salary and wages', 'Electricity and phone', 'Transport', 'Tea and refreshments', 'Owner withdrawal', 'Bank deposit', 'Bank withdrawal', 'Other'],
      modes: ['Cash', 'UPI', 'Bank transfer', 'Cheque', 'Card', 'Goods', 'Other'],
      ageing: 'Udhaar by age', top: 'Biggest balances to collect', trend: 'Cash in and out, last 6 months', exportT: 'Export and print',
      expParties: 'Parties (CSV)', expEntries: 'All entries (CSV)', expCash: 'Cash book (CSV)', printReport: 'Print full report', overdue: 'Overdue (past due date)',
      bizName: 'Business name', bizPhone: 'Business mobile', upi: 'UPI ID for payments', lang: 'Language', tagLine: 'Add "Sent with BahiKhata.com" to reminders',
      books: 'Books', newBook: 'New book', rename: 'Rename book', delBook: 'Delete this book', backup: 'Download backup', restore: 'Restore from backup', lastBackup: 'Last backup',
      never: 'never', wipe: 'Delete all khata data on this device', install: 'Install as app', saved: 'Saved', deleted: 'Deleted',
      confirmDelEntry: 'Delete this entry?', confirmDelParty: 'Delete this party and all their entries?', confirmWipe: 'This deletes every book on this device. Type DELETE to confirm.',
      restored: 'Backup restored', badFile: 'That file is not a BahiKhata backup.', backupHint: 'Back up your khata so you never lose it.', saveFail: 'Could not save. Your browser storage may be full or blocked.',
      remMsg: 'Namaste {name}, a reminder from {biz}: your pending balance is {amt} as of {date}.{upi} Thank you!', remUpi: ' Pay by UPI to {upi}.',
      balMsg: 'Hello {name}, as per my records the balance between us is {amt} ({who}) as of {date}.', tag: '\n— Sent with BahiKhata.com, the free digital khata',
      stmt: 'Statement for {name} from {biz}', mine: 'My business', overLimit: 'Over credit limit', bucket: ['0–30 days', '31–60 days', '61–90 days', 'Over 90 days'],
      cashAuto: 'From khata', profile: 'Business profile', data: 'Your data', dataNote: 'Entries are stored only in this browser on this device. Download a backup every week and keep it safe.',
      sampleBook: 'Sample shop', youWillGet: 'you will get', youWillGive: 'you will give'
    },
    hi: {
      get: 'आपको मिलेंगे', give: 'आपको देने हैं', cash: 'हाथ में नकद', net: 'कुल बाकी', parties: 'पार्टी',
      customers: 'ग्राहक', suppliers: 'सप्लायर', cashbook: 'रोकड़ बही', reports: 'रिपोर्ट', settings: 'सेटिंग',
      search: 'नाम या मोबाइल से खोजें', addCustomer: 'ग्राहक जोड़ें', addSupplier: 'सप्लायर जोड़ें', sortRecent: 'हाल की एंट्री', sortHigh: 'सबसे ज़्यादा बाकी', sortName: 'नाम (अ–ज्ञ)', sortOld: 'सबसे पुराना बकाया',
      emptyC: 'अभी कोई ग्राहक नहीं। उधार लेने वाले पहले ग्राहक को जोड़ें।', emptyS: 'अभी कोई सप्लायर नहीं। जिनसे उधार माल लेते हैं, उन्हें जोड़ें।', sample: 'देखने के लिए नमूना डेटा लोड करें',
      noMatch: 'खोज से कोई नहीं मिला।', back: 'वापस', gave: 'आपने दिए', got: 'आपको मिले', gaveTo: 'आपने दिए', gotFrom: 'आपको मिले',
      remind: 'WhatsApp पर याद दिलाएँ', sms: 'SMS भेजें', shareBal: 'बाकी शेयर करें', statement: 'खाता विवरण शेयर करें', print: 'विवरण प्रिंट करें', edit: 'बदलें', del: 'हटाएँ',
      date: 'तारीख', details: 'विवरण', balance: 'बाकी', noEntries: 'अभी कोई एंट्री नहीं। उधार या भुगतान दर्ज करने के लिए ऊपर के बटन दबाएँ।',
      amount: 'रकम (₹)', note: 'नोट', notePh: 'सामान, बिल नंबर या संदर्भ', mode: 'भुगतान का तरीका', due: 'देय तारीख (वैकल्पिक)', bill: 'बिल नं. (वैकल्पिक)',
      addToCash: 'रोकड़ बही में भी दर्ज करें', save: 'सेव करें', cancel: 'रद्द करें', name: 'नाम', mobile: 'मोबाइल नंबर', type: 'प्रकार', customer: 'ग्राहक', supplier: 'सप्लायर',
      opening: 'शुरुआती बाकी (₹)', theyOwe: 'इन्हें मुझे देना है', iOwe: 'मुझे इन्हें देना है', notes: 'नोट्स', limit: 'उधार सीमा (₹, वैकल्पिक)', newParty: 'नई पार्टी', editParty: 'पार्टी बदलें',
      settled: 'हिसाब बराबर', owesYou: 'आपको देंगे', youOwe: 'आपको देना है', lastEntry: 'आखिरी एंट्री', noActivity: 'कोई एंट्री नहीं',
      cashIn: 'नकद आया', cashOut: 'नकद गया', openingCash: 'शुरुआती नकद', closingCash: 'अंतिम नकद', today: 'आज', monthIn: 'महीने में आया', monthOut: 'महीने में गया',
      noCash: 'इस दिन कोई नकद एंट्री नहीं।', category: 'श्रेणी', setOpening: 'शुरुआती नकद सेट करें',
      cats: ['बिक्री', 'भुगतान मिला', 'खरीद', 'सप्लायर को भुगतान', 'किराया', 'वेतन और मज़दूरी', 'बिजली और फ़ोन', 'भाड़ा', 'चाय-नाश्ता', 'मालिक ने निकाला', 'बैंक में जमा', 'बैंक से निकाला', 'अन्य'],
      modes: ['नकद', 'UPI', 'बैंक ट्रांसफ़र', 'चेक', 'कार्ड', 'माल', 'अन्य'],
      ageing: 'उधार कितना पुराना', top: 'सबसे बड़े बकाये', trend: 'पिछले 6 महीने नकद आया और गया', exportT: 'एक्सपोर्ट और प्रिंट',
      expParties: 'पार्टी सूची (CSV)', expEntries: 'सभी एंट्री (CSV)', expCash: 'रोकड़ बही (CSV)', printReport: 'पूरी रिपोर्ट प्रिंट करें', overdue: 'देय तारीख निकल चुकी',
      bizName: 'दुकान/व्यापार का नाम', bizPhone: 'व्यापार मोबाइल', upi: 'भुगतान के लिए UPI ID', lang: 'भाषा', tagLine: 'रिमाइंडर में "BahiKhata.com से भेजा" जोड़ें',
      books: 'बहियाँ', newBook: 'नई बही', rename: 'बही का नाम बदलें', delBook: 'यह बही हटाएँ', backup: 'बैकअप डाउनलोड करें', restore: 'बैकअप से वापस लाएँ', lastBackup: 'आखिरी बैकअप',
      never: 'कभी नहीं', wipe: 'इस डिवाइस का सारा खाता डेटा हटाएँ', install: 'ऐप की तरह इंस्टॉल करें', saved: 'सेव हो गया', deleted: 'हटा दिया',
      confirmDelEntry: 'यह एंट्री हटाएँ?', confirmDelParty: 'यह पार्टी और उसकी सारी एंट्री हटाएँ?', confirmWipe: 'इससे इस डिवाइस की सारी बहियाँ हट जाएँगी। पुष्टि के लिए DELETE लिखें।',
      restored: 'बैकअप वापस आ गया', badFile: 'यह BahiKhata बैकअप फ़ाइल नहीं है।', backupHint: 'अपना खाता सुरक्षित रखने के लिए बैकअप लें।', saveFail: 'सेव नहीं हो सका। ब्राउज़र स्टोरेज भरा या बंद हो सकता है।',
      remMsg: 'नमस्ते {name}, {biz} की ओर से याद दिलाना: {date} तक आपका बकाया {amt} है।{upi} धन्यवाद!', remUpi: ' UPI से भुगतान करें: {upi}।',
      balMsg: 'नमस्ते {name}, मेरे रिकॉर्ड के अनुसार {date} तक हमारे बीच बाकी {amt} ({who}) है।', tag: '\n— BahiKhata.com से भेजा गया, मुफ़्त डिजिटल खाता',
      stmt: '{biz} की ओर से {name} का खाता विवरण', mine: 'मेरा व्यापार', overLimit: 'उधार सीमा से ज़्यादा', bucket: ['0–30 दिन', '31–60 दिन', '61–90 दिन', '90 दिन से ज़्यादा'],
      cashAuto: 'खाते से', profile: 'व्यापार की जानकारी', data: 'आपका डेटा', dataNote: 'एंट्री सिर्फ़ इसी डिवाइस के इस ब्राउज़र में सेव होती हैं। हर हफ़्ते बैकअप डाउनलोड करके सुरक्षित रखें।',
      sampleBook: 'नमूना दुकान', youWillGet: 'आपको मिलेंगे', youWillGive: 'आपको देने हैं'
    }
  };

  /* ---------- state ---------- */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function todayISO() { return BK.iso(new Date()); }
  function newBook(name) { return { name: name, phone: '', upi: '', parties: [], entries: [], cash: [], cashOpen: 0, created: Date.now() }; }
  function fresh() {
    var id = uid(), lang = /^hi/i.test(navigator.language || '') ? 'hi' : 'en', books = {};
    books[id] = newBook(T[lang].mine);
    return { v: 1, active: id, lang: lang, tag: true, lastBackup: 0, books: books };
  }
  var S = BK.store.get(KEY, null);
  if (!S || !S.books || !S.books[S.active]) S = fresh();
  var ui = { tab: 'customers', party: null, q: '', sort: 'recent', cashDate: todayISO() };
  function t(k) { return (T[S.lang] || T.en)[k] || T.en[k] || k; }
  function B() { return S.books[S.active]; }
  function save() { if (!BK.store.set(KEY, S)) BK.toast(t('saveFail')); }
  function fill(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k] == null ? '' : o[k]; }); }

  /* ---------- calculations ---------- */
  function partyEntries(pid) {
    return B().entries.filter(function (e) { return e.pid === pid; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : a.c - b.c; });
  }
  function balance(pid) { return B().entries.reduce(function (s, e) { return e.pid === pid ? s + (e.type === 'gave' ? e.amt : -e.amt) : s; }, 0); }
  function lastDate(pid) { var l = ''; B().entries.forEach(function (e) { if (e.pid === pid && e.date > l) l = e.date; }); return l; }
  function totals() {
    var get = 0, give = 0;
    B().parties.forEach(function (p) { var b = balance(p.id); if (b > 0) get += b; else give -= b; });
    return { get: get, give: give };
  }
  function cashBefore(date) { var s = +B().cashOpen || 0; B().cash.forEach(function (c) { if (c.date < date) s += c.dir === 'in' ? c.amt : -c.amt; }); return s; }
  function cashUpTo(date) { var s = +B().cashOpen || 0; B().cash.forEach(function (c) { if (c.date <= date) s += c.dir === 'in' ? c.amt : -c.amt; }); return s; }
  function unpaidLots(pid) { // FIFO: payments clear the oldest udhaar first
    var lots = [], credit = 0;
    partyEntries(pid).forEach(function (e) {
      if (e.type === 'gave') {
        var a = e.amt; if (credit > 0) { var u = Math.min(credit, a); a -= u; credit -= u; }
        if (a > 0) lots.push({ amt: a, date: e.date, due: e.due });
      } else {
        var r = e.amt;
        while (r > 0 && lots.length) { var u2 = Math.min(r, lots[0].amt); lots[0].amt -= u2; r -= u2; if (lots[0].amt <= 0.0001) lots.shift(); }
        credit += r;
      }
    });
    return lots;
  }
  function daysSince(iso) { return Math.floor((BK.parseISO(todayISO()) - BK.parseISO(iso)) / 864e5); }

  /* ---------- rendering ---------- */
  function money(n) { return BK.fmt(Math.abs(n)); }
  function balHTML(b) {
    if (Math.abs(b) < 0.005) return '<div class="pbal zero">' + money(0) + '<small>' + t('settled') + '</small></div>';
    return '<div class="pbal ' + (b > 0 ? 'pos' : 'neg') + '">' + money(b) + '<small>' + (b > 0 ? t('youWillGet') : t('youWillGive')) + '</small></div>';
  }
  function render() {
    document.documentElement.lang = S.lang === 'hi' ? 'hi' : 'en-IN';
    var tot = totals(), b = B();
    var books = Object.keys(S.books).map(function (id) { return '<option value="' + id + '"' + (id === S.active ? ' selected' : '') + '>' + esc(S.books[id].name) + '</option>'; }).join('');
    var tabs = ['customers', 'suppliers', 'cashbook', 'reports', 'settings'];
    host.innerHTML =
      '<div class="kbar"><label class="sr" for="k-book">' + t('books') + '</label><select id="k-book">' + books + '<option value="__new">+ ' + t('newBook') + '</option></select>' +
      '<span class="grow"></span>' +
      (deferredPrompt ? '<button class="btn btn-line btn-sm" data-act="install">' + t('install') + '</button>' : '') +
      '<button class="btn btn-line btn-sm" data-act="lang" aria-label="Change language">' + (S.lang === 'hi' ? 'English' : 'हिंदी') + '</button>' +
      '<button class="btn btn-line btn-sm" data-act="backup">' + t('backup') + '</button></div>' +
      '<div class="ksum"><div class="get"><span>' + t('get') + '</span><b>' + money(tot.get) + '</b></div><div class="give"><span>' + t('give') + '</span><b>' + money(tot.give) + '</b></div>' +
      '<div><span>' + t('cash') + '</span><b>' + BK.fmt(cashUpTo(todayISO())) + '</b></div><div><span>' + t('parties') + '</span><b>' + b.parties.length + '</b></div></div>' +
      '<div class="ktabs" role="tablist">' + tabs.map(function (k) { return '<button role="tab" data-tab="' + k + '" aria-selected="' + (ui.tab === k) + '">' + t(k) + '</button>'; }).join('') + '</div>' +
      '<div class="kpanel" role="tabpanel">' + panel() + '</div>' +
      '<div class="kfoot">' + footHint() + '</div>';
    var sel = $('#k-book', host); sel.addEventListener('change', onBook);
    var q = $('#k-q', host); if (q) { q.addEventListener('input', function () { ui.q = q.value; var pos = q.selectionStart; renderPanel(); var n = $('#k-q', host); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } }); }
    var so = $('#k-sort', host); if (so) so.addEventListener('change', function () { ui.sort = so.value; renderPanel(); });
    bindPanel();
  }
  function renderPanel() { $('.kpanel', host).innerHTML = panel(); var q = $('#k-q', host); if (q) { q.addEventListener('input', function () { ui.q = q.value; var pos = q.selectionStart; renderPanel(); var n = $('#k-q', host); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } }); } var so = $('#k-sort', host); if (so) so.addEventListener('change', function () { ui.sort = so.value; renderPanel(); }); bindPanel(); }
  function footHint() {
    var last = S.lastBackup ? BK.niceDate(new Date(S.lastBackup)) : t('never');
    var stale = !S.lastBackup || (Date.now() - S.lastBackup) > 7 * 864e5;
    return '<span>' + t('lastBackup') + ': <strong>' + last + '</strong>' + (stale && B().entries.length ? ' · ' + t('backupHint') : '') + '</span><button class="btn btn-sm ' + (stale && B().entries.length ? 'btn-gold' : 'btn-line') + '" data-act="backup">' + t('backup') + '</button>';
  }
  function panel() {
    if ((ui.tab === 'customers' || ui.tab === 'suppliers') && ui.party) return partyView();
    if (ui.tab === 'customers' || ui.tab === 'suppliers') return listView(ui.tab === 'customers' ? 'customer' : 'supplier');
    if (ui.tab === 'cashbook') return cashView();
    if (ui.tab === 'reports') return reportView();
    return settingsView();
  }
  function listView(type) {
    var b = B(), q = ui.q.trim().toLowerCase();
    var list = b.parties.filter(function (p) { return p.type === type; });
    var total = list.length;
    if (q) list = list.filter(function (p) { return p.name.toLowerCase().indexOf(q) >= 0 || (p.phone || '').indexOf(q) >= 0; });
    var rows = list.map(function (p) { return { p: p, b: balance(p.id), l: lastDate(p.id), lots: ui.sort === 'old' ? unpaidLots(p.id) : null }; });
    rows.sort(function (x, y) {
      if (ui.sort === 'high') return Math.abs(y.b) - Math.abs(x.b);
      if (ui.sort === 'name') return x.p.name.localeCompare(y.p.name);
      if (ui.sort === 'old') { var xo = x.lots.length ? x.lots[0].date : '9999', yo = y.lots.length ? y.lots[0].date : '9999'; return xo < yo ? -1 : xo > yo ? 1 : 0; }
      return (y.l || '') < (x.l || '') ? -1 : (y.l || '') > (x.l || '') ? 1 : (y.p.c || 0) - (x.p.c || 0);
    });
    var tools = '<div class="ktools"><label class="sr" for="k-q">' + t('search') + '</label><input type="search" id="k-q" placeholder="' + t('search') + '" value="' + esc(ui.q) + '">' +
      '<label class="sr" for="k-sort">Sort</label><select id="k-sort"><option value="recent"' + (ui.sort === 'recent' ? ' selected' : '') + '>' + t('sortRecent') + '</option><option value="high"' + (ui.sort === 'high' ? ' selected' : '') + '>' + t('sortHigh') + '</option><option value="old"' + (ui.sort === 'old' ? ' selected' : '') + '>' + t('sortOld') + '</option><option value="name"' + (ui.sort === 'name' ? ' selected' : '') + '>' + t('sortName') + '</option></select>' +
      '<button class="btn btn-red btn-sm" data-act="add-party" data-type="' + type + '">+ ' + t(type === 'customer' ? 'addCustomer' : 'addSupplier') + '</button></div>';
    if (!total) return tools + '<div class="empty"><p>' + t(type === 'customer' ? 'emptyC' : 'emptyS') + '</p><div class="btn-row" style="justify-content:center"><button class="btn btn-red btn-sm" data-act="add-party" data-type="' + type + '">+ ' + t(type === 'customer' ? 'addCustomer' : 'addSupplier') + '</button>' + (b.entries.length ? '' : '<button class="btn btn-line btn-sm" data-act="sample">' + t('sample') + '</button>') + '</div></div>';
    if (!rows.length) return tools + '<div class="empty">' + t('noMatch') + '</div>';
    return tools + '<ul class="plist">' + rows.map(function (r) {
      var over = r.p.limit && r.b > r.p.limit;
      return '<li><button data-open="' + r.p.id + '"><span class="avatar" aria-hidden="true">' + esc(r.p.name.trim().charAt(0).toUpperCase() || '?') + '</span><span><span class="pname">' + esc(r.p.name) + '</span><span class="psub">' +
        (r.l ? t('lastEntry') + ': ' + BK.niceDate(r.l) : t('noActivity')) + (r.p.phone ? ' · ' + esc(r.p.phone) : '') + (over ? ' · <strong class="neg">' + t('overLimit') + '</strong>' : '') + '</span></span>' + balHTML(r.b) + '</button></li>';
    }).join('') + '</ul>';
  }
  function partyView() {
    var p = B().parties.find(function (x) { return x.id === ui.party; });
    if (!p) { ui.party = null; return panel(); }
    var es = partyEntries(p.id), run = 0;
    var rowsChrono = es.map(function (e) { run += e.type === 'gave' ? e.amt : -e.amt; return { e: e, run: run }; });
    var b = run;
    var table = rowsChrono.length ? '<div class="tbl-wrap"><table class="etable"><thead><tr><th>' + t('date') + '</th><th>' + t('details') + '</th><th class="num">' + t('gave') + '</th><th class="num">' + t('got') + '</th><th class="num">' + t('balance') + '</th><th class="act no-print"><span class="sr">Actions</span></th></tr></thead><tbody>' +
      rowsChrono.slice().reverse().map(function (r) {
        var e = r.e, det = [e.note, e.bill ? 'Bill ' + e.bill : '', e.mode, e.due ? t('due').split(' (')[0] + ': ' + BK.niceDate(e.due) : ''].filter(Boolean).map(esc).join(' · ');
        return '<tr><td>' + BK.niceDate(e.date) + '</td><td>' + (det || '<span class="muted">—</span>') + '</td><td class="num neg">' + (e.type === 'gave' ? BK.fmt(e.amt) : '') + '</td><td class="num pos">' + (e.type === 'got' ? BK.fmt(e.amt) : '') + '</td><td class="num">' + money(r.run) + ' ' + (r.run > 0 ? 'Dr' : r.run < 0 ? 'Cr' : '') + '</td>' +
          '<td class="act no-print"><button class="linkbtn" data-edit-entry="' + e.id + '">' + t('edit') + '</button></td></tr>';
      }).join('') + '</tbody></table></div>' : '<div class="empty">' + t('noEntries') + '</div>';
    var phone = (p.phone || '').replace(/\D/g, '');
    var who = b > 0 ? 'cust' : 'sup';
    return '<div class="pview-head"><button class="btn btn-line btn-sm no-print" data-act="back">← ' + t('back') + '</button><div style="flex:1;min-width:180px"><h3>' + esc(p.name) + '</h3><span class="muted small">' + t(p.type) + (p.phone ? ' · ' + esc(p.phone) : '') + (p.limit ? ' · ' + t('limit').split(' (')[0] + ' ' + BK.fmt(p.limit) : '') + '</span></div>' +
      '<div style="text-align:right"><div class="pbig ' + (b > 0 ? 'pos' : b < 0 ? 'neg' : 'zero') + '">' + money(b) + '</div><span class="small muted">' + (Math.abs(b) < 0.005 ? t('settled') : b > 0 ? t('youWillGet') : t('youWillGive')) + '</span></div></div>' +
      (p.note ? '<p class="small muted">' + esc(p.note) + '</p>' : '') +
      '<div class="pact"><button class="btn btn-gave" data-entry="gave">' + t('gave') + ' ₹</button><button class="btn btn-got" data-entry="got">' + t('got') + ' ₹</button></div>' +
      '<div class="btn-row no-print" style="margin-bottom:14px">' +
      (b > 0 ? '<button class="btn btn-green btn-sm" data-act="wa">' + t('remind') + '</button>' : '<button class="btn btn-line btn-sm" data-act="wa">' + t('shareBal') + '</button>') +
      (phone ? '<button class="btn btn-line btn-sm" data-act="sms">' + t('sms') + '</button>' : '') +
      '<button class="btn btn-line btn-sm" data-act="stmt">' + t('statement') + '</button><button class="btn btn-line btn-sm" data-act="print">' + t('print') + '</button>' +
      '<button class="btn btn-line btn-sm" data-act="edit-party">' + t('edit') + '</button><button class="btn btn-line btn-sm" data-act="del-party">' + t('del') + '</button></div>' + table + (who ? '' : '');
  }
  function cashView() {
    var d = ui.cashDate, b = B();
    var day = b.cash.filter(function (c) { return c.date === d; }).sort(function (x, y) { return x.c - y.c; });
    var open = cashBefore(d), inn = 0, out = 0;
    day.forEach(function (c) { if (c.dir === 'in') inn += c.amt; else out += c.amt; });
    var ym = d.slice(0, 7), mi = 0, mo = 0;
    b.cash.forEach(function (c) { if (c.date.slice(0, 7) === ym) { if (c.dir === 'in') mi += c.amt; else mo += c.amt; } });
    var list = day.length ? '<div class="tbl-wrap"><table class="etable"><thead><tr><th>' + t('category') + '</th><th>' + t('details') + '</th><th class="num">' + t('cashIn') + '</th><th class="num">' + t('cashOut') + '</th><th class="act"><span class="sr">Actions</span></th></tr></thead><tbody>' +
      day.map(function (c) { return '<tr><td>' + esc(c.cat || '') + (c.link ? ' <span class="tag">' + t('cashAuto') + '</span>' : '') + '</td><td>' + esc(c.note || '') + '</td><td class="num pos">' + (c.dir === 'in' ? BK.fmt(c.amt) : '') + '</td><td class="num neg">' + (c.dir === 'out' ? BK.fmt(c.amt) : '') + '</td><td class="act">' + (c.link ? '' : '<button class="linkbtn" data-edit-cash="' + c.id + '">' + t('edit') + '</button>') + '</td></tr>'; }).join('') +
      '</tbody></table></div>' : '<div class="empty">' + t('noCash') + '</div>';
    return '<div class="cash-day"><button class="btn btn-line btn-sm" data-day="-1" aria-label="Previous day">←</button><label class="sr" for="k-day">' + t('date') + '</label><input type="date" id="k-day" value="' + d + '"><button class="btn btn-line btn-sm" data-day="1" aria-label="Next day">→</button><button class="btn btn-line btn-sm" data-day="0">' + t('today') + '</button><span class="grow"></span><button class="btn btn-line btn-sm" data-act="cash-open">' + t('setOpening') + '</button></div>' +
      '<div class="grid g4" style="gap:10px;margin-bottom:14px"><div class="panel panel-tint" style="padding:12px"><span class="small muted">' + t('openingCash') + '</span><br><b>' + BK.fmt(open) + '</b></div><div class="panel panel-tint" style="padding:12px"><span class="small muted">' + t('cashIn') + '</span><br><b class="pos">' + BK.fmt(inn) + '</b></div><div class="panel panel-tint" style="padding:12px"><span class="small muted">' + t('cashOut') + '</span><br><b class="neg">' + BK.fmt(out) + '</b></div><div class="panel panel-tint" style="padding:12px"><span class="small muted">' + t('closingCash') + '</span><br><b>' + BK.fmt(open + inn - out) + '</b></div></div>' +
      '<div class="pact"><button class="btn btn-got" data-cash="in">+ ' + t('cashIn') + '</button><button class="btn btn-gave" data-cash="out">− ' + t('cashOut') + '</button></div>' + list +
      '<p class="small muted mt1">' + t('monthIn') + ': <strong>' + BK.fmt(mi) + '</strong> · ' + t('monthOut') + ': <strong>' + BK.fmt(mo) + '</strong></p>';
  }
  function reportView() {
    var b = B(), tot = totals(), buckets = [0, 0, 0, 0], overdue = [], today = todayISO();
    b.parties.forEach(function (p) {
      unpaidLots(p.id).forEach(function (l) {
        var a = daysSince(l.date); buckets[a <= 30 ? 0 : a <= 60 ? 1 : a <= 90 ? 2 : 3] += l.amt;
        if (l.due && l.due < today) overdue.push({ p: p, amt: l.amt, due: l.due });
      });
    });
    var top = b.parties.map(function (p) { return { p: p, b: balance(p.id) }; }).filter(function (x) { return x.b > 0; }).sort(function (x, y) { return y.b - x.b; }).slice(0, 5);
    var months = [], now = new Date();
    for (var i = 5; i >= 0; i--) { var dd = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ k: BK.iso(dd).slice(0, 7), l: BK.MONTHS[dd.getMonth()].slice(0, 3), i: 0, o: 0 }); }
    b.cash.forEach(function (c) { var m = months.find(function (x) { return x.k === c.date.slice(0, 7); }); if (m) { if (c.dir === 'in') m.i += c.amt; else m.o += c.amt; } });
    var max = Math.max.apply(null, months.map(function (m) { return Math.max(m.i, m.o); }).concat([1]));
    return '<div class="grid g3" style="gap:12px;margin-bottom:18px"><div class="panel panel-tint"><span class="small muted">' + t('get') + '</span><div class="pbig pos">' + money(tot.get) + '</div></div><div class="panel panel-tint"><span class="small muted">' + t('give') + '</span><div class="pbig neg">' + money(tot.give) + '</div></div><div class="panel panel-tint"><span class="small muted">' + t('net') + '</span><div class="pbig">' + BK.fmt(tot.get - tot.give) + '</div></div></div>' +
      '<h4>' + t('ageing') + '</h4><div class="aging">' + buckets.map(function (v, k) { return '<div><span>' + t('bucket')[k] + '</span><b class="' + (k > 1 && v ? 'neg' : '') + '">' + BK.fmt(v) + '</b></div>'; }).join('') + '</div>' +
      (overdue.length ? '<h4 class="mt2">' + t('overdue') + '</h4><ul class="plist">' + overdue.slice(0, 8).map(function (o) { return '<li><button data-open="' + o.p.id + '"><span class="avatar">' + esc(o.p.name.charAt(0).toUpperCase()) + '</span><span><span class="pname">' + esc(o.p.name) + '</span><span class="psub">' + t('due').split(' (')[0] + ': ' + BK.niceDate(o.due) + '</span></span><span class="pbal neg">' + BK.fmt(o.amt) + '</span></button></li>'; }).join('') + '</ul>' : '') +
      '<h4 class="mt2">' + t('top') + '</h4>' + (top.length ? '<ul class="plist">' + top.map(function (x) { return '<li><button data-open="' + x.p.id + '"><span class="avatar">' + esc(x.p.name.charAt(0).toUpperCase()) + '</span><span><span class="pname">' + esc(x.p.name) + '</span><span class="psub">' + (x.p.phone ? esc(x.p.phone) : '') + '</span></span>' + balHTML(x.b) + '</button></li>'; }).join('') + '</ul>' : '<p class="muted">—</p>') +
      '<h4 class="mt2">' + t('trend') + '</h4><div class="bars" aria-hidden="true">' + months.map(function (m) { return '<div class="col"><div class="pair"><i class="in" style="height:' + (m.i / max * 100) + '%"></i><i class="out" style="height:' + (m.o / max * 100) + '%"></i></div><span>' + m.l + '</span></div>'; }).join('') + '</div>' +
      '<div class="legend mt1"><span><b style="background:var(--green)"></b>' + t('cashIn') + '</span><span><b style="background:var(--red)"></b>' + t('cashOut') + '</span></div>' +
      '<h4 class="mt2">' + t('exportT') + '</h4><div class="btn-row no-print"><button class="btn btn-line btn-sm" data-act="exp-parties">' + t('expParties') + '</button><button class="btn btn-line btn-sm" data-act="exp-entries">' + t('expEntries') + '</button><button class="btn btn-line btn-sm" data-act="exp-cash">' + t('expCash') + '</button><button class="btn btn-line btn-sm" data-act="print-report">' + t('printReport') + '</button></div>';
  }
  function settingsView() {
    var b = B();
    return '<div class="grid g2"><form class="form" id="k-profile"><h4 class="mb0">' + t('profile') + '</h4>' +
      '<div class="field"><label for="k-bn">' + t('bizName') + '</label><input id="k-bn" name="name" value="' + esc(b.name) + '" required maxlength="60"></div>' +
      '<div class="field"><label for="k-bp">' + t('bizPhone') + '</label><input id="k-bp" name="phone" type="tel" value="' + esc(b.phone) + '" maxlength="15"></div>' +
      '<div class="field"><label for="k-upi">' + t('upi') + '</label><input id="k-upi" name="upi" value="' + esc(b.upi) + '" placeholder="yourshop@upi" maxlength="60"></div>' +
      '<div class="field"><label for="k-lang">' + t('lang') + '</label><select id="k-lang" name="lang"><option value="en"' + (S.lang === 'en' ? ' selected' : '') + '>English</option><option value="hi"' + (S.lang === 'hi' ? ' selected' : '') + '>हिंदी</option></select></div>' +
      '<label class="check"><input type="checkbox" name="tag"' + (S.tag ? ' checked' : '') + '><span>' + t('tagLine') + '</span></label>' +
      '<button class="btn btn-red" type="submit">' + t('save') + '</button></form>' +
      '<div class="form"><h4 class="mb0">' + t('data') + '</h4><p class="small muted mb0">' + t('dataNote') + '</p>' +
      '<div class="btn-row"><button class="btn btn-gold btn-sm" data-act="backup">' + t('backup') + '</button><label class="btn btn-line btn-sm" for="k-restore">' + t('restore') + '</label><input type="file" id="k-restore" accept=".json,application/json" class="sr"></div>' +
      '<p class="small muted mb0">' + t('lastBackup') + ': ' + (S.lastBackup ? BK.niceDate(new Date(S.lastBackup)) : t('never')) + '</p><hr class="rule" style="margin:8px 0">' +
      '<h4 class="mb0">' + t('books') + '</h4><div class="btn-row"><button class="btn btn-line btn-sm" data-act="new-book">+ ' + t('newBook') + '</button><button class="btn btn-line btn-sm" data-act="rename-book">' + t('rename') + '</button>' + (Object.keys(S.books).length > 1 ? '<button class="btn btn-line btn-sm" data-act="del-book">' + t('delBook') + '</button>' : '') + '</div>' +
      '<div class="btn-row"><button class="btn btn-line btn-sm" data-act="sample">' + t('sample') + '</button></div><hr class="rule" style="margin:8px 0">' +
      '<button class="btn btn-line btn-sm" data-act="wipe" style="color:var(--red)">' + t('wipe') + '</button></div></div>';
  }

  /* ---------- events ---------- */
  function bindPanel() {
    var prof = $('#k-profile', host);
    if (prof) prof.addEventListener('submit', function (e) {
      e.preventDefault(); var f = new FormData(prof), b = B();
      b.name = String(f.get('name') || '').trim() || b.name; b.phone = String(f.get('phone') || '').trim(); b.upi = String(f.get('upi') || '').trim();
      S.lang = f.get('lang') === 'hi' ? 'hi' : 'en'; S.tag = !!f.get('tag'); save(); render(); BK.toast(t('saved'));
    });
    var rs = $('#k-restore', host); if (rs) rs.addEventListener('change', restore);
    var day = $('#k-day', host); if (day) day.addEventListener('change', function () { if (day.value) { ui.cashDate = day.value; renderPanel(); } });
  }
  host.addEventListener('click', function (e) {
    var el = e.target.closest('button,[data-act]'); if (!el || !host.contains(el)) return;
    var tab = el.getAttribute('data-tab');
    if (tab) { ui.tab = tab; ui.party = null; ui.q = ''; render(); return; }
    var open = el.getAttribute('data-open');
    if (open) { var p = B().parties.find(function (x) { return x.id === open; }); if (p) { ui.tab = p.type === 'customer' ? 'customers' : 'suppliers'; ui.party = open; render(); host.scrollIntoView({ block: 'start', behavior: 'smooth' }); } return; }
    if (el.hasAttribute('data-entry')) { entryModal(el.getAttribute('data-entry')); return; }
    if (el.hasAttribute('data-edit-entry')) { var en = B().entries.find(function (x) { return x.id === el.getAttribute('data-edit-entry'); }); if (en) entryModal(en.type, en); return; }
    if (el.hasAttribute('data-cash')) { cashModal(el.getAttribute('data-cash')); return; }
    if (el.hasAttribute('data-edit-cash')) { var ce = B().cash.find(function (x) { return x.id === el.getAttribute('data-edit-cash'); }); if (ce) cashModal(ce.dir, ce); return; }
    if (el.hasAttribute('data-day')) { var n = +el.getAttribute('data-day'); if (n === 0) ui.cashDate = todayISO(); else { var d = BK.parseISO(ui.cashDate); d.setDate(d.getDate() + n); ui.cashDate = BK.iso(d); } renderPanel(); return; }
    var act = el.getAttribute('data-act'); if (!act) return;
    var actions = {
      'add-party': function () { partyModal(el.getAttribute('data-type')); },
      back: function () { ui.party = null; render(); },
      lang: function () { S.lang = S.lang === 'hi' ? 'en' : 'hi'; save(); render(); },
      backup: backup, sample: loadSample, install: install,
      wa: function () { share('wa'); }, sms: function () { share('sms'); }, stmt: function () { share('stmt'); },
      print: function () { document.body.classList.add('print-statement'); window.print(); setTimeout(function () { document.body.classList.remove('print-statement'); }, 500); },
      'edit-party': function () { var p = B().parties.find(function (x) { return x.id === ui.party; }); if (p) partyModal(p.type, p); },
      'del-party': function () { if (!confirm(t('confirmDelParty'))) return; var b = B(), id = ui.party; b.parties = b.parties.filter(function (x) { return x.id !== id; }); var links = b.entries.filter(function (x) { return x.pid === id && x.cashId; }).map(function (x) { return x.cashId; }); b.entries = b.entries.filter(function (x) { return x.pid !== id; }); b.cash = b.cash.filter(function (c) { return links.indexOf(c.id) < 0; }); ui.party = null; save(); render(); BK.toast(t('deleted')); },
      'cash-open': function () { var v = prompt(t('setOpening') + ' (₹)', B().cashOpen || 0); if (v === null) return; B().cashOpen = BK.num(v); save(); render(); },
      'exp-parties': function () { var rows = [['Name', 'Type', 'Mobile', 'Balance', 'Status', 'Last entry']]; B().parties.forEach(function (p) { var b = balance(p.id); rows.push([p.name, p.type, p.phone || '', Math.abs(b).toFixed(2), b > 0 ? 'Will get' : b < 0 ? 'Will give' : 'Settled', lastDate(p.id)]); }); BK.download(fileBase() + '-parties.csv', BK.csv(rows), 'text/csv'); },
      'exp-entries': function () { var names = {}; B().parties.forEach(function (p) { names[p.id] = p.name; }); var rows = [['Date', 'Party', 'Type', 'Amount', 'Mode', 'Note', 'Bill', 'Due date']]; B().entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (e) { rows.push([e.date, names[e.pid] || '', e.type === 'gave' ? 'You gave' : 'You got', e.amt.toFixed(2), e.mode || '', e.note || '', e.bill || '', e.due || '']); }); BK.download(fileBase() + '-entries.csv', BK.csv(rows), 'text/csv'); },
      'exp-cash': function () { var rows = [['Date', 'Direction', 'Category', 'Amount', 'Note']]; B().cash.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (c) { rows.push([c.date, c.dir === 'in' ? 'Cash in' : 'Cash out', c.cat || '', c.amt.toFixed(2), c.note || '']); }); BK.download(fileBase() + '-cashbook.csv', BK.csv(rows), 'text/csv'); },
      'print-report': function () { window.print(); },
      'new-book': function () { var n = prompt(t('newBook'), ''); if (!n) return; var id = uid(); S.books[id] = newBook(n.trim().slice(0, 60)); S.active = id; ui = { tab: 'customers', party: null, q: '', sort: 'recent', cashDate: todayISO() }; save(); render(); },
      'rename-book': function () { var n = prompt(t('rename'), B().name); if (!n) return; B().name = n.trim().slice(0, 60); save(); render(); },
      'del-book': function () { if (!confirm(t('delBook') + ': ' + B().name + '?')) return; delete S.books[S.active]; S.active = Object.keys(S.books)[0]; save(); render(); },
      wipe: function () { var v = prompt(t('confirmWipe')); if (v !== 'DELETE') return; S = fresh(); save(); ui.tab = 'customers'; ui.party = null; render(); BK.toast(t('deleted')); }
    };
    if (actions[act]) actions[act]();
  });
  function onBook(e) {
    var v = e.target.value;
    if (v === '__new') { var n = prompt(t('newBook'), ''); if (n) { var id = uid(); S.books[id] = newBook(n.trim().slice(0, 60)); S.active = id; save(); } }
    else S.active = v;
    ui.party = null; render();
  }
  function fileBase() { return 'bahikhata-' + (B().name || 'book').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + todayISO(); }

  /* ---------- modals ---------- */
  var modal = document.createElement('div');
  modal.className = 'modal'; modal.innerHTML = '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="km-title"></div>';
  document.body.appendChild(modal);
  var lastFocus = null;
  function openModal(html, onSubmit, onReady) {
    lastFocus = document.activeElement;
    var card = $('.modal-card', modal); card.innerHTML = html; modal.classList.add('open');
    var form = $('form', card);
    form.addEventListener('submit', function (e) { e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } if (onSubmit(new FormData(form), form) !== false) closeModal(); });
    $$('[data-close]', card).forEach(function (b) { b.addEventListener('click', closeModal); });
    if (onReady) onReady(card);
    var first = $('[autofocus]', card) || $('input,select', card); if (first) setTimeout(function () { first.focus(); }, 30);
  }
  function closeModal() { modal.classList.remove('open'); $('.modal-card', modal).innerHTML = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  function head(title) { return '<div class="modal-head"><h3 id="km-title">' + title + '</h3><button type="button" class="icon-btn" data-close aria-label="' + t('cancel') + '">✕</button></div>'; }
  function opts(list, sel) { return list.map(function (x) { return '<option' + (x === sel ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join(''); }

  function partyModal(type, p) {
    var edit = !!p;
    var html = '<form class="form" novalidate>' + head(edit ? t('editParty') : t(type === 'customer' ? 'addCustomer' : 'addSupplier')) +
      '<div class="field"><label for="pm-name">' + t('name') + '</label><input id="pm-name" name="name" required maxlength="80" value="' + esc(p ? p.name : '') + '" autofocus></div>' +
      '<div class="field"><label for="pm-phone">' + t('mobile') + '</label><input id="pm-phone" name="phone" type="tel" inputmode="numeric" maxlength="15" value="' + esc(p ? p.phone : '') + '"></div>' +
      '<div class="field"><span class="flabel">' + t('type') + '</span><div class="seg"><label><input type="radio" name="type" value="customer"' + ((p ? p.type : type) === 'customer' ? ' checked' : '') + '><span>' + t('customer') + '</span></label><label><input type="radio" name="type" value="supplier"' + ((p ? p.type : type) === 'supplier' ? ' checked' : '') + '><span>' + t('supplier') + '</span></label></div></div>' +
      (edit ? '' : '<div class="row2"><div class="field"><label for="pm-open">' + t('opening') + '</label><input id="pm-open" name="open" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0"></div><div class="field"><label for="pm-dir">&nbsp;</label><select id="pm-dir" name="dir"><option value="gave">' + t('theyOwe') + '</option><option value="got">' + t('iOwe') + '</option></select></div></div>') +
      '<div class="field"><label for="pm-limit">' + t('limit') + '</label><input id="pm-limit" name="limit" type="number" min="0" step="1" inputmode="numeric" value="' + (p && p.limit ? p.limit : '') + '"></div>' +
      '<div class="field"><label for="pm-note">' + t('notes') + '</label><input id="pm-note" name="note" maxlength="140" value="' + esc(p ? p.note : '') + '"></div>' +
      '<div class="btn-row"><button class="btn btn-red" type="submit">' + t('save') + '</button><button class="btn btn-line" type="button" data-close>' + t('cancel') + '</button></div></form>';
    openModal(html, function (f) {
      var name = String(f.get('name') || '').trim(); if (!name) return false;
      var b = B();
      if (edit) { p.name = name; p.phone = String(f.get('phone') || '').trim(); p.type = f.get('type') || p.type; p.note = String(f.get('note') || '').trim(); p.limit = BK.num(f.get('limit')) || 0; }
      else {
        p = { id: uid(), name: name, phone: String(f.get('phone') || '').trim(), type: f.get('type') || type, note: String(f.get('note') || '').trim(), limit: BK.num(f.get('limit')) || 0, c: Date.now() };
        b.parties.push(p);
        var ob = BK.num(f.get('open'));
        if (ob > 0) b.entries.push({ id: uid(), pid: p.id, type: f.get('dir') === 'got' ? 'got' : 'gave', amt: ob, date: todayISO(), note: S.lang === 'hi' ? 'शुरुआती बाकी' : 'Opening balance', c: Date.now() });
      }
      ui.tab = p.type === 'customer' ? 'customers' : 'suppliers'; ui.party = p.id; save(); render(); BK.toast(t('saved'));
    });
  }
  function entryModal(type, e) {
    var p = B().parties.find(function (x) { return x.id === (e ? e.pid : ui.party); }); if (!p) return;
    var edit = !!e, modes = t('modes');
    var html = '<form class="form" novalidate>' + head((type === 'gave' ? t('gaveTo') : t('gotFrom')) + ' ' + esc(p.name)) +
      '<div class="field"><label for="em-amt">' + t('amount') + '</label><input id="em-amt" class="amount-input ' + (type === 'gave' ? 'neg' : 'pos') + '" name="amt" type="number" min="0.01" step="0.01" inputmode="decimal" required value="' + (e ? e.amt : '') + '" autofocus></div>' +
      '<div class="row2"><div class="field"><label for="em-date">' + t('date') + '</label><input id="em-date" name="date" type="date" required value="' + (e ? e.date : todayISO()) + '"></div>' +
      '<div class="field"><label for="em-mode">' + t('mode') + '</label><select id="em-mode" name="mode">' + opts(modes, e ? e.mode : (type === 'gave' ? modes[5] : modes[0])) + '</select></div></div>' +
      '<div class="field"><label for="em-note">' + t('note') + '</label><input id="em-note" name="note" maxlength="140" placeholder="' + t('notePh') + '" value="' + esc(e ? e.note : '') + '"></div>' +
      '<div class="row2"><div class="field"><label for="em-bill">' + t('bill') + '</label><input id="em-bill" name="bill" maxlength="30" value="' + esc(e ? e.bill : '') + '"></div>' +
      (type === 'gave' ? '<div class="field"><label for="em-due">' + t('due') + '</label><input id="em-due" name="due" type="date" value="' + (e && e.due ? e.due : '') + '"></div>' : '<div></div>') + '</div>' +
      '<label class="check" id="em-cash-wrap"><input type="checkbox" name="tocash"' + (e ? (e.cashId ? ' checked' : '') : (type === 'got' ? ' checked' : '')) + '><span>' + t('addToCash') + '</span></label>' +
      '<div class="btn-row"><button class="btn ' + (type === 'gave' ? 'btn-gave' : 'btn-got') + '" type="submit">' + t('save') + '</button><button class="btn btn-line" type="button" data-close>' + t('cancel') + '</button>' + (edit ? '<button class="btn btn-line" type="button" id="em-del" style="margin-left:auto;color:var(--red)">' + t('del') + '</button>' : '') + '</div></form>';
    openModal(html, function (f) {
      var amt = BK.num(f.get('amt')); if (!(amt > 0)) return false;
      var b = B(), rec = e || { id: uid(), pid: p.id, type: type, c: Date.now() };
      rec.amt = amt; rec.date = String(f.get('date') || todayISO()); rec.mode = String(f.get('mode') || ''); rec.note = String(f.get('note') || '').trim(); rec.bill = String(f.get('bill') || '').trim(); rec.due = type === 'gave' ? String(f.get('due') || '') : '';
      var wantCash = !!f.get('tocash') && rec.mode === modes[0];
      if (rec.cashId && !wantCash) { b.cash = b.cash.filter(function (c) { return c.id !== rec.cashId; }); delete rec.cashId; }
      if (wantCash) {
        var c = rec.cashId && b.cash.find(function (x) { return x.id === rec.cashId; });
        if (!c) { c = { id: uid(), c: Date.now(), link: rec.id }; b.cash.push(c); rec.cashId = c.id; }
        c.date = rec.date; c.amt = amt; c.dir = type === 'got' ? 'in' : 'out'; c.cat = type === 'got' ? t('cats')[1] : t('cats')[12]; c.note = p.name + (rec.note ? ' · ' + rec.note : '');
      }
      if (!e) b.entries.push(rec);
      save(); render(); BK.toast(t('saved'));
    }, function (card) {
      var mode = $('#em-mode', card), wrap = $('#em-cash-wrap', card);
      var sync = function () { wrap.hidden = mode.value !== modes[0]; }; mode.addEventListener('change', sync); sync();
      var del = $('#em-del', card); if (del) del.addEventListener('click', function () { if (!confirm(t('confirmDelEntry'))) return; var b = B(); b.entries = b.entries.filter(function (x) { return x.id !== e.id; }); if (e.cashId) b.cash = b.cash.filter(function (c) { return c.id !== e.cashId; }); save(); closeModal(); render(); BK.toast(t('deleted')); });
    });
  }
  function cashModal(dir, c) {
    var cats = t('cats'), edit = !!c;
    var html = '<form class="form" novalidate>' + head(dir === 'in' ? t('cashIn') : t('cashOut')) +
      '<div class="field"><label for="cm-amt">' + t('amount') + '</label><input id="cm-amt" class="amount-input ' + (dir === 'in' ? 'pos' : 'neg') + '" name="amt" type="number" min="0.01" step="0.01" inputmode="decimal" required value="' + (c ? c.amt : '') + '" autofocus></div>' +
      '<div class="row2"><div class="field"><label for="cm-date">' + t('date') + '</label><input id="cm-date" name="date" type="date" required value="' + (c ? c.date : ui.cashDate) + '"></div>' +
      '<div class="field"><label for="cm-cat">' + t('category') + '</label><select id="cm-cat" name="cat">' + opts(cats, c ? c.cat : (dir === 'in' ? cats[0] : cats[2])) + '</select></div></div>' +
      '<div class="field"><label for="cm-note">' + t('note') + '</label><input id="cm-note" name="note" maxlength="140" value="' + esc(c ? c.note : '') + '"></div>' +
      '<div class="btn-row"><button class="btn ' + (dir === 'in' ? 'btn-got' : 'btn-gave') + '" type="submit">' + t('save') + '</button><button class="btn btn-line" type="button" data-close>' + t('cancel') + '</button>' + (edit ? '<button class="btn btn-line" type="button" id="cm-del" style="margin-left:auto;color:var(--red)">' + t('del') + '</button>' : '') + '</div></form>';
    openModal(html, function (f) {
      var amt = BK.num(f.get('amt')); if (!(amt > 0)) return false;
      var rec = c || { id: uid(), c: Date.now(), dir: dir };
      rec.amt = amt; rec.date = String(f.get('date') || todayISO()); rec.cat = String(f.get('cat') || ''); rec.note = String(f.get('note') || '').trim();
      if (!c) B().cash.push(rec);
      ui.cashDate = rec.date; save(); render(); BK.toast(t('saved'));
    }, function (card) {
      var del = $('#cm-del', card); if (del) del.addEventListener('click', function () { if (!confirm(t('confirmDelEntry'))) return; B().cash = B().cash.filter(function (x) { return x.id !== c.id; }); save(); closeModal(); render(); });
    });
  }

  /* ---------- sharing ---------- */
  function share(kind) {
    var p = B().parties.find(function (x) { return x.id === ui.party; }); if (!p) return;
    var b = balance(p.id), biz = B().name || t('mine'), date = BK.niceDate(new Date()), msg;
    if (kind === 'stmt') {
      var es = partyEntries(p.id), run = 0, lines = es.map(function (e) { run += e.type === 'gave' ? e.amt : -e.amt; return BK.niceDate(e.date) + '  ' + (e.type === 'gave' ? '+' : '−') + BK.fmt(e.amt) + (e.note ? '  ' + e.note : '') + '  = ' + money(run); });
      msg = fill(t('stmt'), { name: p.name, biz: biz }) + '\n' + lines.slice(-15).join('\n') + '\n' + t('balance') + ': ' + money(b) + ' (' + (b > 0 ? t('youWillGet') : b < 0 ? t('youWillGive') : t('settled')) + ')';
    } else if (b > 0) {
      msg = fill(t('remMsg'), { name: p.name, biz: biz, amt: BK.fmt(b), date: date, upi: B().upi ? fill(t('remUpi'), { upi: B().upi }) : '' });
    } else {
      msg = fill(t('balMsg'), { name: p.name, amt: money(b), date: date, who: b < 0 ? (S.lang === 'hi' ? 'मुझे देना है' : 'I owe you') : t('settled') });
    }
    if (S.tag) msg += t('tag');
    var phone = (p.phone || '').replace(/\D/g, ''); if (phone.length === 10) phone = '91' + phone;
    if (kind === 'sms') { location.href = 'sms:' + (p.phone || '') + '?&body=' + encodeURIComponent(msg); return; }
    if (kind === 'stmt' && navigator.share) { navigator.share({ text: msg }).catch(function () { }); return; }
    window.open('https://wa.me/' + (phone || '') + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  /* ---------- backup / restore ---------- */
  function backup() {
    S.lastBackup = Date.now(); save();
    BK.download('bahikhata-backup-' + todayISO() + '.json', JSON.stringify({ app: 'bahikhata.com', exported: new Date().toISOString(), data: S }, null, 1), 'application/json');
    render();
  }
  function restore(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var j = JSON.parse(r.result), d = j.data || j;
        if (!d.books || !d.active || !d.books[d.active]) throw 0;
        S = d; S.lastBackup = Date.now(); save(); ui.party = null; render(); BK.toast(t('restored'));
      } catch (er) { alert(t('badFile')); }
    };
    r.readAsText(f);
  }

  /* ---------- sample data ---------- */
  function loadSample() {
    var id = uid(), b = newBook(t('sampleBook')), d = function (n) { var x = new Date(); x.setDate(x.getDate() - n); return BK.iso(x); };
    b.upi = 'sampleshop@upi'; b.cashOpen = 5000;
    var ppl = [['Sharma General Store', 'customer', '9800000001'], ['Verma ji', 'customer', '9800000002'], ['Anita Tailors', 'customer', ''], ['Gupta Traders', 'supplier', '9800000004'], ['Fresh Dairy', 'supplier', '']];
    ppl.forEach(function (x, k) { b.parties.push({ id: 'p' + k, name: x[0], type: x[1], phone: x[2], note: '', limit: k === 0 ? 10000 : 0, c: Date.now() - k }); });
    var E = function (pid, type, amt, days, note, mode, due) { b.entries.push({ id: uid(), pid: pid, type: type, amt: amt, date: d(days), note: note, mode: mode || '', due: due || '', c: Date.now() - days * 1000 }); };
    E('p0', 'gave', 8200, 75, 'Monthly ration', 'Goods'); E('p0', 'got', 4000, 40, 'Part payment', 'UPI'); E('p0', 'gave', 3100, 12, 'Bill 214', 'Goods', d(-3));
    E('p1', 'gave', 1500, 20, 'Rice and dal', 'Goods', d(5)); E('p1', 'got', 1500, 2, 'Paid in full', 'Cash');
    E('p2', 'gave', 2650, 95, 'Thread and buttons', 'Goods'); E('p2', 'got', 600, 50, '', 'Cash');
    E('p3', 'got', 24000, 30, 'Stock purchase, invoice 7781', 'Goods'); E('p3', 'gave', 15000, 10, 'NEFT payment', 'Bank transfer');
    E('p4', 'got', 3600, 6, 'Milk for the week', 'Goods');
    var C = function (dir, amt, days, cat, note) { b.cash.push({ id: uid(), dir: dir, amt: amt, date: d(days), cat: cat, note: note, c: Date.now() - days * 1000 }); };
    var cats = t('cats');
    for (var m = 0; m < 6; m++) { C('in', 42000 + m * 1500, m * 30 + 3, cats[0], ''); C('out', 18000 + m * 900, m * 30 + 5, cats[2], ''); C('out', 9000, m * 30 + 1, cats[4], ''); }
    C('in', 1500, 2, cats[1], 'Verma ji'); C('out', 600, 0, cats[5], 'Helper'); C('in', 3800, 0, cats[0], 'Counter sales');
    S.books[id] = b; S.active = id; ui = { tab: 'customers', party: null, q: '', sort: 'recent', cashDate: todayISO() }; save(); render(); BK.toast(t('saved'));
  }

  /* ---------- install + offline ---------- */
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; render(); });
  function install() { if (!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt.userChoice.finally(function () { deferredPrompt = null; render(); }); }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register(BK.ROOT + 'sw.js', { scope: BK.ROOT }).catch(function () { }); });
  }
  window.addEventListener('storage', function (e) { if (e.key === KEY) { S = BK.store.get(KEY, S); render(); } });

  render();
})();
