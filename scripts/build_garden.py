"""Build the site's garden data locally; --check validates it without loading a model.

Ported from Website-Garden's approved prototype. Only previously committed,
published collection files enter the garden. Existing map positions are fixed
unless --relayout is explicitly requested.
"""
import argparse
import datetime as dt
import hashlib
import html
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

import yaml

ROOT = Path(__file__).resolve().parent.parent
COLLECTIONS = {"_projects": "project", "_publications": "paper", "_posts": "essay"}
FIELDS = ("areas", "track", "project", "status", "start", "end", "short", "context", "stage", "related")


def plain(text):
    """Extract readable text for search and embeddings, excluding HTML comments."""
    text = re.sub(r"<!--.*?-->", "", str(text), flags=re.S)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"[*_#>`]", "", text))).strip()


def git(root, *args):
    return subprocess.check_output(["git", "-C", str(root), *args], text=True, encoding="utf-8").strip()


def read_items(root):
    """Read committed collections from the working tree; untracked drafts stay private."""
    committed = git(root, "ls-tree", "-r", "--name-only", "HEAD").splitlines()
    digest = hashlib.sha256()
    items = []
    for rel in sorted(committed):
        path = root / rel
        collection = rel.split("/")[0]
        if collection not in COLLECTIONS or path.suffix not in (".md", ".markdown") or not path.exists():
            continue
        raw = path.read_bytes()
        match = re.match(r"---\r?\n(.*?)\r?\n---\r?\n?(.*)", raw.decode("utf-8"), re.S)
        if not match:
            raise ValueError(f"{rel}: missing front matter")
        fm, body = yaml.safe_load(match[1]), match[2]
        date = str(fm.get("date") or path.name[:10])[:10]
        if fm.get("published") is False or date > dt.date.today().isoformat():
            continue
        dt.date.fromisoformat(date)
        # Git's Windows checkout can use CRLF while CI uses LF.
        digest.update(rel.encode() + b"\0" + raw.replace(b"\r\n", b"\n"))
        col = collection[1:]
        if col == "posts":
            fallback = "/" + path.stem[11:] + "/"
        else:
            fallback = f"/{col}/{path.stem}/"
        url = fm.get("permalink") or fallback
        history = git(root, "log", "--format=%cs", "--", rel).splitlines()
        tags = fm.get("tags") or []
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",")]
        teaser = fm.get("teaser") or (fm.get("header") or {}).get("teaser")
        if teaser and not teaser.startswith(("/", "https://", "http://")):
            teaser = "/images/" + teaser
        item = {
            "id": path.stem, "url": url, "source": rel, "kind": COLLECTIONS[collection],
            "collection": col, "title": plain(fm.get("title") or path.stem), "date": date,
            "planted": history[-1], "git_modified": history[0],
            "excerpt": plain(fm.get("excerpt") or fm.get("abstract") or "")[:400] or plain(body)[:300],
            "text": (str(fm.get("abstract") or "") + " " + plain(body))[:4000],
            "tags": tags, "category": fm.get("category"), "venue": fm.get("venue"),
            "authors": plain(fm.get("authors") or "") or None, "teaser": teaser,
            "internal_links": re.findall(r"\]\(([^)\s]+)\)", body) + re.findall(r'href=[\"\x27]([^\"\x27]+)', body),
            "tended": str(fm.get("tended") or date)[:10],
        }
        for key in FIELDS:
            if key in fm:
                item[key] = fm[key]
        items.append(item)
    for name in ("tracks.yml", "series.yml"):
        digest.update((root / "_data" / name).read_bytes().replace(b"\r\n", b"\n"))
    return items, digest.hexdigest()


def relate(items, tracks, series):
    """Validate authored relations and derive hubs, reading order and backlinks."""
    by = {i["id"]: i for i in items}
    tids = {t["id"] for t in tracks}
    errors = []
    if len(by) != len(items):
        errors.append("duplicate item id")
    if len(tids) != len(tracks) or len({s["id"] for s in series}) != len(series):
        errors.append("duplicate label or series id")
    for item in items:
        item["areas"] = item.get("areas") or [item.get("track")]
        if not isinstance(item["areas"], list) or not item["areas"]:
            errors.append(f"{item['id']}: areas must be a nonempty list")
            continue
        item["track"] = item["areas"][0]
        if any(t not in tids for t in item["areas"]):
            errors.append(f"{item['id']}: missing or unknown label")
        parent = item.get("project")
        if parent and (parent not in by or by[parent]["kind"] != "project" or item["kind"] == "project"):
            errors.append(f"{item['id']}: unknown/invalid project {parent}")
        related = item.get("related", [])
        if not isinstance(related, list) or any(r not in by or r == item["id"] for r in related):
            errors.append(f"{item['id']}: unknown/invalid related item")
        if item["kind"] == "project" and item.get("status") not in ("active", "complete", "archived"):
            errors.append(f"{item['id']}: invalid status")
    for s in series:
        if not s.get("items") or len(set(s["items"])) != len(s["items"]) or any(i not in by for i in s["items"]):
            errors.append(f"series {s['id']}: missing, duplicate, or unknown item")
    if errors:
        raise ValueError("garden validation failed:\n  " + "\n  ".join(errors))
    urls = {unquote(i["url"]).rstrip("/"): i["id"] for i in items}
    if len(urls) != len(items):
        raise ValueError("duplicate garden URL")
    today = dt.date.today().isoformat()
    for item in items:
        if item.get("project"):
            item["areas"] = list(dict.fromkeys(item["areas"] + by[item["project"]]["areas"]))
        item["members"] = [i["id"] for i in sorted(items, key=lambda i: (i["date"], i["id"])) if i.get("project") == item["id"]]
        dates = [item["date"]] + [by[m]["date"] for m in item["members"]]
        item["tended"] = max([item["tended"]] + dates)
        if item["kind"] == "project":
            item["start"] = str(item.get("start") or min(dates))
            item["end"] = today if item.get("status") == "active" else str(item.get("end") or max(dates))
            if dt.date.fromisoformat(item["start"]) > dt.date.fromisoformat(item["end"]):
                raise ValueError(f"{item['id']}: start is after end")
        item["series"] = [{"id": s["id"], "pos": s["items"].index(item["id"]), "len": len(s["items"])} for s in series if item["id"] in s["items"]]
        links = set(item.get("related", []))
        for link in item.pop("internal_links", []):
            parsed = urlsplit(urljoin("https://tangemicioglu.com" + item["url"], link))
            if parsed.hostname in ("tangemicioglu.com", "www.tangemicioglu.com"):
                target = urls.get(unquote(parsed.path).rstrip("/"))
                if target and target != item["id"]:
                    links.add(target)
        item["links"] = sorted(links)
    for item in items:
        item["backlinks"] = [i["id"] for i in items if item["id"] in i["links"]]


def related_ids(item, by):
    """Apply the reviewed similarity threshold without duplicating explicit relations."""
    excluded = set(item["members"] + item["links"] + item["backlinks"] + [item.get("project")])
    return [iid for iid, score in zip(item["similar"], item["similar_s"])
            if iid not in excluded and (score >= .62 or (score >= .57 and set(item["areas"]) & set(by[iid]["areas"])))]


def build(root=ROOT, check=False, relayout=False):
    items, digest = read_items(root)
    tracks = yaml.safe_load((root / "_data/tracks.yml").read_text(encoding="utf-8"))
    series = yaml.safe_load((root / "_data/series.yml").read_text(encoding="utf-8"))
    relate(items, tracks, series)
    out = root / "_data/garden.json"
    old = json.loads(out.read_text(encoding="utf-8")) if out.exists() else {}
    if check:
        ids = {i["id"] for i in items}
        if old.get("meta", {}).get("input_digest") != digest or ids != {i["id"] for i in old.get("items", [])}:
            raise ValueError("garden.json is missing or stale; run python scripts/build_garden.py locally and commit its output")
        print(f"Garden data current: {len(items)} published items; labels and references valid.")
        return
    os.environ.setdefault("LOKY_MAX_CPU_COUNT", "8")
    import numpy as np
    from garden_embed import embeddings
    from garden_layout import positions
    texts = [f"{i['title']}\n{' '.join(i['tags'])}\n{i['excerpt']}\n{i['text']}"[:3000] for i in items]
    vectors = embeddings(texts, root / ".garden-cache")
    similarity = vectors @ vectors.T
    np.fill_diagonal(similarity, -1)
    previous = {} if relayout else {i["id"]: (i["x"], i["y"]) for i in old.get("items", [])}
    xy = positions(vectors, [i["id"] for i in items], previous)
    by = {i["id"]: i for i in items}
    for k, item in enumerate(items):
        neighbors = np.argsort(-similarity[k], kind="stable")[:min(5, len(items) - 1)]
        item["similar"] = [items[j]["id"] for j in neighbors]
        item["similar_s"] = [round(float(similarity[k, j]), 3) for j in neighbors]
        item["x"], item["y"] = [round(float(x), 4) for x in xy[k]]
        item.pop("text")
    for item in items:
        item["related_items"] = related_ids(item, by)
    today = dt.date.today().isoformat()
    meta = {"built": today, "epoch": old.get("meta", {}).get("epoch", today) if previous else today,
            "input_digest": digest, "model": "Alibaba-NLP/gte-modernbert-base"}
    out.write_text(json.dumps({"meta": meta, "tracks": tracks, "series": series, "items": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(items)} items, {len(series)} series, {len(tracks)} labels; retained {sum(i['id'] in previous for i in items)} positions.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate committed output without model dependencies")
    parser.add_argument("--relayout", action="store_true", help="Deliberately replace all map positions")
    args = parser.parse_args()
    try:
        build(check=args.check, relayout=args.relayout)
    except ValueError as error:
        parser.exit(1, str(error) + "\n")
