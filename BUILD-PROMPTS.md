# BahiKhata.com — phase-wise build prompts

Copy each prompt into Claude in order. Each phase assumes the previous ones are done. `[OWNER_INBOX]` is the single contact inbox for the whole site; it must never appear in page source in plain text (it is encoded in `assets/js/main.js`). AdSense publisher: `ca-pub-6620975821265271`.

---

## Phase 0 — Strategy and research

> Research the niche for the domain BahiKhata.com ("bahi khata" = traditional Indian ledger book). Visit at least 35 world-class sites across khata apps, GST billing software, invoice generators, tax-filing services, loan marketplaces, calculator sites and accounting-education sites. For each, record homepage sections, forms and their fields, free tools, trust signals, content types and design. Then pick the single most profitable website concept that a static site can deliver, score it against alternatives (traffic, monetisation, build cost, moat), and give a revenue model with explicit assumptions. Check whether "bahi khata" is trademarked and how it is used by others. Output RESEARCH.md.

## Phase 1 — Foundation

> Create a static site for GitHub Pages (free plan, main branch, `.nojekyll`) with a Python build script (`scripts/build.py`) that renders `src/layout.html` + content fragments in `src/pages/` + Markdown guides in `src/guides/` into finished HTML in the repo root, with relative links so it works both at `username.github.io/repo/` and at the custom domain. Shared layout must include:
> - On top of every page, a bar reading "Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership" linking to https://web.works/contact.
> - The AdSense script `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>` in the head of every page except 404.
> - Sticky header with Khata app, Tools menu, Learn, Videos, News, More menu and a "Get expert help" button; dark mode; mobile drawer; footer with all legal links and an independence/trademark line; cookie notice.
> - SEO: unique titles and descriptions, canonical URLs on https://bahikhata.com, Open Graph, JSON-LD (WebSite, Organization, BreadcrumbList, FAQPage auto-detected from `<details class="faq">`, Article for guides, WebApplication for tools).
> - `ads.txt` (google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0), `robots.txt`, auto-generated `sitemap.xml` with content-hash lastmod, `site.webmanifest`, search index JSON.
> - Legal pages written for AdSense approval: privacy (Google advertising cookie disclosures and opt-out links, DPDP Act rights), terms, disclaimer, cookie policy, trademark and copyright notice ("bahi khata" is generic; no affiliation with Khatabook, OkCredit, Vyapar, Tally, any "Bahi Khata" app, GSTN, CBIC, Income Tax, Google/YouTube creators), editorial policy, about, contact.
> - All forms post via AJAX to a form backend whose destination is `[OWNER_INBOX]`, assembled at runtime from encoded character codes; email links open `mailto:` only on click. Grep the build to prove the address never appears in plain text.
> Design: distinctive, not templated. Bahi red cloth (#A4161A), marigold stitch (#F2A900), blue ledger rules, ink. Mukta for structure, Kalam (handwritten) for ledger figures. Signature element: a live ruled ledger page in the hero.

## Phase 2 — The free digital khata

> Build `/khata/` as a browser app (vanilla JS, localStorage, no signup, works offline via a service worker, installable as a PWA). Features: multiple books; customers and suppliers with opening balance, phone, credit limit and notes; "You gave" / "You got" entries with date, mode, note, bill no. and due date; running balance and statement; optional auto-posting of cash payments to a daily cash book with opening/closing cash; reports with totals, FIFO udhaar ageing (0–30/31–60/61–90/90+), overdue list, top balances, six-month cash in/out chart; WhatsApp and SMS reminders in English and Hindi with the exact balance, UPI ID and an optional "Sent with BahiKhata.com" line; print statement; CSV exports; JSON backup and restore with a weekly backup nudge; sample data; full English/Hindi UI toggle. Add explanatory content, how-to steps and FAQ below the app so the page carries real publisher content.

## Phase 3 — Business tools

> Build a tools hub and these tools, each with the working tool on top and, below it, the formula, a worked rupee example, FAQ (with FAQ schema) and related tools: GST calculator (add/remove, 0/0.25/3/5/18/40% + custom, CGST/SGST vs IGST, quantity); GST invoice generator (tax invoice, bill of supply, quotation, proforma, receipt, delivery challan; seller/buyer GSTIN with state auto-detect; HSN, qty, unit, rate, discount, GST per line; automatic CGST+SGST or IGST; rate-wise summary; round-off; amount in words in the chosen currency; logo; bank details; UPI scan-to-pay QR; validation warnings; print/save as PDF; saved invoices); byaj calculator (₹ per 100 per month or % a year, simple/compound, between dates or duration); EMI calculator with yearly/monthly schedule and CSV; margin and markup calculator with GST; break-even calculator with daily targets; discount calculator with successive discounts and seller margin impact; amount in words (lakh/crore and international); GSTIN checker (state, PAN, entity type, Luhn mod-36 check digit, bulk mode); compliance due-date calendar (GST monthly/QRMP/composition, TDS, PF/ESI, advance tax, ITR; filters; Google Calendar links; ICS download), recalculated daily in the browser.

## Phase 4 — Content

> Write 15 original, practical guides (600–1,100 words each, rupee examples, tables, FAQ, links to tools) in Markdown front matter format: bahi-khata meaning and history; starting a digital khata; managing udhaar (incl. MSMED 45-day rule and 43B(h)); double entry and golden rules; cash book; GST basics after GST 2.0; GST invoice format; P&L and balance sheet; cash flow vs profit; margin vs markup; stock register; small business loans (Mudra, CGTMSE); Udyam registration; a 70+ term Hindi–English glossary; year-end closing and the Diwali new bahi. Verify every rate, threshold and date against official sources first. The build inserts a matching expert-help CTA after the third section, a sticky table of contents, related guides and a professional-advice note. Add a videos page of curated YouTube lessons (lazy-loaded facades, youtube-nocookie, topic filters), a templates page (printable ruled registers and CSV downloads) and a news page.

## Phase 5 — Monetisation and conversion

> Add: (1) a three-step expert-help lead form (needs → business details → contact with consent) with progress bar, validation, `?need=` prefill, UTM/landing/referrer capture, and a success state; a short call-back form on the home page; in-guide CTAs. (2) A partner page where CAs, GST practitioners, bookkeepers and lenders apply to buy matched leads. (3) A support page with one-time/monthly pledges and tiers, purpose selection (operations, new tools, contest prizes, hiring, promotion, training), and payment links sent securely after the pledge. (4) An advertise page with sponsorship formats, sponsor rules, a media-kit form and a link to web.works/contact for domain/website acquisition. (5) A contests page with a 10-question interactive Hisaab Quiz, skill-based tie-breaker, monthly auto-rolling deadlines, a creator video award, and full rules (free entry, 18+, India). (6) A careers page with roles and an application form. All forms go to `[OWNER_INBOX]` without exposing it.

## Phase 6 — Automation

> Add a GitHub Actions workflow that runs on every push to sources and daily on a schedule: refresh `assets/data/news.json` from Google News RSS searches (GST, MSME, tax, credit, UPI) keeping the old file if feeds fail; draw the OG image and PNG app icons with Pillow; run the build (pages, sitemap with content-hash lastmod, search index, versioned service worker); commit generated files with the Actions bot; then request a GitHub Pages rebuild through the API.

## Phase 7 — QA

> Build locally; crawl every page for broken internal links; run every page in a headless browser for JS errors and horizontal overflow at 390 px; run end-to-end tests for the khata (add party, entries, cash auto-post, reminder text EN/HI, reports, backup/restore, persistence), the invoice generator (state detection, IGST/CGST split, totals, words, save), and the lead form (step validation, payload, fallback when the backend is unreachable); grep the repo to confirm the owner inbox never appears in plain text; review screenshots on desktop, mobile and dark mode.

## Phase 8 — Deploy and AdSense

> Push to the `main` branch of `WEBWORKSA1/bahikhata-com`. In Settings → Pages choose "Deploy from a branch", `main`, `/ (root)`. When ready to switch the domain: add A records 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 and a `www` CNAME to `webworksa1.github.io`, enter `bahikhata.com` as the custom domain in Settings → Pages, and tick Enforce HTTPS. Submit the first form once and click the form backend's one-time activation email. In AdSense, add the site, confirm `ads.txt`, turn on Auto ads, and enable Google's consent message for EEA/UK visitors under Privacy & messaging. Submit `sitemap.xml` in Google Search Console.

## Phase 9 — Growth (next prompts)

> 1. Add Hindi versions of the top five guides and the five most-used tools under `/hi/`, with hreflang.
> 2. Add a salary-slip generator, a TDS rate finder and a working-capital calculator.
> 3. Add optional cloud sync for the khata with Supabase (email/OTP login), keeping the no-signup local mode as default.
> 4. Build city landing pages ("GST registration help in Jaipur") once partners cover those cities.
> 5. Publish a monthly "rule changes for small businesses" post generated from the news feed and reviewed by a CA partner.
