"""Publication boundary, relations, and content-driven layout regression tests."""
import copy
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from build_garden import read_items, relate, related_ids
from garden_layout import positions, multilevel_positions, primary_group_positions, _separate, _joint_group_centres, _compact_group_centres
import numpy as np


class GardenTests(unittest.TestCase):
    def setUp(self):
        self.tracks = [{"id": "a"}, {"id": "b"}]
        self.items = [
            {"id": "project", "kind": "project", "url": "/projects/project/", "areas": ["a", "b"], "status": "complete", "date": "2020-01-01", "tended": "2020-01-01"},
            {"id": "paper", "kind": "paper", "url": "/publications/paper/", "track": "a", "project": "project", "date": "2021-01-01", "tended": "2021-01-01", "internal_links": ["/projects/project/#methods", "https://other.test/projects/project/", "/projects/pro/"]},
        ]

    def test_hub_inheritance_reading_order_and_exact_backlinks(self):
        relate(self.items, self.tracks, [{"id": "sequence", "items": ["project", "paper"]}])
        project, paper = self.items
        self.assertEqual(paper["areas"], ["a", "b"])
        self.assertEqual(project["members"], ["paper"])
        self.assertEqual(project["end"], "2021-01-01")
        self.assertEqual(paper["links"], ["project"])
        self.assertEqual(project["backlinks"], ["paper"])
        self.assertEqual(paper["series"][0]["pos"], 1)

    def test_invalid_references_fail(self):
        for field, value in [("areas", ["unknown"]), ("project", "missing"), ("related", ["missing"])]:
            items = copy.deepcopy(self.items)
            items[1][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                relate(items, self.tracks, [])
        with self.assertRaises(ValueError):
            relate(copy.deepcopy(self.items), self.tracks, [{"id": "s", "items": ["unpublished"]}])

    def test_similarity_does_not_create_authored_relationships(self):
        self.items[0]["similar"] = ["paper"]
        self.items[0]["similar_s"] = [.999]
        self.items[1].pop("internal_links")
        self.items[1].pop("project")
        relate(self.items, self.tracks, [])
        for item in self.items:
            self.assertEqual(item["links"], [])
            self.assertEqual(item["backlinks"], [])

    def test_related_cutoff_excludes_weak_matches_and_authored_duplicates(self):
        item = {"id": "stove", "members": ["member"], "links": ["explicit"], "backlinks": [],
                "similar": ["silentspeller", "below", "at", "strong", "member", "explicit"],
                "similar_s": [.661, .699, .7, .85, .99, .99]}
        self.assertEqual(related_ids(item), ["at", "strong"])

    def test_layout_repeatable_but_updates_existing_entries_with_content(self):
        vectors = np.random.default_rng(42).normal(size=(12, 8)).astype(np.float32)
        vectors /= np.linalg.norm(vectors, axis=1, keepdims=True)
        first = positions(vectors)
        np.testing.assert_array_equal(first, positions(vectors))
        self.assertTrue(np.isfinite(first).all())
        reduced = positions(vectors[:-1])
        self.assertFalse(np.allclose(first[:-1], reduced), "Adding an item must refit existing entries")
        revised = vectors.copy()
        revised[0] = -revised[0]
        self.assertFalse(np.allclose(first, positions(revised)), "Revised content must affect the map")

    def test_small_collections_have_finite_positions(self):
        for count in range(4):
            xy = positions(np.ones((count, 8)))
            self.assertEqual(xy.shape, (count, 2))
            self.assertTrue(np.isfinite(xy).all())

    def test_multilevel_layout_uses_secondary_labels_and_keeps_papers_independent(self):
        items = [{"id": "p", "areas": ["a"]}, {"id": "paper", "areas": ["a"], "project": "p"},
                 {"id": "other", "areas": ["b"]}, {"id": "bridge", "areas": ["a", "b"]},
                 {"id": "last", "areas": ["c"]}]
        vectors = np.random.default_rng(7).normal(size=(5, 8))
        vectors /= np.linalg.norm(vectors, axis=1, keepdims=True)
        semantic = np.array([[-1., 0.], [-.5, .2], [1., 0.], [.5, 1.], [0., -1.]])
        tracks = [{"id": label} for label in "abc"]
        with patch("garden_layout.positions", return_value=semantic):
            first = multilevel_positions(vectors, items, tracks)
            self.assertTrue(np.isfinite(first).all())
            np.testing.assert_array_equal(first, multilevel_positions(vectors, items, tracks))
            changed = copy.deepcopy(items)
            changed[3]["areas"] = ["a"]
            self.assertFalse(np.allclose(first, multilevel_positions(vectors, changed, tracks)))
            # Parent relationships must not override a paper's semantic position.
            independent = copy.deepcopy(items)
            independent[1].pop("project")
            np.testing.assert_allclose(first, multilevel_positions(vectors, independent, tracks))
            reordered = copy.deepcopy(items)
            reordered[3]["areas"].reverse()
            np.testing.assert_allclose(first, multilevel_positions(vectors, reordered, tracks))
            np.testing.assert_allclose(first, multilevel_positions(vectors, items, tracks[::-1]))
            self.assertGreater(np.linalg.norm(first[0] - first[1]), 0)
            primary = multilevel_positions(vectors, items, tracks, primary_influence=.6)
            self.assertFalse(np.allclose(first, primary))
            self.assertFalse(np.allclose(primary, multilevel_positions(vectors, reordered, tracks, primary_influence=.6)))
            # Unused label columns must not shift the primary-label lookup.
            np.testing.assert_allclose(primary, multilevel_positions(vectors, items, [{"id": "unused"}] + tracks, primary_influence=.6))

    def test_multilevel_empty_and_single_label_fallback(self):
        self.assertEqual(multilevel_positions(np.zeros((0, 8)), [], []).shape, (0, 2))
        semantic = np.array([[0., 0.], [1., 0.], [0., 1.], [1., 1.]])
        with patch("garden_layout.positions", return_value=semantic):
            xy = multilevel_positions(np.ones((4, 8)), [{"areas": ["a"]} for _ in range(4)], [{"id": "a"}])
            np.testing.assert_array_equal(xy, semantic)

    def test_primary_only_ignores_secondary_groups_and_keeps_items_separate(self):
        items = [{"areas": ["a", "secondary"]} for _ in range(6)] + [{"areas": ["b"]} for _ in range(3)]
        rng = np.random.default_rng(9)
        vectors = rng.normal(size=(9, 8))
        vectors /= np.linalg.norm(vectors, axis=1, keepdims=True)
        semantic = rng.normal(size=(9, 2))
        tracks = [{"id": label} for label in ["a", "secondary", "b"]]
        with patch("garden_layout.positions", return_value=semantic):
            xy = primary_group_positions(vectors, items, tracks)
            np.testing.assert_array_equal(xy, primary_group_positions(vectors, items, tracks))
            stripped = [{"areas": [item["areas"][0]]} for item in items]
            np.testing.assert_allclose(xy, primary_group_positions(vectors, stripped, tracks))
            np.testing.assert_allclose(xy, primary_group_positions(vectors, stripped, [tracks[0], tracks[2]]))
            d = np.linalg.norm(xy[:, None] - xy[None], axis=2)
            np.fill_diagonal(d, np.inf)
            self.assertGreater(d.min(), .04)
            self.assertTrue(np.isfinite(xy).all())

    def test_density_spacing_handles_coincident_points(self):
        xy = _separate(np.zeros((8, 2)), np.full((8, 8), .17), radius=.4)
        d = np.linalg.norm(xy[:, None] - xy[None], axis=2)
        np.fill_diagonal(d, np.inf)
        self.assertGreater(d.min(), .169)
        self.assertLessEqual(np.linalg.norm(xy, axis=1).max(), .40001)

    def test_joint_group_layout_keeps_close_semantics_close_without_overlap(self):
        means = np.array([[1., 0., 0.], [.995, .1, 0.], [0., 1., 0.], [0., 0., 1.]], dtype=np.float32)
        means /= np.linalg.norm(means, axis=1, keepdims=True)
        initial = np.array([[0., 0.], [4., 4.], [0., 1.], [1., 0.]], dtype=np.float32)
        radii = np.full(4, .2)
        xy = _joint_group_centres(means @ means.T, radii, initial)
        d = np.linalg.norm(xy[:, None] - xy[None], axis=2)
        np.fill_diagonal(d, np.inf)
        self.assertGreaterEqual(d.min(), .62 - 1e-5)
        self.assertEqual(d[0].argmin(), 1)
        self.assertEqual(d[1].argmin(), 0)
        self.assertLess(d[0, 1], np.linalg.norm(initial[0] - initial[1]))
        np.testing.assert_allclose(xy, _joint_group_centres(means @ means.T, radii, initial))

    def test_cluster_tightening_preserves_order_and_spacing(self):
        centres = np.array([[0., 0.], [1., 0.], [0., 1.]])
        radii = np.full(3, .2)
        compact = _compact_group_centres(centres, radii)
        a, b = np.triu_indices(3, 1)
        before = np.linalg.norm(centres[a] - centres[b], axis=1)
        after = np.linalg.norm(compact[a] - compact[b], axis=1)
        np.testing.assert_allclose(after / before, .94)
        self.assertTrue(np.all(after >= radii[a] + radii[b] + .14))
        tight = _compact_group_centres(np.array([[0., 0.], [.55, 0.]]), radii[:2])
        self.assertGreaterEqual(np.linalg.norm(tight[1] - tight[0]), .54 - 1e-9)

    def test_uncommitted_and_explicitly_unpublished_files_excluded(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            def git(*args):
                subprocess.run(["git", "-C", tmp, *args], check=True, capture_output=True)
            git("init")
            (root / "_posts").mkdir()
            (root / "_explorations").mkdir()
            (root / "_data").mkdir()
            for name in ["tracks.yml", "series.yml"]:
                (root / "_data" / name).write_text("[]")
            template = '---\ntitle: Test\ndate: 2020-01-01\n{extra}---\nBody'
            (root / "_posts/2020-01-01-public.md").write_text(template.format(extra=''))
            (root / "_posts/2020-01-01-hidden.md").write_text(template.format(extra='published: false\n'))
            (root / "_explorations/interactive.md").write_text(template.format(extra='areas: [a]\nlinks: [[website, website, https://example.test/]]\n'))
            (root / "_explorations/hidden.md").write_text(template.format(extra='published: false\n'))
            git("add", ".")
            git("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-m", "Fixture")
            (root / "_posts/2020-01-01-draft.md").write_text(template.format(extra=''))
            git("add", "_posts/2020-01-01-draft.md")
            (root / "_explorations/draft.md").write_text(template.format(extra=''))
            git("add", "_explorations/draft.md")
            items, _ = read_items(root)
            self.assertEqual([i["id"] for i in items], ["interactive", "2020-01-01-public"])
            exploration = items[0]
            self.assertEqual(exploration["kind"], "exploration")
            self.assertEqual(exploration["url"], "/explorations/interactive/")
            self.assertEqual(exploration["resource_links"], [["website", "website", "https://example.test/"]])
            self.assertEqual(exploration["areas"], ["a"])


if __name__ == "__main__":
    unittest.main()
