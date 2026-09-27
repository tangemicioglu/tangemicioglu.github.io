# Garden data

The archive labels, project hubs, reading orders, Timeline, and Map use the
approved Website-Garden data and presentation. Jekyll only reads generated
JSON; no custom plugin or model download is needed by GitHub Pages.

The Projects archive at `/projects/` combines `_projects/` and `_explorations/`,
with a kind filter for each. Explorations are self-contained interactive essays,
small tools, and experiments; they are not a project maturity or quality level.
Use a short introduction, `teaser`, `date`, `areas`, and the existing `links`
list (for example, `[website, website, https://example.com/]`) for an
exploration. External resources use the existing link-tag styling. It receives
its own page, map marker, and timeline entry. ITR Atlas
remains a project; CYOAIF is the first exploration.

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
builds reuse text-hashed vectors in ignored `.garden-cache/`. Every build
recomputes the full map, so additions, removals, and text revisions can move
existing entries. A fixed random seed makes unchanged inputs repeatable within
the same dependency environment. `--relayout` remains accepted for compatibility
but is no longer needed.

The map uses primary memberships for group positions and overview headings.
Papers keep independent positions and remain visible at overview scale. Project
membership supplies connecting lines, not satellite placement.
Selecting any label highlights and fits all its members,
including secondary memberships. All labels remain available in the filters;
labels with no primary members have no overview heading. Group centres
are jointly fitted to member-to-member semantic affinities and non-overlap
constraints, using deterministic multiple-start optimization. Each group's members
find their best matches in the other group; the two directional averages receive
equal weight. Distances are normalized within each group's neighbour range, then
averaged symmetrically, so a group with generally lower similarity scores does not
become globally isolated. These relative distances set desired centre distances;
stronger neighbours receive more weight. A two-axis mean-embedding projection only
initializes the fit. There is no repulsion pass after the semantic fit. Group area
scales with item count; the accepted local item
arrangement stays fixed apart from group translations and a shared display scale.
This improves density balance at the cost of treating map distances as navigational
spacing rather than literal semantic distances. It does not assign importance or
centrality to larger groups. Group centres are then brought 6% closer together
uniformly, with a minimum boundary gap, preserving their relative ordering and
the arrangement of items inside each group. Generated layout metadata selects the
rendering mode; the freshness check also guards the selected layout version.

Automatic Related suggestions require cosine similarity of at least 0.70,
regardless of shared labels. Map edges reuse the same filtered suggestions.
Explicit page links, project membership and curated reading orders are preserved.

The three uncommitted 2026 writing drafts remain unpublished. When Tan publishes
the ITR Atlas introduction, add its ID to the end of `measuring-bcis` in
`_data/series.yml`. Keep unfinished drafts out of local Jekyll preview builds
as well; Jekyll itself does not know which files are committed.

Map fills the viewport below the site navigation. Map and Timeline link to the
regular archives when JavaScript is unavailable. The archives, sitemap, and
garden JSON provide access to the complete collection. Positions indicate
semantic similarity; explicit project membership and reading order provide
the authored connections.
