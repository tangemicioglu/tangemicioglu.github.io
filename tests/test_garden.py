"""Publication boundary, relations, and stable-layout regression tests."""
import copy
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from build_garden import read_items, relate, related_ids
from garden_layout import positions
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

    def test_similarity_threshold_and_explicit_deduplication(self):
        item = {"areas": ["a"], "members": ["member"], "project": "parent", "links": ["explicit"], "backlinks": [], "similar": ["weak", "same", "different", "strong", "member", "parent", "explicit"], "similar_s": [.569, .57, .61, .62, .9, .9, .9]}
        by = {key: {"areas": ["a" if key in ("same", "weak") else "b"]} for key in item["similar"]}
        self.assertEqual(related_ids(item, by), ["same", "strong"])

    def test_incremental_positions_do_not_move_even_with_one_anchor(self):
        vectors = np.array([[1., 0.], [.99, .01], [0., 1.]])
        old = {"one": (.125, -.7)}
        first = positions(vectors, ["one", "two", "three"], old)
        self.assertEqual(tuple(first[0]), old["one"])
        np.testing.assert_array_equal(first, positions(vectors, ["one", "two", "three"], old))
        all_old = dict(zip(["one", "two", "three"], first))
        np.testing.assert_array_equal(first, positions(vectors, ["one", "two", "three"], all_old))

    def test_uncommitted_and_explicitly_unpublished_files_excluded(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            def git(*args):
                subprocess.run(["git", "-C", tmp, *args], check=True, capture_output=True)
            git("init")
            (root / "_posts").mkdir()
            (root / "_data").mkdir()
            for name in ["tracks.yml", "series.yml"]:
                (root / "_data" / name).write_text("[]")
            template = '---\ntitle: Test\ndate: 2020-01-01\n{extra}---\nBody'
            (root / "_posts/2020-01-01-public.md").write_text(template.format(extra=''))
            (root / "_posts/2020-01-01-hidden.md").write_text(template.format(extra='published: false\n'))
            git("add", ".")
            git("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-m", "Fixture")
            (root / "_posts/2020-01-01-draft.md").write_text(template.format(extra=''))
            git("add", "_posts/2020-01-01-draft.md")
            items, _ = read_items(root)
            self.assertEqual([i["id"] for i in items], ["2020-01-01-public"])


if __name__ == "__main__":
    unittest.main()
