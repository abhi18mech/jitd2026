
import { recoveryEvents } from '../data/mockData'
import { RefreshCw, Clock3, ArrowUpRight } from 'lucide-react'

interface RecoveryHistoryProps {
  onViewAll: () => void
}

export default function RecoveryHistory({ onViewAll }: RecoveryHistoryProps) {
  return (
    <section className="panel recovery-panel">
      <div className="panel-heading">
        <div>
          <div className="panel-title">Identity Recovery</div>
          <div className="panel-subtitle">Recent identity events</div>
        </div>
        <RefreshCw size={17} className="muted-icon" />
      </div>

      <div className="recovery-list">
        {recoveryEvents.map((event) => (
          <div className="recovery-event" key={`${event.id}-${event.time}`}>
            <div className={`event-marker marker-${event.status.toLowerCase()}`} />
            <div className="event-content">
              <div className="event-title">
                <strong>{event.id}</strong>
                <span>{event.confidence}%</span>
              </div>
              <p>{event.description}</p>
              <small><Clock3 size={12} /> {event.time}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="table-footer">
        <span>Showing recent recovery events</span>
        <button
          type="button"
          className="table-view-all"
          onClick={onViewAll}
        >
          View all <ArrowUpRight size={13} />
        </button>
      </div>
    </section>
  )
}
