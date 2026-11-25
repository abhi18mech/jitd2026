import numpy as np
from scipy.optimize import linear_sum_assignment


class GlobalIdentityAssociation:

    def __init__(
        self,
        similarity_threshold=0.80,
        ambiguity_margin=0.08
    ):
        self.similarity_threshold = similarity_threshold
        self.ambiguity_margin = ambiguity_margin

        print("ARGUS-X Global Identity Association Initialized")

    def associate(
        self,
        track_features,
        identity_gallery,
        active_identity_ids=None
    ):
        active_identity_ids = active_identity_ids or set()

        available_ids = [
            identity_id
            for identity_id in identity_gallery
            if identity_id not in active_identity_ids
        ]

        track_ids = list(track_features.keys())

        if not track_ids or not available_ids:
            return {}, track_ids

        similarity_matrix = np.zeros(
            (len(track_ids), len(available_ids)),
            dtype=np.float32
        )

        for i, track_id in enumerate(track_ids):

            feature = np.asarray(
                track_features[track_id],
                dtype=np.float32
            )

            feature_norm = np.linalg.norm(feature)

            if feature_norm < 1e-12:
                continue

            feature = feature / feature_norm

            for j, identity_id in enumerate(available_ids):

                prototypes = identity_gallery[identity_id]

                scores = []

                for prototype in prototypes:

                    prototype = np.asarray(
                        prototype,
                        dtype=np.float32
                    )

                    norm = np.linalg.norm(prototype)

                    if norm < 1e-12:
                        continue

                    prototype = prototype / norm

                    scores.append(
                        float(np.dot(feature, prototype))
                    )

                if scores:
                    similarity_matrix[i, j] = max(scores)

        # Hungarian assignment maximizes total similarity.
        rows, cols = linear_sum_assignment(
            -similarity_matrix
        )

        assignments = {}
        matched_tracks = set()

        for row, col in zip(rows, cols):

            track_id = track_ids[row]
            identity_id = available_ids[col]

            score = float(similarity_matrix[row, col])

            row_scores = np.sort(similarity_matrix[row])[::-1]

            second_score = (
                float(row_scores[1])
                if len(row_scores) > 1 else -1.0
            )

            if score < self.similarity_threshold:
                continue

            if score - second_score < self.ambiguity_margin:
                continue

            assignments[track_id] = {
                "identity_id": identity_id,
                "similarity": round(score, 4),
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

    identity_a = rng.normal(size=2048)
    identity_b = rng.normal(size=2048)

    identity_a /= np.linalg.norm(identity_a)
    identity_b /= np.linalg.norm(identity_b)

    gallery = {
        1: [identity_a],
        2: [identity_b]
    }

    track_features = {
        101: identity_a.copy(),
        102: identity_b.copy()
    }

    associator = GlobalIdentityAssociation()

    assignments, unmatched = associator.associate(
        track_features,
        gallery
    )

    print("Assignments:", assignments)
    print("Unmatched tracks:", unmatched)

    assert assignments[101]["identity_id"] == 1
    assert assignments[102]["identity_id"] == 2
    assert not unmatched

    print("GLOBAL ASSOCIATION TEST PASSED")
