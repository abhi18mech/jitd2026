
import { useEffect, useMemo, useState } from 'react'
import {
  Search, Filter, X, Eye, Camera, Clock,
  Activity, ShieldCheck,
} from 'lucide-react'
import { trackingObjects } from '../data/mockData'
import type { TrackedObject, TrackStatus } from '../types/tracking'

const statuses: Array<'All' | TrackStatus> = [
  'All',
  'Active',
  'Lost',
  'Recovered',
  'Uncertain',
]

function StatusBadge({ status }: { status: TrackStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <i /> {status}
    </span>
  )
}

interface ObjectTrackingProps {
  initialSearch?: string
}

export default function ObjectTracking({
  initialSearch = '',
}: ObjectTrackingProps) {
  const [search, setSearch] = useState('')
useEffect(() => {
  setSearch(initialSearch)
}, [initialSearch])
  const [status, setStatus] = useState<'All' | TrackStatus>('All')
  const [selected, setSelected] = useState<TrackedObject | null>(null)

  const filteredObjects = useMemo(() => {
    return trackingObjects.filter((object) => {
      const matchesSearch =
        object.id.toLowerCase().includes(search.toLowerCase()) ||
        object.type.toLowerCase().includes(search.toLowerCase()) ||
        object.camera.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        status === 'All' || object.status === status

      return matchesSearch && matchesStatus
    })
  }, [search, status])

  const counts = {
    total: trackingObjects.length,
    active: trackingObjects.filter(x => x.status === 'Active').length,
    lost: trackingObjects.filter(x => x.status === 'Lost').length,
    recovered: trackingObjects.filter(x => x.status === 'Recovered').length,
    uncertain: trackingObjects.filter(x => x.status === 'Uncertain').length,
  }

  return (
    <div className="object-tracking-page">
      <div className="welcome-row">
        <div>
          <h2>Object Tracking</h2>
          <p>Search, monitor and inspect tracked objects.</p>
        </div>
        <div className="demo-indicator">
          <span /> MOCK DATA · DEMONSTRATION
        </div>
      </div>

      <div className="stats-grid">
        <div className="panel object-stat">
          <span>Total Objects</span>
          <strong>{counts.total}</strong>
          <small>All tracked records</small>
        </div>
        <div className="panel object-stat">
          <span>Active Tracks</span>
          <strong className="object-green">{counts.active}</strong>
          <small>Currently active</small>
        </div>
        <div className="panel object-stat">
          <span>Recovered</span>
          <strong className="object-purple">{counts.recovered}</strong>
          <small>Identity restored</small>
        </div>
        <div className="panel object-stat">
          <span>Lost / Uncertain</span>
          <strong className="object-orange">
            {counts.lost + counts.uncertain}
          </strong>
          <small>Needs attention</small>
        </div>
      </div>

      <section className="panel tracking-panel">
        <div className="panel-heading">
          <div>
            <div className="panel-title">Tracked Object Records</div>
            <div className="panel-subtitle">
              Search and filter demonstration records
            </div>
          </div>
          <span className="count-label">
            {filteredObjects.length} RESULTS
          </span>
        </div>

        <div className="object-toolbar">
          <div className="object-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search object ID, category or camera..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                className="object-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="object-filter">
            <Filter size={16} />
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as 'All' | TrackStatus)
              }
              aria-label="Filter by status"
            >
              {statuses.map(item => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All statuses' : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>OBJECT ID</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>CONFIDENCE</th>
                <th>CAMERA</th>
                <th>LAST SEEN</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.map(object => (
                <tr key={object.id}>
                  <td>
                    <span className="object-id">{object.id}</span>
                  </td>
                  <td>{object.type}</td>
                  <td><StatusBadge status={object.status} /></td>
                  <td>
                    <div className="confidence-cell">
                      <div className="confidence-track">
                        <div
                          className="confidence-fill"
                          style={{ width: `${object.confidence}%` }}
                        />
                      </div>
                      <span>{object.confidence}%</span>
                    </div>
                  </td>
                  <td>{object.camera}</td>
                  <td>{object.lastSeen}</td>
                  <td>
                    <button
                      type="button"
                      className="object-view-button"
                      onClick={() => setSelected(object)}
                    >
                      <Eye size={15} /> View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredObjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="object-empty">
                    No objects match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing {filteredObjects.length} of {trackingObjects.length} demo records</span>
          <span>ARGUS-X OBJECT DATABASE</span>
        </div>
      </section>

      {selected && (
        <div
          className="object-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <section
            className="panel object-detail-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="object-detail-title"
          >
            <div className="panel-heading">
              <div>
                <div className="panel-title" id="object-detail-title">
                  Object Details
                </div>
                <div className="panel-subtitle">
                  Tracking record information
                </div>
              </div>
              <button
                type="button"
                className="object-close"
                onClick={() => setSelected(null)}
                aria-label="Close object details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="object-detail-id">{selected.id}</div>
            <StatusBadge status={selected.status} />

            <div className="object-detail-grid">
              <div>
                <span><Activity size={15} /> Category</span>
                <strong>{selected.type}</strong>
              </div>
              <div>
                <span><ShieldCheck size={15} /> Confidence</span>
                <strong>{selected.confidence}%</strong>
              </div>
              <div>
                <span><Camera size={15} /> Camera</span>
                <strong>{selected.camera}</strong>
              </div>
              <div>
                <span><Clock size={15} /> Last Seen</span>
                <strong>{selected.lastSeen}</strong>
              </div>
            </div>

            <p className="object-demo-note">
              This information is from the local demonstration dataset.
              Live camera and backend tracking details are not connected yet.
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
