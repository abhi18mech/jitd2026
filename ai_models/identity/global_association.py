import numpy as np
from scipy.optimize import linear_sum_assignment


class GlobalIdentityAssociation:

    def __init__(
        self,
        similarity_threshold=0.80,
        ambiguity_margin=0.08,
        feature_dim=512,
        max_similarity_weight=0.7,
        average_similarity_weight=0.3
    ):
        self.similarity_threshold = similarity_threshold
        self.ambiguity_margin = ambiguity_margin
        self.feature_dim = feature_dim
        self.max_similarity_weight = max_similarity_weight
        self.average_similarity_weight = average_similarity_weight

        if not np.isclose(
            max_similarity_weight + average_similarity_weight, 1.0
        ):
            raise ValueError("Similarity weights must sum to 1.0")

        print("ARGUS-X Global Identity Association Initialized")
        print("Feature dimensions:", self.feature_dim)

    def _normalize(self, feature):
        feature = np.asarray(feature, dtype=np.float32)

        if feature.shape != (self.feature_dim,):
            raise ValueError(
                f"Expected {self.feature_dim} features, "
                f"received {feature.shape}"
            )

        if not np.all(np.isfinite(feature)):
            raise ValueError("Feature contains invalid values")

        norm = np.linalg.norm(feature)

        if norm < 1e-12:
            raise ValueError("Feature vector has zero magnitude")

        return feature / norm

    def associate(
        self,
        track_features,
        identity_gallery,
        active_identity_ids=None,
        reserved_identity_owners=None
    ):
        active_identity_ids = active_identity_ids or set()
        reserved_identity_owners = reserved_identity_owners or {}

        available_ids = [
            identity_id
            for identity_id in identity_gallery
            if identity_id not in active_identity_ids
        ]

        track_ids = list(track_features.keys())

        if not track_ids or not available_ids:
            return {}, track_ids

        normalized_tracks = {}

        for track_id, feature in track_features.items():
            normalized_tracks[track_id] = self._normalize(feature)

        normalized_gallery = {}

        for identity_id in available_ids:
            prototypes = identity_gallery[identity_id]

            valid_prototypes = [
                self._normalize(prototype)
                for prototype in prototypes
            ]

            if valid_prototypes:
                normalized_gallery[identity_id] = valid_prototypes

        available_ids = list(normalized_gallery.keys())

        if not available_ids:
            return {}, track_ids

        similarity_matrix = np.full(
            (len(track_ids), len(available_ids)),
            -1.0,
            dtype=np.float32
        )

        for i, track_id in enumerate(track_ids):

            feature = normalized_tracks[track_id]

            for j, identity_id in enumerate(available_ids):

                owner = reserved_identity_owners.get(identity_id)

                if owner is not None and owner != track_id:
                    continue

                similarities = [
                    float(np.dot(feature, prototype))
                    for prototype in normalized_gallery[identity_id]
                ]

                maximum = max(similarities)
                average = float(np.mean(similarities))

                score = (
                    self.max_similarity_weight * maximum
                    + self.average_similarity_weight * average
                )

                similarity_matrix[i, j] = score

        rows, cols = linear_sum_assignment(-similarity_matrix)

        assignments = {}
        matched_tracks = set()

        for row, col in zip(rows, cols):

            track_id = track_ids[row]
            identity_id = available_ids[col]
            score = float(similarity_matrix[row, col])

            if score < self.similarity_threshold:
                continue

            valid_scores = np.sort(
                similarity_matrix[row][
                    similarity_matrix[row] >= 0
                ]
            )[::-1]

            second_score = (
                float(valid_scores[1])
                if len(valid_scores) > 1 else -1.0
            )

            if score - second_score < self.ambiguity_margin:
                print(
                    f"AMBIGUOUS MATCH REJECTED | "
                    f"Tracker {track_id} | Identity {identity_id} | "
                    f"Best {score:.4f} | Second {second_score:.4f}"
                )
                continue

            assignments[track_id] = {
                "identity_id": identity_id,
                "similarity": round(score, 4),
                "second_similarity": round(second_score, 4),
                "status": "RECOVERED"
            }

            matched_tracks.add(track_id)

        unmatched_tracks = [
            track_id
            for track_id in track_ids
            if track_id not in matched_tracks
        ]

        return assignments, unmatched_tracks


if __name__ == "__main__":

    rng = np.random.default_rng(42)

    identity_a = rng.normal(size=512)
    identity_a /= np.linalg.norm(identity_a)

    gallery = {1: [identity_a]}

    associator = GlobalIdentityAssociation()

    assignments, unmatched = associator.associate(
        {101: identity_a.copy()},
        gallery
    )

    assert assignments[101]["identity_id"] == 1
    assert assignments[101]["status"] == "RECOVERED"
    assert unmatched == []

    print("Basic identity assignment passed")

    # Reservation protection
    assignments, unmatched = associator.associate(
        {101: identity_a.copy(), 102: identity_a.copy()},
        gallery,
        reserved_identity_owners={1: 101}
    )

    assert 101 in assignments
    assert 102 in unmatched

    print("Identity reservation test passed")

    # Invalid feature validation
    try:
        associator.associate(
            {103: np.zeros(2048)},
            gallery
        )
        raise AssertionError("Invalid feature was accepted")
    except ValueError:
        print("Invalid feature validation passed")

    print("GLOBAL ASSOCIATION TEST PASSED")
