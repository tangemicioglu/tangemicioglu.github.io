# Garden data

The archive labels, project hubs, reading orders, Timeline, and Map use the
approved Website-Garden data and presentation. Jekyll only reads generated
JSON; no custom plugin or model download is needed by GitHub Pages.

## Update after a content change

1. Add `areas: [home-label, ...]` (or `track: home-label`) to the item's front
   matter. Labels are defined in `_data/tracks.yml`, in display order.
2. For projects, set `status: active`, `complete`, or `archived`. Optional
   `start`/`end` dates describe the actual work; `date` remains the posting date.
3. Papers and posts can name a `project` by its filename without the extension.
   Its secondary labels are inherited. `related: [item-id, ...]` adds explicit
   links. Use `_data/series.yml` for curated reading order.
4. **New content must be committed first.** The builder skips files that have
   never been committed, even when staged, and skips `published: false` and
   future-dated items. This keeps local writing drafts private. Do not push the
   content-only commit until the data update is ready as well.
5. Install local dependencies and rebuild:

   ```sh
   python -m pip install -r scripts/requirements-garden.txt
   python scripts/build_garden.py
   python scripts/build_garden.py --check
   python -m unittest discover -s tests
   ```

6. Commit `_data/garden.json` together with the content/metadata changes before
   pushing. CI checks source freshness and references with only PyYAML.

`short` provides a compact display title. `context` supplies provenance.
`tended` can explicitly mark substantive revisions; otherwise the latest item
or project-member date is used. `stage` is retained for future use but hidden.

The first local build can download `Alibaba-NLP/gte-modernbert-base`. Later
builds reuse text-hashed vectors in ignored `.garden-cache/`. Existing map
coordinates remain fixed, including when new content is added. Use
`python scripts/build_garden.py --relayout` only for a deliberate full redraw.

The three uncommitted 2026 writing drafts remain unpublished. When Tan publishes
the ITR Atlas introduction, add its ID to the end of `measuring-bcis` in
`_data/series.yml`. Keep unfinished drafts out of local Jekyll preview builds
as well; Jekyll itself does not know which files are committed.

Map fills the viewport below the site navigation. Map and Timeline link to the
regular archives when JavaScript is unavailable. The archives, sitemap, and
garden JSON provide access to the complete collection. Positions indicate
semantic similarity; explicit project membership and reading order provide
the authored connections.
