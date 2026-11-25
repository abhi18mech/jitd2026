
export type TrackStatus =
  | 'Active'
  | 'Lost'
  | 'Recovered'
  | 'Uncertain'
  | 'Expired'

export interface TrackedObject {
  id: string
  type: string
  status: TrackStatus
  confidence: number
  camera: string
  lastSeen: string
}

export interface RecoveryEvent {
  id: string
  description: string
  time: string
  confidence: number
  status: TrackStatus
}
