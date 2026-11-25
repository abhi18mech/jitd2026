import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np

from ai_models.identity.global_association import GlobalIdentityAssociation
from ai_models.identity.pending_association import PendingIdentityAssociation
from ai_models.identity.identity_lifecycle import IdentityLifecycleManager


print("\n=== ARGUS-X INTEGRATION TEST ===")

lifecycle = IdentityLifecycleManager(
    confirmation_frames=3,
    max_missed_frames=2,
    lost_timeout=60
)

associator = GlobalIdentityAssociation(
    similarity_threshold=0.80,
    ambiguity_margin=0.08
)

pending = PendingIdentityAssociation(
    confirmation_frames=3,
    similarity_threshold=0.80,
    ambiguity_margin=0.08,
    max_frame_gap=5
)

# Register two identities
for _ in range(3):
    lifecycle.update_track(11)

for _ in range(3):
    lifecycle.update_track(12)

print("TEST 1 PASSED: Identities registered")

# Make identity 1 LOST
lifecycle.mark_missing_tracks({12})
lifecycle.mark_missing_tracks({12})

assert lifecycle.identities[1].state == "LOST"
print("TEST 2 PASSED: Identity 1 marked LOST")

# Create synthetic feature vectors
feature_1 = np.zeros(512, dtype=np.float32)
feature_1[0] = 1.0

feature_2 = np.zeros(512, dtype=np.float32)
feature_2[1] = 1.0

gallery = {1: [feature_1], 2: [feature_2]}

lost_gallery = {
    identity_id: gallery[identity_id]
    for identity_id, identity in lifecycle.identities.items()
    if identity.state == "LOST"
}

assignments, unmatched = associator.associate(
    {201: feature_1},
    lost_gallery,
    active_identity_ids=set(lifecycle.tracker_to_identity.values()),
    reserved_identity_owners=pending.reservations
)

assert 201 in assignments
assert assignments[201]["identity_id"] == 1
print("TEST 3 PASSED: Global identity association")

# Reserve identity 1 for tracker 201
assert pending.update(201, 1, 0.95, 1, 0.0) is None

# Another tracker cannot claim the reserved identity
assert pending.update(202, 1, 0.95, 2, 0.0) is None
print("TEST 4 PASSED: Duplicate reservation blocked")

# Three clear observations confirm recovery
pending.update(201, 1, 0.96, 2, 0.0)
confirmation = pending.update(201, 1, 0.97, 3, 0.0)

assert confirmation is not None
assert confirmation["identity_id"] == 1

assert lifecycle.confirm_recovery(201, 1)
assert lifecycle.identities[1].state == "ACTIVE"

print("TEST 5 PASSED: Identity recovered")

print("\nFinal statistics:", lifecycle.get_statistics())
print("\nALL INTEGRATION TESTS PASSED")

