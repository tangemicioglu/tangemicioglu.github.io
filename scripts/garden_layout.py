"""Website-Garden's UMAP and stable neighbor-medoid placement, scoped to the site."""
import hashlib
import numpy as np


def positions(vectors, ids, previous):
    """Keep existing coordinates exactly; place new items beside semantic neighbors."""
    have = [k for k, iid in enumerate(ids) if iid in previous]
    new = [k for k, iid in enumerate(ids) if iid not in previous]
    xy = np.zeros((len(ids), 2))
    if not have:
        if len(ids) < 4:
            xy[:, 0] = np.arange(len(ids)) * .2
            return xy
        import umap
        xy = umap.UMAP(n_neighbors=min(8, len(ids) - 1), min_dist=.3, metric="cosine", random_state=42).fit_transform(vectors)
        xy -= np.median(xy, axis=0)
        xy /= max(1e-9, np.percentile(np.linalg.norm(xy, axis=1), 98))
        radius = np.linalg.norm(xy, axis=1, keepdims=True)
        clamped = np.where(radius > 1.05, 1.05 + .12 * np.log1p(np.maximum(0, radius - 1.05) / .12), radius)
        return xy * clamped / np.maximum(radius, 1e-9)
    for k in have:
        xy[k] = previous[ids[k]]
    distances = np.linalg.norm(xy[have, None] - xy[None, have], axis=2)
    np.fill_diagonal(distances, np.inf)
    spacing = max(.025, float(np.median(distances.min(1)))) if len(have) > 1 else .1
    for k in new:
        scores = vectors[have] @ vectors[k]
        neighbors = np.argsort(-scores, kind="stable")[:min(5, len(have))]
        weights = np.exp((scores[neighbors] - scores[neighbors].max()) / .02)
        weights /= weights.sum()
        points = xy[[have[j] for j in neighbors]]
        costs = (np.linalg.norm(points[:, None] - points[None], axis=2) * weights[None]).sum(1)
        angle = int(hashlib.sha1(ids[k].encode()).hexdigest()[:8], 16) / 0xFFFFFFFF * 2 * np.pi
        xy[k] = points[np.argmin(costs)] + .6 * spacing * np.array([np.cos(angle), np.sin(angle)])
        have.append(k)
    return xy
