"""Recompute the site's semantic map from the full current collection."""
import numpy as np

CLUSTER_SPACING = .94


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


def multilevel_positions(vectors, items, tracks, primary_influence=0):
    """Combine overlapping label neighbourhoods with individual semantic detail.

    All members shape their labels equally, including secondary labels and papers.
    Label distances combine membership overlap and mean member embeddings.
    Classical MDS places labels; each item starts between its label anchors.
    Its centred semantic-map offset supplies detail inside that coarse layout.
    primary_influence optionally reserves part of each item's placement weight
    for its first label; the rest is shared equally across all memberships.
    Labels do not receive importance, size, or centrality weights.
    """
    semantic = positions(vectors)
    if len(items) < 4:
        return semantic
    membership = np.array([[float(t["id"] in item["areas"]) for t in tracks] for item in items])
    active = membership.sum(axis=0) > 0
    labels = [t["id"] for t, used in zip(tracks, active) if used]
    membership = membership[:, active]
    if membership.shape[1] < 2:
        return semantic
    counts = membership.sum(axis=0)
    shares = membership / membership.sum(axis=1, keepdims=True)
    if not 0 <= primary_influence <= 1:
        raise ValueError("primary_influence must be between 0 and 1")
    shares *= 1 - primary_influence
    shares[np.arange(len(items)), [labels.index(item["areas"][0]) for item in items]] += primary_influence
    label_vectors = membership.T @ vectors / counts[:, None]
    label_vectors /= np.maximum(1e-9, np.linalg.norm(label_vectors, axis=1, keepdims=True))
    content_distance = np.sqrt(np.maximum(0, 2 - 2 * np.clip(label_vectors @ label_vectors.T, -1, 1)))
    # Rescale to match Jaccard's range without making every item pair equally far.
    content_distance /= max(1e-9, content_distance.max())
    intersection = membership.T @ membership
    overlap_distance = 1 - intersection / (counts[:, None] + counts[None] - intersection)
    distances = .5 * content_distance + .5 * overlap_distance
    np.fill_diagonal(distances, 0)
    centering = np.eye(len(counts)) - np.ones((len(counts), len(counts))) / len(counts)
    gram = -.5 * centering @ distances ** 2 @ centering
    values, axes = np.linalg.eigh(gram)
    top = np.argsort(values)[-2:][::-1]
    anchors = axes[:, top] * np.sqrt(np.maximum(0, values[top]))
    targets = shares @ anchors
    targets -= targets.mean(axis=0)
    # Orient the coarse map against the semantic map to avoid arbitrary flips.
    semantic = semantic - semantic.mean(axis=0)
    u, _, vt = np.linalg.svd(targets.T @ semantic)
    targets = targets @ (u @ vt)
    label_semantic_centres = membership.T @ semantic / counts[:, None]
    residual = semantic - shares @ label_semantic_centres
    residual -= residual.mean(axis=0)
    coarse_scale = np.sqrt(np.mean(np.sum(targets ** 2, axis=1)))
    detail_scale = np.sqrt(np.mean(np.sum(residual ** 2, axis=1)))
    if coarse_scale < 1e-9:
        return semantic
    xy = targets + .2 * coarse_scale / max(1e-9, detail_scale) * residual
    xy -= np.median(xy, axis=0)
    xy /= max(1e-9, np.percentile(np.linalg.norm(xy, axis=1), 98))
    return xy


def _separate(points, gaps, radius=None):
    """Resolve overlaps deterministically, optionally inside a local group disk."""
    points = points.copy()
    for _ in range(400):
        largest = 0
        for a in range(len(points)):
            for b in range(a + 1, len(points)):
                delta = points[b] - points[a]
                distance = np.linalg.norm(delta)
                overlap = gaps[a, b] - distance
                if overlap <= 1e-5:
                    continue
                if distance < 1e-9:
                    angle = (a * 31 + b * 17) * 2.399963
                    direction = np.array([np.cos(angle), np.sin(angle)])
                else:
                    direction = delta / distance
                move = direction * overlap * .51
                points[a] -= move
                points[b] += move
                largest = max(largest, overlap)
        if radius is not None:
            norms = np.linalg.norm(points, axis=1, keepdims=True)
            points *= np.minimum(1, radius / np.maximum(norms, 1e-9))
        if largest < 1e-4:
            break
    return points


def _group_affinity(vectors, groups):
    """Average each member's best cross-group match, equally in both directions."""
    affinity = np.eye(len(groups))
    for a in range(len(groups)):
        for b in range(a + 1, len(groups)):
            similarities = vectors[groups[a]] @ vectors[groups[b]].T
            score = .5 * (similarities.max(axis=0).mean() + similarities.max(axis=1).mean())
            affinity[a, b] = affinity[b, a] = score
    return affinity


def _joint_group_centres(affinity, radii, initial):
    """Fit full-dimensional group relationships with non-overlap constraints.

    Semantic distance determines the desired distance between group centres.
    Relative distance error gives strong neighbours priority without discarding
    other relationships. Multiple seeded starts reduce packing-order artefacts.
    There is no subsequent repulsion pass that can undo the semantic fit.
    """
    if len(affinity) < 2:
        return initial.copy()
    from scipy.optimize import minimize
    affinity = np.asarray(affinity, dtype=np.float64)
    radii = np.asarray(radii, dtype=np.float64)
    initial = np.asarray(initial, dtype=np.float64)
    n = len(affinity)
    a, b = np.triu_indices(n, 1)
    semantic = np.sqrt(np.maximum(0, 2 - 2 * np.clip(affinity, -1, 1)))
    # Compare each group's neighbours on its own scale: broadly lower text
    # scores must not exile an entire group from all of its closest neighbours.
    low = np.where(np.eye(n, dtype=bool), np.inf, semantic).min(axis=1)
    high = np.where(np.eye(n, dtype=bool), -np.inf, semantic).max(axis=1)
    spread = high - low
    directional = np.where(spread[:, None] > 1e-9,
                           (semantic - low[:, None]) / np.maximum(spread[:, None], 1e-9), .5)
    relative = ((directional + directional.T) * .5)[a, b]
    minimum = radii[a] + radii[b] + .22
    target = minimum.max() * (.85 + 1.8 * relative)
    weights = 1 / target ** 2
    weights /= weights.sum()

    def geometry(flat):
        points = flat.reshape(n, 2)
        delta = points[a] - points[b]
        distance = np.maximum(1e-9, np.linalg.norm(delta, axis=1))
        return distance, delta / distance[:, None]

    def objective(flat):
        distance, direction = geometry(flat)
        error = distance - target
        gradient = np.zeros((n, 2))
        force = (2 * weights * error)[:, None] * direction
        np.add.at(gradient, a, force)
        np.add.at(gradient, b, -force)
        return np.sum(weights * error ** 2), gradient.ravel()

    def constraints(flat):
        return geometry(flat)[0] - minimum

    def constraint_jacobian(flat):
        direction = geometry(flat)[1]
        jacobian = np.zeros((len(a), n, 2))
        jacobian[np.arange(len(a)), a] = direction
        jacobian[np.arange(len(a)), b] = -direction
        return jacobian.reshape(len(a), n * 2)

    gaps = radii[:, None] + radii[None, :] + .22
    seed = _separate(initial, gaps)
    candidates = [seed]
    rng = np.random.default_rng(42)
    starts = [seed] + [rng.normal(size=(n, 2)) for _ in range(7)]
    for start in starts:
        result = minimize(objective, start.ravel(), jac=True, method="SLSQP",
                          constraints={"type": "ineq", "fun": constraints, "jac": constraint_jacobian},
                          options={"maxiter": 400, "ftol": 1e-10})
        if np.isfinite(result.x).all() and constraints(result.x).min() >= -1e-5:
            candidates.append(result.x.reshape(n, 2))
    feasible = [candidate for candidate in candidates if constraints(candidate.ravel()).min() >= -1e-5]
    if not feasible:
        raise ValueError("Could not fit non-overlapping group centres")
    centres = min(feasible, key=lambda candidate: objective(candidate.ravel())[0])
    centres = centres - centres.mean(axis=0)
    u, _, vt = np.linalg.svd(centres.T @ (initial - initial.mean(axis=0)))
    return centres @ (u @ vt)


def _compact_group_centres(centres, radii):
    """Tighten the reviewed arrangement uniformly while preserving a clear gap."""
    if len(centres) < 2:
        return centres.copy()
    a, b = np.triu_indices(len(centres), 1)
    distances = np.linalg.norm(centres[a] - centres[b], axis=1)
    safe_scale = np.max((radii[a] + radii[b] + .14) / np.maximum(distances, 1e-9))
    scale = min(1., max(CLUSTER_SPACING, safe_scale))
    origin = centres.mean(axis=0)
    return origin + scale * (centres - origin)


def primary_group_positions(vectors, items, tracks):
    """Lay out primary-label groups with comparable density and independent items.

    Group centres jointly fit member-to-member affinities and non-overlap.
    Group disk area scales with item count; local item spacing is unchanged.
    Secondary memberships never affect this variant. Within each group, the
    semantic layout supplies the initial relative arrangement, not paper orbits.
    """
    semantic = positions(vectors)
    if not items:
        return semantic
    groups = [[k for k, item in enumerate(items) if item["areas"][0] == t["id"]] for t in tracks]
    groups = [group for group in groups if group]
    means = np.stack([vectors[group].mean(axis=0) for group in groups])
    means /= np.maximum(1e-9, np.linalg.norm(means, axis=1, keepdims=True))
    centred = means - means.mean(axis=0)
    _, _, vt = np.linalg.svd(centred, full_matrices=False)
    anchors = centred @ vt[:2].T
    if anchors.shape[1] < 2:
        anchors = np.pad(anchors, ((0, 0), (0, 2 - anchors.shape[1])))
    anchors /= max(1e-9, np.max(np.linalg.norm(anchors, axis=1)))
    anchors *= 1.2
    semantic_centres = np.stack([semantic[group].mean(axis=0) for group in groups])
    u, _, vt = np.linalg.svd(anchors.T @ (semantic_centres - semantic_centres.mean(axis=0)))
    anchors = anchors @ (u @ vt)
    radii = .14 * np.sqrt([len(group) for group in groups])
    # More items get more area, not greater centrality.
    anchors = _joint_group_centres(_group_affinity(vectors, groups), radii, anchors)
    anchors = _compact_group_centres(anchors, radii)
    xy = np.zeros((len(items), 2))
    for anchor, group, radius in zip(anchors, groups, radii):
        local = semantic[group] - semantic[group].mean(axis=0)
        extent = np.max(np.linalg.norm(local, axis=1))
        if extent > 1e-9:
            local *= .8 * radius / extent
        local = _separate(local, np.full((len(group), len(group)), .17), radius=radius)
        xy[group] = anchor + local
    xy -= (xy.max(axis=0) + xy.min(axis=0)) / 2
    xy /= max(1e-9, np.max(np.linalg.norm(xy, axis=1)))
    return xy
