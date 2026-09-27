"""Recompute the site's semantic map from the full current collection."""
import numpy as np


def positions(vectors):
    """Fit all current embeddings; a fixed seed makes unchanged inputs repeatable."""
    if len(vectors) < 4:
        xy = np.zeros((len(vectors), 2))
        xy[:, 0] = np.arange(len(vectors)) * .2
        return xy
    import umap
    xy = umap.UMAP(n_neighbors=min(8, len(vectors) - 1), min_dist=.3, metric="cosine", random_state=42, n_jobs=1).fit_transform(vectors)
    xy -= np.median(xy, axis=0)
    xy /= max(1e-9, np.percentile(np.linalg.norm(xy, axis=1), 98))
    radius = np.linalg.norm(xy, axis=1, keepdims=True)
    clamped = np.where(radius > 1.05, 1.05 + .12 * np.log1p(np.maximum(0, radius - 1.05) / .12), radius)
    return xy * clamped / np.maximum(radius, 1e-9)
