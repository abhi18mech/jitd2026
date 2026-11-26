
import { useMemo, useState } from 'react'
import {
  Search, Filter, X, RefreshCw, Clock3,
  ShieldCheck, AlertTriangle, Activity, Eye,
} from 'lucide-react'
import { recoveryEvents } from '../data/mockData'
import type { TrackStatus } from '../types/tracking'

const filters: Array<'All' | TrackStatus> = [
  'All', 'Recovered', 'Active', 'Lost', 'Uncertain',
]
function getConfidenceLevel(confidence: number) {
  if (confidence >= 90) {
    return { label: 'High', className: 'confidence-high' }
  }

  if (confidence >= 70) {
    return { label: 'Medium', className: 'confidence-medium' }
  }

  return { label: 'Low', className: 'confidence-low' }
}

export default function IdentityRecovery() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'All' | TrackStatus>('All')
  const [currentPage, setCurrentPage] = useState(1)

const EVENTS_PER_PAGE = 3
  const [selected, setSelected] =
    useState<(typeof recoveryEvents)[number] | null>(null)

  const filteredEvents = useMemo(() => {
    return recoveryEvents.filter(event => {
      const matchesSearch =
        event.id.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        status === 'All' || event.status === status

      return matchesSearch && matchesStatus
    })
  }, [search, status])
  const totalPages = Math.ceil(
  filteredEvents.length / EVENTS_PER_PAGE
)

const paginatedEvents = filteredEvents.slice(
  (currentPage - 1) * EVENTS_PER_PAGE,
  currentPage * EVENTS_PER_PAGE
)

  const recovered = recoveryEvents.filter(
    event => event.status === 'Recovered'
  ).length

  const uncertain = recoveryEvents.filter(
    event => event.status === 'Uncertain'
  ).length

  const lost = recoveryEvents.filter(
    event => event.status === 'Lost'
  ).length

  const averageConfidence = recoveryEvents.length
    ? Math.round(
        recoveryEvents.reduce((sum, event) => sum + event.confidence, 0) /
        recoveryEvents.length
      )
    : 0

  return (
    <div className="identity-recovery-page">
      <div className="welcome-row">
        <div>
          <h2>Identity Recovery</h2>
          <p>Review anonymous identity continuity and recovery events.</p>
        </div>
        <div className="demo-indicator">
          <span /> MOCK DATA · DEMONSTRATION
        </div>
      </div>

      <div className="stats-grid">
        <div className="panel object-stat">
          <span>Total Recovery Events</span>
          <strong>{recoveryEvents.length}</strong>
          <small>Recorded demo events</small>
        </div>

        <div className="panel object-stat">
          <span>Recovered Identities</span>
          <strong className="object-green">{recovered}</strong>
          <small>Restored identity records</small>
        </div>

        <div className="panel object-stat">
          <span>Uncertain Matches</span>
          <strong className="object-orange">{uncertain}</strong>
          <small>Require further review</small>
        </div>

        <div className="panel object-stat">
          <span>Average Confidence</span>
          <strong className="object-purple">{averageConfidence}%</strong>
          <small>Across recorded events</small>
        </div>
      </div>

      <section className="panel identity-summary">
        <div className="panel-heading">
          <div>
            <div className="panel-title">Recovery Status Summary</div>
            <div className="panel-subtitle">
              Distribution of demonstration recovery events
            </div>
          </div>
          <ShieldCheck size={19} className="muted-icon" />
        </div>

        <div className="identity-status-grid">
          <div>
            <RefreshCw size={19} />
            <strong>{recovered}</strong>
            <span>Recovered</span>
          </div>
          <div>
            <Activity size={19} />
            <strong>{recoveryEvents.filter(e => e.status === 'Active').length}</strong>
            <span>Active</span>
          </div>
          <div>
            <AlertTriangle size={19} />
            <strong>{lost}</strong>
            <span>Lost</span>
          </div>
          <div>
            <Eye size={19} />
            <strong>{uncertain}</strong>
            <span>Uncertain</span>
          </div>
        </div>
      </section>

      <section className="panel tracking-panel">
        <div className="panel-heading">
          <div>
            <div className="panel-title">Identity Recovery Events</div>
            <div className="panel-subtitle">
              Anonymous identity event history
            </div>
          </div>
          <span className="count-label">
            {filteredEvents.length} EVENTS
          </span>
        </div>

        <div className="object-toolbar">
          <div className="object-search">
            <Search size={17} />
            <input
              placeholder="Search object ID or event description..."
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
              aria-label="Filter recovery status"
            >
              {filters.map(item => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All statuses' : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="recovery-list identity-event-list">
          {paginatedEvents.map(event => (
            <div
              className="recovery-event identity-event"
              key={`${event.id}-${event.time}`}
            >
              <div className={`event-marker marker-${event.status.toLowerCase()}`} />

              <div className="event-content">
                <div className="event-title">
                  <strong>{event.id}</strong>
                  <span>
  {event.confidence}% confidence ·{' '}
  <strong className={`confidence-level ${getConfidenceLevel(event.confidence).className}`}>
    {getConfidenceLevel(event.confidence).label}
  </strong>
</span>
                </div>

                <p>{event.description}</p>

                <div className="identity-event-bottom">
                  <small><Clock3 size={12} /> {event.time}</small>
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

          {filteredEvents.length === 0 && (
            <div className="object-empty">
              No recovery events match your search or filter.
            </div>
          )}
        </div>

       
<div className="table-footer identity-pagination">
  <span>
    Showing {filteredEvents.length === 0 ? 0 : (currentPage - 1) * EVENTS_PER_PAGE + 1}
    {' - '}
    {Math.min(currentPage * EVENTS_PER_PAGE, filteredEvents.length)}
    {' of '}
    {filteredEvents.length} demo events
  </span>

  <div className="pagination-controls">
    <button
      className="pagination-button"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage(previous => Math.max(1, previous - 1))
      }
    >
      Previous
    </button>

    <span className="pagination-page">
      Page {currentPage} of {Math.max(totalPages, 1)}
    </span>

    <button
      className="pagination-button"
      disabled={currentPage >= totalPages}
      onClick={() =>
        setCurrentPage(previous => Math.min(totalPages, previous + 1))
      }
    >
      Next
    </button>
  </div>

    <span>ARGUS-X RECOVERY RECORDS</span>
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
            aria-labelledby="recovery-detail-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="panel-heading">
              <div>
                <div className="panel-title" id="recovery-detail-title">
                  Recovery Event Details
                </div>
                <div className="panel-subtitle">
                  Anonymous identity event record
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
                <span><ShieldCheck size={15} /> Confidence</span>
                <strong>{selected.confidence}%</strong>
              </div>
              <div>
                <span><Clock3 size={15} /> Event Time</span>
                <strong>{selected.time}</strong>
              </div>
              <div>
                <span><Activity size={15} /> Event Type</span>
                <strong>{selected.status}</strong>
              </div>
              <div>
                <span><Eye size={15} /> Object ID</span>
                <strong>{selected.id}</strong>
              </div>
            </div>

            <p className="object-demo-note">
              {selected.description}. This is a demonstration record.
              Additional recovery evidence will be displayed when supported
              by the tracking backend.
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
