#!/usr/bin/env python3
"""BahiKhata.com static site builder.

Reads src/layout.html, src/pages/**.html (content fragments with a small front-matter
header), src/guides/*.md and src/data/*.json, and writes finished pages into the repo
root so GitHub Pages can serve them directly (see .nojekyll).

Add a page: create src/pages/<name>.html with a front-matter block, push to main.
Add a guide: create src/guides/<slug>.md, push to main. The GitHub Action rebuilds.
Run locally: python3 scripts/build.py
"""
import datetime as dt
import hashlib
import html
import json
import os
import re
import sys

try:
    import markdown
except ImportError:  # pragma: no cover
    sys.exit("pip install markdown")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
SITE = "https://bahikhata.com"
ADSENSE = ('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
           '?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>')
TODAY = dt.date.today()
YEAR = TODAY.year

CTA = {
    "books": ("Want your books kept for you?",
              "Get matched with a bookkeeper or accountant who works with small shops. Free consultation, no obligation.",
              "bookkeeping"),
    "gst": ("Need GST registration or return filing?",
            "Tell us about your business and a GST professional will call you back within one working day.",
            "gst"),
    "loan": ("Looking for a business loan?",
             "Share your requirement and we will connect you with a lending advisor who can explain your options.",
             "loan"),
    "msme": ("Want help with Udyam or MSME schemes?",
             "Get free guidance on registration and the schemes your business may qualify for.",
             "msme"),
}

CRUMB_NAMES = {"tools": "Tools", "learn": "Learn", "": "Home"}


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    old = read(p) if os.path.exists(p) else None
    if old != s:
        with open(p, "w", encoding="utf-8") as f:
            f.write(s)


def short_hash(*paths):
    h = hashlib.sha1()
    for p in paths:
        if os.path.exists(p):
            with open(p, "rb") as f:
                h.update(f.read())
    return h.hexdigest()[:10]


def front_matter(text):
    meta = {}
    if text.startswith("---"):
        _, fm, body = text.split("---", 2)
        for line in fm.strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        return meta, body.lstrip("\n")
    return meta, text


def esc(s):
    return html.escape(s or "", quote=True)


def rel_root(url_path):
    """'/' -> './', '/tools/' -> '../', '/tools/x/' -> '../../', '/404.html' -> './'"""
    if url_path.endswith(".html"):
        depth = url_path.count("/") - 1
    else:
        depth = url_path.strip("/").count("/") + (1 if url_path.strip("/") else 0)
    return "./" if depth == 0 else "../" * depth


def out_file(url_path):
    if url_path.endswith(".html"):
        return os.path.join(ROOT, url_path.lstrip("/"))
    return os.path.join(ROOT, url_path.strip("/"), "index.html") if url_path != "/" else os.path.join(ROOT, "index.html")


def strip_tags(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).strip()


def faq_schema(body):
    items = re.findall(r'<details class="faq"><summary>(.*?)</summary>(.*?)</details>', body, re.S)
    if not items:
        return None
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": strip_tags(q),
         "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}} for q, a in items]}


def crumbs_for(url_path, title):
    parts = [p for p in url_path.strip("/").split("/") if p and not p.endswith(".html")]
    trail = [("Home", "/")]
    acc = ""
    for i, p in enumerate(parts):
        acc += "/" + p
        if i < len(parts) - 1:
            trail.append((CRUMB_NAMES.get(p, p.replace("-", " ").title()), acc + "/"))
    if parts:
        trail.append((title, url_path))
    return trail


def crumbs_html(trail, root):
    if len(trail) < 2:
        return ""
    bits = []
    for i, (name, path) in enumerate(trail):
        if i == len(trail) - 1:
            bits.append('<span aria-current="page">%s</span>' % esc(name))
        else:
            href = root + path.lstrip("/")
            bits.append('<a href="%s">%s</a>' % (href or "./", esc(name)))
    return '<nav class="crumbs" aria-label="Breadcrumb">' + '<span aria-hidden="true">/</span>'.join(bits) + "</nav>"


def crumbs_schema(trail):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + p} for i, (n, p) in enumerate(trail)]}


class Site:
    def __init__(self):
        self.layout = read(os.path.join(SRC, "layout.html"))
        self.tools = json.load(open(os.path.join(SRC, "data", "tools.json"), encoding="utf-8"))
        self.videos = json.load(open(os.path.join(SRC, "data", "videos.json"), encoding="utf-8"))
        self.lastmod_path = os.path.join(SRC, "data", "lastmod.json")
        self.lastmod = json.load(open(self.lastmod_path)) if os.path.exists(self.lastmod_path) else {}
        self.pages = []  # dicts: url, title, description, text, noindex
        self.guides = []
        self.v_css = short_hash(os.path.join(ROOT, "assets/css/style.css"))
        self.v_main = short_hash(os.path.join(ROOT, "assets/js/main.js"))
        self.v = {n: short_hash(os.path.join(ROOT, "assets/js", n)) for n in ("khata.js", "tools.js", "invoice.js")}

    # ---------- shared fragments ----------
    def nav_tools(self, root):
        return "\n".join('<a href="%stools/%s/">%s<span>%s</span></a>' % (root, t["slug"], esc(t["name"]), esc(t["nav"]))
                         for t in self.tools)

    def tool_rows(self, root, limit=None, exclude=None):
        rows = ['<li><a class="row-link" href="%skhata/"><strong>Digital khata</strong><span class="desc">Customer and supplier balances, cash book, reminders and reports. Free, no signup.</span><span class="go">Open khata</span></a></li>' % root] if not exclude else []
        for t in self.tools:
            if exclude and t["slug"] == exclude:
                continue
            rows.append('<li><a class="row-link" href="%stools/%s/"><strong>%s</strong><span class="desc">%s</span><span class="go">Use tool</span></a></li>'
                        % (root, t["slug"], esc(t["name"]), esc(t["desc"])))
        if limit:
            rows = rows[:limit]
        return '<ul class="rows">' + "\n".join(rows) + "</ul>"

    def guide_index(self, root, limit=None, category=None):
        gs = [g for g in self.guides if not category or g["category"] == category]
        if limit:
            gs = gs[:limit]
        return '<ol class="index-list">' + "\n".join(
            '<li><a href="%slearn/%s/">%s</a><span class="cat">%s</span></li>' % (root, g["slug"], esc(g["title"]), esc(g["category"]))
            for g in gs) + "</ol>"

    def guide_groups(self, root):
        cats = []
        for g in self.guides:
            if g["category"] not in cats:
                cats.append(g["category"])
        out = []
        for c in cats:
            items = [g for g in self.guides if g["category"] == c]
            out.append('<section class="mt3"><h2>%s</h2><ul class="rows">%s</ul></section>' % (esc(c), "".join(
                '<li><a class="row-link" href="%slearn/%s/"><strong>%s</strong><span class="desc">%s</span><span class="go">%s min read</span></a></li>'
                % (root, g["slug"], esc(g["title"]), esc(g["description"]), g["minutes"]) for g in items)))
        return "\n".join(out)

    def video_grid(self, root, limit=None, filters=False):
        vs = self.videos[:limit] if limit else self.videos
        cards = []
        for v in vs:
            by = (" by " + esc(v["by"])) if v.get("by") else ""
            cards.append(
                '<article class="vcard" data-topic="%s"><button class="yt" type="button" data-id="%s" aria-label="Play video: %s" style="background-image:url(https://i.ytimg.com/vi/%s/hqdefault.jpg)"><span class="play"></span></button>'
                '<h3>%s</h3><p>%s video%s. <a href="https://www.youtube.com/watch?v=%s" target="_blank" rel="noopener">Watch on YouTube</a></p></article>'
                % (esc(v["topic"]), v["id"], esc(v["title"]), v["id"], esc(v["title"]), esc(v["lang"]), by, v["id"]))
        head = ""
        if filters:
            topics = []
            for v in self.videos:
                if v["topic"] not in topics:
                    topics.append(v["topic"])
            head = '<div class="vfilter chips" role="group" aria-label="Filter videos">' + '<button class="chip" type="button" aria-pressed="true" data-vf="all">All</button>' + "".join(
                '<button class="chip" type="button" aria-pressed="false" data-vf="%s">%s</button>' % (esc(t), esc(t)) for t in topics) + "</div>"
        return head + '<div class="grid g3 vgrid">' + "\n".join(cards) + "</div>"

    def fill(self, text, root):
        reps = {
            "{{root}}": root,
            "{{year}}": str(YEAR),
            "{{today}}": TODAY.strftime("%d %B %Y").lstrip("0"),
        }
        for k, v in reps.items():
            text = text.replace(k, v)
        lazy = {
            "{{tool_rows}}": lambda: self.tool_rows(root),
            "{{tool_rows_short}}": lambda: self.tool_rows(root, limit=7),
            "{{guide_index}}": lambda: self.guide_index(root),
            "{{guide_index_short}}": lambda: self.guide_index(root, limit=8),
            "{{guide_groups}}": lambda: self.guide_groups(root),
            "{{video_grid}}": lambda: self.video_grid(root, filters=True),
            "{{video_grid_short}}": lambda: self.video_grid(root, limit=3),
            "{{guide_count}}": lambda: str(len(self.guides)),
            "{{tool_count}}": lambda: str(len(self.tools)),
            "{{video_count}}": lambda: str(len(self.videos)),
        }
        for k, fn in lazy.items():
            if k in text:
                text = text.replace(k, fn())
        m = re.findall(r"\{\{related_tools:([a-z0-9-]+)\}\}", text)
        for slug in m:
            text = text.replace("{{related_tools:%s}}" % slug, self.tool_rows(root, exclude=slug, limit=5))
        return text

    # ---------- page rendering ----------
    def render(self, url, meta, body, schema_extra=None, page_head=None):
        root = rel_root(url)
        title = meta.get("title", "BahiKhata")
        full = meta.get("full_title") or (title if "BahiKhata" in title else title + " | BahiKhata.com")
        desc = meta.get("description", "")
        noindex = meta.get("noindex") == "yes"
        body = self.fill(body, root)
        trail = crumbs_for(url, meta.get("crumb", title))
        if page_head is None and meta.get("h1"):
            page_head = ('<header class="page-head"><div class="wrap">%s<h1>%s</h1>%s</div></header>'
                         % (crumbs_html(trail, root), meta["h1"], ('<p class="lede">%s</p>' % meta["lede"]) if meta.get("lede") else ""))
        graph = []
        if len(trail) > 1:
            graph.append(crumbs_schema(trail))
        f = faq_schema(body)
        if f:
            graph.append(f)
        if schema_extra:
            graph.extend(schema_extra)
        schema = ""
        if graph:
            schema = '<script type="application/ld+json">%s</script>' % json.dumps(
                {"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":"))
        scripts = ""
        for s in [x.strip() for x in meta.get("scripts", "").split(",") if x.strip()]:
            if s.startswith("http"):
                scripts += '<script src="%s" defer></script>\n' % s
            else:
                scripts += '<script src="%sassets/js/%s?v=%s" defer></script>\n' % (root, s, self.v.get(s, "1"))
        out = self.layout
        reps = {
            "{{full_title}}": esc(full), "{{title}}": esc(title), "{{description}}": esc(desc),
            "{{canonical}}": SITE + (url if not url.endswith("index.html") else url[:-10]),
            "{{robots}}": "noindex, follow" if noindex else "index, follow, max-image-preview:large",
            "{{og_type}}": meta.get("og_type", "website"),
            "{{adsense}}": "" if meta.get("ads") == "no" else ADSENSE,
            "{{schema}}": schema, "{{body_class}}": meta.get("body_class", ""),
            "{{page_head}}": page_head or "", "{{content}}": body, "{{scripts}}": scripts,
            "{{nav_tools}}": self.nav_tools(root), "{{v_css}}": self.v_css, "{{v_main}}": self.v_main,
        }
        for k, v in reps.items():
            out = out.replace(k, v)
        out = out.replace("{{root}}", root).replace("{{year}}", str(YEAR))
        nav = meta.get("nav")
        if nav:
            out = out.replace('data-nav="%s"' % nav, 'data-nav="%s" aria-current="page"' % nav, 1)
        if url == "/404.html":
            # 404 is served at any missing path, so anchor relative links to the site base
            base = ("<script>document.write('<base href=\"'+(location.pathname.indexOf('/bahikhata-com/')===0"
                    "?'/bahikhata-com/':'/')+'\">')</script>")
            out = out.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + base, 1)
        self.pages.append({"url": url, "title": title, "description": desc, "noindex": noindex,
                           "text": strip_tags(body)[:2000], "hash": hashlib.sha1(body.encode()).hexdigest()[:12]})
        write(out_file(url), out)

    # ---------- guides ----------
    def load_guides(self):
        order = []
        for fn in sorted(os.listdir(os.path.join(SRC, "guides"))):
            if not fn.endswith(".md"):
                continue
            meta, body = front_matter(read(os.path.join(SRC, "guides", fn)))
            slug = fn[:-3]
            words = len(re.findall(r"\w+", body))
            meta.update(slug=slug, body=body, minutes=max(3, round(words / 200)))
            meta.setdefault("category", "Basics")
            order.append(meta)
        cat_order = ["Basics", "Bookkeeping", "Credit & collections", "GST & tax", "Reports", "Pricing", "Loans & growth"]
        order.sort(key=lambda g: (cat_order.index(g["category"]) if g["category"] in cat_order else 99, g["title"]))
        self.guides = order

    def render_guide(self, g):
        url = "/learn/%s/" % g["slug"]
        root = rel_root(url)
        md = markdown.Markdown(extensions=["tables", "toc", "attr_list", "def_list", "sane_lists", "md_in_html"],
                               extension_configs={"toc": {"toc_depth": "2-2"}})
        body_md = g["body"].replace("{{root}}", root)
        content = md.convert(body_md)
        toc_items = [t for t in md.toc_tokens if t["level"] == 2]
        # insert CTA after the third h2
        cta = CTA.get(g.get("cta", "books"), CTA["books"])
        cta_html = ('<aside class="cta-box no-print"><h3>%s</h3><p>%s</p><a class="btn btn-red btn-sm" href="%sexpert-help/?need=%s">Get free expert help</a></aside>'
                    % (cta[0], cta[1], root, cta[2]))
        h2s = [m.start() for m in re.finditer(r"<h2", content)]
        if len(h2s) >= 4:
            content = content[:h2s[3]] + cta_html + content[h2s[3]:]
        else:
            content += cta_html
        toc = ""
        if toc_items:
            toc = '<nav class="panel toc" aria-label="On this page"><strong>On this page</strong><ol>%s</ol></nav>' % "".join(
                '<li><a href="#%s">%s</a></li>' % (t["id"], esc(html.unescape(t["name"]))) for t in toc_items)
        tool_links = ""
        tslugs = [s.strip() for s in g.get("tools", "").split(",") if s.strip()]
        if tslugs:
            names = {t["slug"]: t["name"] for t in self.tools}
            names["khata"] = "Digital khata"
            lis = "".join('<li><a href="%s%s/">%s</a></li>' % (root, ("khata" if s == "khata" else "tools/" + s), esc(names.get(s, s)))
                          for s in tslugs if s in names)
            tool_links = '<div class="panel"><strong>Tools for this guide</strong><ul class="inline-list mt1">%s</ul></div>' % lis
        side_cta = ('<div class="panel panel-tint"><strong>Talk to an expert</strong><p class="small muted mt1">Free call-back from a CA, GST or loan advisor.</p>'
                    '<a class="btn btn-red btn-sm btn-block" href="%sexpert-help/">Get expert help</a></div>' % root)
        related = [x for x in self.guides if x["slug"] != g["slug"] and x["category"] == g["category"]]
        related += [x for x in self.guides if x["slug"] != g["slug"] and x not in related]
        rel_html = "".join('<li><a class="row-link" href="%slearn/%s/"><strong>%s</strong><span class="desc">%s</span><span class="go">Read</span></a></li>'
                           % (root, r["slug"], esc(r["title"]), esc(r["description"]), ) for r in related[:3])
        updated = g.get("updated", TODAY.isoformat())
        try:
            upd_h = dt.date.fromisoformat(updated).strftime("%d %B %Y").lstrip("0")
        except ValueError:
            upd_h = updated
        trail = crumbs_for(url, g["title"])
        page_head = ('<header class="page-head"><div class="wrap">%s<span class="tag tag-red">%s</span><h1 class="mt1">%s</h1><p class="lede">%s</p>'
                     '<div class="meta-line"><span>Updated %s</span><span>%s min read</span><span>By the BahiKhata editorial team</span></div></div></header>'
                     % (crumbs_html(trail, root), esc(g["category"]), esc(g["title"]), esc(g["description"]), upd_h, g["minutes"]))
        body = ('<section class="band"><div class="wrap guide-layout"><article class="prose">%s'
                '<p class="note small">This guide is general information to help you understand the topic. It is not legal, tax or financial advice. Rules and rates change; confirm details for your situation with a qualified professional or the official government portal. Read our <a href="%seditorial-policy/">editorial policy</a>.</p></article>'
                '<aside class="guide-side">%s%s%s</aside></div></section>'
                '<section class="band band-tint"><div class="wrap"><h2>Keep reading</h2><ul class="rows mt2">%s</ul></div></section>'
                % (content, root, toc, tool_links, side_cta, rel_html))
        article = {"@type": "Article", "headline": g["title"], "description": g["description"], "dateModified": updated,
                   "datePublished": g.get("published", updated), "inLanguage": "en-IN",
                   "author": {"@type": "Organization", "name": "BahiKhata editorial team", "url": SITE + "/editorial-policy/"},
                   "publisher": {"@type": "Organization", "name": "BahiKhata.com", "logo": {"@type": "ImageObject", "url": SITE + "/assets/img/icon-512.png"}},
                   "mainEntityOfPage": SITE + url, "image": SITE + "/assets/img/og.png"}
        meta = {"title": g["title"], "description": g["description"], "nav": "learn", "og_type": "article"}
        self.render(url, meta, body, schema_extra=[article], page_head=page_head)

    # ---------- pages ----------
    def render_pages(self):
        base = os.path.join(SRC, "pages")
        for dirpath, _, files in os.walk(base):
            for fn in sorted(files):
                if not fn.endswith(".html"):
                    continue
                full = os.path.join(dirpath, fn)
                rel = os.path.relpath(full, base).replace(os.sep, "/")
                meta, body = front_matter(read(full))
                if meta.get("path"):
                    url = meta["path"]
                elif rel == "index.html":
                    url = "/"
                elif rel.endswith("/index.html"):
                    url = "/" + rel[: -len("index.html")]
                else:
                    url = "/" + rel[:-5] + "/"
                extra = []
                if url == "/":
                    extra = [
                        {"@type": "WebSite", "name": "BahiKhata.com", "url": SITE + "/",
                         "potentialAction": {"@type": "SearchAction", "target": SITE + "/search/?q={query}", "query-input": "required name=query"}},
                        {"@type": "Organization", "name": "BahiKhata.com", "url": SITE + "/", "logo": SITE + "/assets/img/icon-512.png"}]
                if meta.get("app") == "yes":
                    extra.append({"@type": "WebApplication", "name": meta.get("app_name", meta.get("title")), "url": SITE + url,
                                  "applicationCategory": "BusinessApplication", "operatingSystem": "Any (web browser)",
                                  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR"}, "inLanguage": ["en-IN", "hi-IN"]})
                self.render(url, meta, body, schema_extra=extra)

    # ---------- outputs ----------
    def sitemap(self):
        urls = []
        changed = False
        for p in self.pages:
            if p["noindex"] or p["url"].endswith(".html"):
                continue
            rec = self.lastmod.get(p["url"])
            if not rec or rec.get("hash") != p["hash"]:
                rec = {"hash": p["hash"], "date": TODAY.isoformat()}
                self.lastmod[p["url"]] = rec
                changed = True
            pri = "1.0" if p["url"] == "/" else ("0.9" if p["url"] in ("/khata/", "/tools/", "/expert-help/") else "0.7")
            urls.append("<url><loc>%s%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>" % (SITE, p["url"], rec["date"], pri))
        live = {p["url"] for p in self.pages}
        for k in list(self.lastmod):
            if k not in live:
                del self.lastmod[k]
                changed = True
        if changed or not os.path.exists(self.lastmod_path):
            write(self.lastmod_path, json.dumps(self.lastmod, indent=1, sort_keys=True))
        write(os.path.join(ROOT, "sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
              + "\n".join(urls) + "\n</urlset>\n")

    def search_index(self):
        idx = [{"u": p["url"].lstrip("/"), "t": p["title"], "d": p["description"], "x": p["text"][:600]}
               for p in self.pages if not p["noindex"] and not p["url"].endswith(".html")]
        write(os.path.join(ROOT, "assets", "data", "search-index.json"), json.dumps(idx, ensure_ascii=False, separators=(",", ":")))

    def service_worker(self):
        version = short_hash(*[os.path.join(ROOT, p) for p in ("assets/css/style.css", "assets/js/main.js", "assets/js/khata.js")])
        sw = read(os.path.join(SRC, "sw.template.js")).replace("__VERSION__", version)
        write(os.path.join(ROOT, "sw.js"), sw)

    def cleanup(self):
        man_path = os.path.join(SRC, "data", "generated.json")
        old = set(json.load(open(man_path))) if os.path.exists(man_path) else set()
        new = {p["url"] for p in self.pages}
        for url in old - new:
            f = out_file(url)
            if os.path.exists(f):
                os.remove(f)
                try:
                    os.rmdir(os.path.dirname(f))
                except OSError:
                    pass
        write(man_path, json.dumps(sorted(new), indent=1))

    def run(self):
        self.load_guides()
        for g in self.guides:
            self.render_guide(g)
        self.render_pages()
        self.sitemap()
        self.search_index()
        self.service_worker()
        self.cleanup()
        print("Built %d pages (%d guides, %d tools)." % (len(self.pages), len(self.guides), len(self.tools)))


if __name__ == "__main__":
    Site().run()
