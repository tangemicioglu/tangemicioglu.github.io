"""Local text-hash embedding cache, adapted from Website-Garden's embed.py."""
import hashlib
import numpy as np

MODEL = "Alibaba-NLP/gte-modernbert-base"


def embeddings(texts, cache_dir):
    """Embed changed texts only; model loading/downloads never run in --check."""
    cache_dir.mkdir(exist_ok=True)
    cache_file = cache_dir / "embeddings.npz"
    hashes = [hashlib.sha256((MODEL + text).encode()).hexdigest() for text in texts]
    cache = {}
    if cache_file.exists():
        with np.load(cache_file, allow_pickle=False) as data:
            cache = dict(zip(data["hashes"], data["vectors"]))
    missing = sorted(set(hashes) - cache.keys())
    if missing:
        import torch
        from sentence_transformers import SentenceTransformer
        device = "cuda" if torch.cuda.is_available() else "cpu"
        options = {"torch_dtype": torch.float16} if device == "cuda" else {}
        try:
            model = SentenceTransformer(MODEL, device=device, model_kwargs=options, local_files_only=True)
        except OSError:
            model = SentenceTransformer(MODEL, device=device, model_kwargs=options)
        model.max_seq_length = 1024
        lookup = dict(zip(hashes, texts))
        vectors = model.encode([lookup[h] for h in missing], normalize_embeddings=True, convert_to_numpy=True, show_progress_bar=True).astype(np.float32)
        cache.update(zip(missing, vectors))
        np.savez(cache_file, hashes=np.array(list(cache)), vectors=np.stack(list(cache.values())))
    return np.stack([cache[h] for h in hashes]).astype(np.float32)
