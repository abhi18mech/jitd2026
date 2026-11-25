import numpy as np
from scipy.optimize import linear_sum_assignment


class GlobalIdentityAssociation:

    def __init__(
        self,
        similarity_threshold=0.80,
        ambiguity_margin=0.08,
        feature_dim=512
    ):
        self.similarity_threshold = similarity_threshold
        self.ambiguity_margin = ambiguity_margin
        self.feature_dim = feature_dim

        print("ARGUS-X Global Identity Association Initialized")
        print("Feature dimensions:", self.feature_dim)

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

        similarity_matrix = np.full(
            (len(track_ids), len(available_ids)),
            -1.0,
            dtype=np.float32
        )

        for i, track_id in enumerate(track_ids):
            feature = np.asarray(
                track_features[track_id],
                dtype=np.float32
            )

            if feature.shape != (self.feature_dim,):
                raise ValueError(
                    f"Tracker {track_id}: expected {self.feature_dim} "
                    f"features, received {feature.shape}"
                )

            norm = np.linalg.norm(feature)

            if not np.isfinite(norm) or norm < 1e-12:
                continue

            feature = feature / norm

            for j, identity_id in enumerate(available_ids):
                owner = reserved_identity_owners.get(identity_id)

                if owner is not None and owner != track_id:
                    continue

                scores = []

                for prototype in identity_gallery[identity_id]:
                    prototype = np.asarray(
                        prototype,
                        dtype=np.float32
                    )

                    if prototype.shape != (self.feature_dim,):
                        raise ValueError(
                            f"Identity {identity_id}: expected "
                            f"{self.feature_dim} features, "
                            f"received {prototype.shape}"
                        )

                    prototype_norm = np.linalg.norm(prototype)

                    if not np.isfinite(prototype_norm) or prototype_norm < 1e-12:
                        continue

                    prototype = prototype / prototype_norm
                    scores.append(float(np.dot(feature, prototype)))

                if scores:
                    similarity_matrix[i, j] = max(scores)

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
                similarity_matrix[row][similarity_matrix[row] >= 0]
            )[::-1]

            second_score = (
                float(valid_scores[1])
                if len(valid_scores) > 1 else -1.0
            )

            ambiguous = score - second_score < self.ambiguity_margin

            status = (
                "AMBIGUOUS_CANDIDATE"
                if ambiguous else "RECOVERED"
            )

            if ambiguous:
                print(
                    f"AMBIGUOUS CANDIDATE RETAINED | "
                    f"Tracker {track_id} | Identity {identity_id} | "
                    f"Best {score:.4f} | Second {second_score:.4f}"
                )

            assignments[track_id] = {
                "identity_id": identity_id,
                "similarity": round(score, 4),
                "second_similarity": round(second_score, 4),
                "status": status
            }

            matched_tracks.add(track_id)

        unmatched_tracks = [
            track_id for track_id in track_ids
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

    print("Assignments:", assignments)
    print("Unmatched:", unmatched)

    print("GLOBAL ASSOCIATION TEST PASSED")
