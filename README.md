# BahiKhata.com

Free digital bahikhata (udhaar ledger and cash book in the browser), Indian small-business money tools, plain-language guides and an expert-help desk. Monetised with Google AdSense, expert-help leads, sponsorships and supporter pledges.

- **Hosting:** GitHub Pages, free plan, `main` branch, root folder. Plain static HTML (`.nojekyll`).
- **Build:** `python3 scripts/build.py` (needs `pip install markdown`). A GitHub Action runs it automatically on every push and every morning.
- **Research and concept:** [RESEARCH.md](RESEARCH.md) · **Phase-wise build prompts:** [BUILD-PROMPTS.md](BUILD-PROMPTS.md)

## How the repo is organised

| Path | What it is |
|---|---|
| `src/layout.html` | Shared page shell: top contact bar, header, AdSense script, footer, cookie notice |
| `src/pages/**.html` | Page content with a small front-matter header (title, description, h1, scripts…) |
| `src/guides/*.md` | Guides in Markdown; each becomes `/learn/<file-name>/` |
| `src/data/tools.json`, `videos.json` | Tool list and curated YouTube videos used across the site |
| `assets/css/style.css` | Design system |
| `assets/js/main.js` | Shared behaviour: forms, menus, theme, video facades, due dates, news, search, quiz, templates |
| `assets/js/khata.js` | The digital khata app |
| `assets/js/tools.js`, `invoice.js` | Calculators and the invoice generator |
| `scripts/build.py` | Renders everything into the repo root, plus sitemap, search index and service worker |
| `scripts/update_feeds.py` | Refreshes `assets/data/news.json` from Google News RSS |
| `scripts/make_images.py` | Draws `og.png` and the app icons |
| `.github/workflows/build.yml` | Builds on push and daily at 06:47 IST, commits output, asks Pages to republish |

Generated folders in the root (`index.html`, `khata/`, `tools/`, `learn/`, etc.) are build output. Edit the files in `src/`, not the output.

## Common edits

- **Add a guide:** create `src/guides/my-topic.md` with `title`, `description`, `category`, `updated`, `tools` and `cta` (books, gst, loan or msme) in the front matter. Push. It appears on `/learn/`, in the sitemap and in search.
- **Add a page:** create `src/pages/my-page.html` with front matter. It is published at `/my-page/`.
- **Change contest prizes:** edit the prize list in `src/pages/contests.html`.
- **Add or swap videos:** edit `src/data/videos.json` (YouTube video ID, topic, title, creator, language).
- **Manual AdSense units:** Auto ads need no code. If you create ad units later, place `<ins class="adsbygoogle" …>` blocks in `src/pages/*.html` where you want them.

## Forms and the contact inbox

All forms (expert help, call-back, contact, partners, support, advertise, contests, careers, newsletter) send through the FormSubmit AJAX endpoint. The destination inbox is stored only as encoded character codes in `assets/js/main.js` and is never written in plain text anywhere on the site. **The very first form submission triggers a one-time activation email from FormSubmit to the inbox: click the link in it once**, and every form works from then on. If the backend is unreachable, forms offer a "send by email instead" fallback.

## Publishing

1. Settings → Pages → Build and deployment → **Deploy from a branch** → `main` / `(root)` → Save.
2. The site is live at `https://webworksa1.github.io/bahikhata-com/`.
3. To serve it on **bahikhata.com**: at the registrar, replace the parking/for-sale records with A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` CNAME to `webworksa1.github.io`. Then Settings → Pages → Custom domain → `bahikhata.com` → Save, and tick **Enforce HTTPS** once the certificate is issued. All links are relative, so nothing else needs to change.

## AdSense checklist

- `ads.txt` is in the root with publisher `pub-6620975821265271`.
- The AdSense script is in the `<head>` of every page except the 404 page.
- Privacy policy includes Google's advertising-cookie disclosures and opt-out links.
- In AdSense: add `bahikhata.com`, request review, turn on Auto ads, and set up the Google consent message for EEA/UK/Switzerland visitors in Privacy & messaging.
- Submit `https://bahikhata.com/sitemap.xml` in Google Search Console.

## Trademark

"Bahi khata" is a generic Hindi term for a ledger book and is used descriptively. BahiKhata.com claims no exclusive rights to it and is not affiliated with any app or company of a similar name. See `/trademark/`.
