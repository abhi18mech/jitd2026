import numpy as np
from collections import defaultdict, deque


class IdentityMemory:

    def __init__(
        self,
        similarity_threshold=0.80,
        ambiguity_margin=0.08,
        max_prototypes=10,
        min_quality=0.60,
        feature_dim=512,
        duplicate_threshold=0.995
    ):
        self.gallery = defaultdict(lambda: deque(maxlen=max_prototypes))
        self.similarity_threshold = similarity_threshold
        self.ambiguity_margin = ambiguity_margin
        self.min_quality = min_quality
        self.feature_dim = feature_dim
        self.duplicate_threshold = duplicate_threshold

        print("ARGUS-X Identity Memory Initialized")
        print("Feature dimensions:", self.feature_dim)
        print("Maximum prototypes:", max_prototypes)

    def normalize(self, feature):
        feature = np.asarray(feature, dtype=np.float32)

        if feature.ndim != 1 or feature.shape[0] != self.feature_dim:
            raise ValueError(
                f"Expected {self.feature_dim}-dimensional feature, "
                f"received {feature.shape}"
            )

        norm = np.linalg.norm(feature)

        if not np.isfinite(norm) or norm < 1e-12:
            raise ValueError("Invalid feature vector")

        return feature / norm

    def add(self, identity_id, feature, quality=1.0):

        if not np.isfinite(quality) or quality < self.min_quality:
            return False

        vector = self.normalize(feature)
        prototypes = self.gallery[identity_id]

        # Avoid storing nearly identical consecutive features.
        for prototype in prototypes:
            similarity = float(np.dot(vector, prototype))

            if similarity >= self.duplicate_threshold:
                return False

        prototypes.append(vector)
        return True

    def score_candidates(self, feature):

        if not self.gallery:
            return []

        query = self.normalize(feature)
        scores = []

        for identity_id, prototypes in self.gallery.items():

            similarities = np.array(
                [np.dot(query, prototype) for prototype in prototypes],
                dtype=np.float32
            )

            if len(similarities) == 0:
                continue

            maximum = float(np.max(similarities))
            average = float(np.mean(similarities))

            # Combine strongest appearance match and overall consistency.
            score = 0.7 * maximum + 0.3 * average

            scores.append((identity_id, score))

        return sorted(scores, key=lambda item: item[1], reverse=True)

    def match(self, feature, exclude_ids=None):

        excluded = exclude_ids or set()

        scores = [
            item for item in self.score_candidates(feature)
            if item[0] not in excluded
        ]

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

    rng = np.random.default_rng(42)

    original = rng.normal(size=512)
    memory.add(17, original)

    noise = rng.normal(0, 0.01, size=512)
    result = memory.match(original + noise)

    print("Stored identities:", memory.get_identity_count())
    print("Recovery result:", result)

    assert result is not None
    assert result["identity_id"] == 17

    # Duplicate protection
    duplicate_result = memory.add(17, original)
    assert duplicate_result is False

    print("Duplicate feature protection passed")

    # Quality validation
    low_quality_result = memory.add(18, original, quality=0.2)
    assert low_quality_result is False

    print("Low quality feature rejection passed")

    try:
        memory.add(18, np.zeros(2048))
        raise AssertionError("Incorrect feature dimensions were accepted")
    except ValueError:
        print("Incorrect feature dimensions rejected")

    print("IDENTITY MEMORY TEST PASSED")
