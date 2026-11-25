import numpy as np
from collections import defaultdict, deque


class IdentityMemory:

    def __init__(
        self,
        similarity_threshold=0.75,
        ambiguity_margin=0.08,
        max_prototypes=5,
        min_quality=0.60
    ):
        self.gallery = defaultdict(
            lambda: deque(maxlen=max_prototypes)
        )
        self.similarity_threshold = similarity_threshold
        self.ambiguity_margin = ambiguity_margin
        self.min_quality = min_quality

        print("ARGUS-X Identity Memory Initialized")

    def normalize(self, feature):
        feature = np.asarray(feature, dtype=np.float32)

        if feature.ndim != 1:
            raise ValueError("Feature must be a 1D vector")

        norm = np.linalg.norm(feature)

        if not np.isfinite(norm) or norm < 1e-12:
            raise ValueError("Invalid feature vector")

        return feature / norm

    def add(self, identity_id, feature, quality=1.0):
        if quality < self.min_quality:
            return False

        vector = self.normalize(feature)
        self.gallery[identity_id].append(vector)

        return True

    def score_candidates(self, feature):
        if not self.gallery:
            return []

        query = self.normalize(feature)
        scores = []

        for identity_id, prototypes in self.gallery.items():
            similarities = [
                float(np.dot(query, prototype))
                for prototype in prototypes
            ]

            scores.append((identity_id, max(similarities)))

        return sorted(
            scores,
            key=lambda item: item[1],
            reverse=True
        )

    def match(self, feature, exclude_ids=None):
        scores = [item for item in self.score_candidates(feature) if item[0] not in (exclude_ids or set())]

        if not scores:
            return None

        best_id, best_score = scores[0]
        second_score = scores[1][1] if len(scores) > 1 else -1.0

        if best_score < self.similarity_threshold:
            return None

        if best_score - second_score < self.ambiguity_margin:
            return None

        return {
            "identity_id": best_id,
            "similarity": round(best_score, 4),
            "status": "matched"
        }

    def get_identity_count(self):
        return len(self.gallery)


if __name__ == "__main__":
    memory = IdentityMemory()

    original = np.random.default_rng(42).normal(size=2048)
    memory.add(17, original)

    noise = np.random.default_rng(10).normal(
        0, 0.01, size=2048
    )

    result = memory.match(original + noise)

    print("Stored identities:", memory.get_identity_count())
    print("Recovery result:", result)

