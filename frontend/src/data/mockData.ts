
import type { TrackedObject, RecoveryEvent } from '../types/tracking'

export const trackingObjects: TrackedObject[] = [
  {
    id: 'OBJ-001',
    type: 'Person',
    status: 'Active',
    confidence: 98,
    camera: 'CAM-01',
    lastSeen: 'Just now',
  },
  {
    id: 'OBJ-002',
    type: 'Vehicle',
    status: 'Active',
    confidence: 95,
    camera: 'CAM-02',
    lastSeen: 'Just now',
  },
  {
    id: 'OBJ-003',
    type: 'Person',
    status: 'Lost',
    confidence: 42,
    camera: 'CAM-01',
    lastSeen: '2 min ago',
  },
  {
    id: 'OBJ-004',
    type: 'Person',
    status: 'Recovered',
    confidence: 91,
    camera: 'CAM-03',
    lastSeen: '1 min ago',
  },
  {
    id: 'OBJ-005',
    type: 'Vehicle',
    status: 'Uncertain',
    confidence: 58,
    camera: 'CAM-02',
    lastSeen: '30 sec ago',
  },
  {
    id: 'OBJ-006',
    type: 'Person',
    status: 'Active',
    confidence: 96,
    camera: 'CAM-04',
    lastSeen: 'Just now',
  },
]

export const recoveryEvents: RecoveryEvent[] = [
  {
    id: 'OBJ-004',
    description: 'Identity restored after temporary occlusion',
    time: '14:32:08',
    confidence: 91,
    status: 'Recovered',
  },
  {
    id: 'OBJ-001',
    description: 'Continuous identity maintained',
    time: '14:31:42',
    confidence: 98,
    status: 'Active',
  },
  {
    id: 'OBJ-003',
    description: 'Object temporarily lost from camera view',
    time: '14:30:15',
    confidence: 42,
    status: 'Lost',
  },
  {
    id: 'OBJ-005',
    description: 'Low-confidence identity match detected',
    time: '14:29:51',
    confidence: 58,
    status: 'Uncertain',
  },
]

export const performanceData = [
  { time: '14:25', fps: 28, latency: 42 },
  { time: '14:26', fps: 30, latency: 38 },
  { time: '14:27', fps: 29, latency: 45 },
  { time: '14:28', fps: 32, latency: 35 },
  { time: '14:29', fps: 30, latency: 40 },
  { time: '14:30', fps: 34, latency: 32 },
  { time: '14:31', fps: 31, latency: 36 },
  { time: '14:32', fps: 33, latency: 34 },
]
