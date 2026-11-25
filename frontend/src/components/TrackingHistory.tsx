
import { useMemo, useState } from 'react'
import {
  Search, Filter, X, Clock3, Camera,
  Eye, Activity, History,
} from 'lucide-react'
import { recoveryEvents, trackingObjects } from '../data/mockData'
import type { TrackStatus } from '../types/tracking'

const filters: Array<'All' | TrackStatus> = [
  'All', 'Active', 'Lost', 'Recovered', 'Uncertain',
]

export default function TrackingHistory() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'All' | TrackStatus>('All')
  const [selected, setSelected] =
    useState<(typeof recoveryEvents)[number] | null>(null)

  const history = useMemo(() => {
    return recoveryEvents
      .map(event => {
        const object = trackingObjects.find(
          item => item.id === event.id
        )

        return {
          ...event,
          type: object?.type ?? 'Unknown',
          camera: object?.camera ?? 'Unknown',
          lastSeen: object?.lastSeen ?? 'Unavailable',
        }
      })
      .filter(event => {
        const query = search.toLowerCase()

        const matchesSearch =
          event.id.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query) ||
          event.camera.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)

        const matchesStatus =
          status === 'All' || event.status === status

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => b.time.localeCompare(a.time))
  }, [search, status])

  const counts = {
    total: recoveryEvents.length,
    active: recoveryEvents.filter(e => e.status === 'Active').length,
    lost: recoveryEvents.filter(e => e.status === 'Lost').length,
    recovered: recoveryEvents.filter(e => e.status === 'Recovered').length,
    uncertain: recoveryEvents.filter(e => e.status === 'Uncertain').length,
  }

  const selectedObject = selected
    ? trackingObjects.find(item => item.id === selected.id)
    : undefined

  return (
    <div className="tracking-history-page">
      <div className="welcome-row">
        <div>
          <h2>Tracking History</h2>
          <p>Explore recorded anonymous object tracking events.</p>
        </div>
        <div className="demo-indicator">
          <span /> MOCK DATA · DEMONSTRATION
        </div>
      </div>

      <div className="stats-grid">
        <div className="panel object-stat">
          <span>Total Events</span>
          <strong>{counts.total}</strong>
          <small>Recorded events</small>
        </div>
        <div className="panel object-stat">
          <span>Active Events</span>
          <strong className="object-green">{counts.active}</strong>
          <small>Continuous identity</small>
        </div>
        <div className="panel object-stat">
          <span>Recovered Events</span>
          <strong className="object-purple">{counts.recovered}</strong>
          <small>Identity restored</small>
        </div>
        <div className="panel object-stat">
          <span>Lost / Uncertain</span>
          <strong className="object-orange">
            {counts.lost + counts.uncertain}
          </strong>
          <small>Require attention</small>
        </div>
      </div>

      <section className="panel tracking-panel">
        <div className="panel-heading">
          <div>
            <div className="panel-title">Event Timeline</div>
            <div className="panel-subtitle">
              Chronological tracking activity records
            </div>
          </div>
          <span className="count-label">
            {history.length} EVENTS
          </span>
        </div>

        <div className="object-toolbar">
          <div className="object-search">
            <Search size={17} />
            <input
              placeholder="Search ID, category, camera or event..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            {search && (
              <button
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
              onChange={event =>
                setStatus(event.target.value as 'All' | TrackStatus)
              }
              aria-label="Filter event status"
            >
              {filters.map(item => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All statuses' : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="history-timeline">
          {history.map((event, index) => (
            <div className="history-item" key={`${event.id}-${event.time}`}>
              <div className="history-rail">
                <div className={`event-marker marker-${event.status.toLowerCase()}`} />
                {index !== history.length - 1 && (
                  <div className="history-line" />
                )}
              </div>

              <div className="history-card">
                <div className="history-card-top">
                  <div>
                    <span className="object-id">{event.id}</span>
                    <span className="history-category">{event.type}</span>
                  </div>
                  <span className={`status-badge status-${event.status.toLowerCase()}`}>
                    <i /> {event.status}
                  </span>
                </div>

                <p>{event.description}</p>

                <div className="history-meta">
                  <span><Clock3 size={13} /> {event.time}</span>
                  <span><Camera size={13} /> {event.camera}</span>
                  <span><Activity size={13} /> {event.confidence}%</span>
                </div>

                <div className="history-card-footer">
                  <span>Last seen: {event.lastSeen}</span>
                  <button
                    className="object-view-button"
                    onClick={() => setSelected(event)}
                  >
                    <Eye size={14} /> View details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="object-empty">
              No tracking events match your search or filter.
            </div>
          )}
        </div>

        <div className="table-footer">
          <span>Showing {history.length} of {counts.total} recorded events</span>
          <span>ARGUS-X TRACKING HISTORY</span>
        </div>
      </section>

      {selected && (
        <div
          className="object-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <section
            className="panel object-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-detail-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="panel-heading">
              <div>
                <div className="panel-title" id="history-detail-title">
                  Tracking Event Details
                </div>
                <div className="panel-subtitle">
                  Recorded event information
                </div>
              </div>
              <button
                className="object-close"
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="object-detail-id">{selected.id}</div>

            <span className={`status-badge status-${selected.status.toLowerCase()}`}>
              <i /> {selected.status}
            </span>

            <div className="object-detail-grid">
              <div>
                <span><Activity size={15} /> Category</span>
                <strong>{selectedObject?.type ?? 'Unknown'}</strong>
              </div>
              <div>
                <span><Camera size={15} /> Camera</span>
                <strong>{selectedObject?.camera ?? 'Unknown'}</strong>
              </div>
              <div>
                <span><Clock3 size={15} /> Event Time</span>
                <strong>{selected.time}</strong>
              </div>
              <div>
                <span><History size={15} /> Confidence</span>
                <strong>{selected.confidence}%</strong>
              </div>
            </div>

            <p className="object-demo-note">
              {selected.description}. This is a recorded demonstration
              event. Full historical tracking data will be available
              after backend integration.
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
