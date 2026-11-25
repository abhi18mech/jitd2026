
import { trackingObjects } from '../data/mockData'
import type { TrackStatus } from '../types/tracking'
import { ArrowUpRight } from 'lucide-react'

function StatusBadge({ status }: { status: TrackStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <i /> {status}
    </span>
  )
}

export default function TrackingTable() {
  return (
    <section className="panel tracking-panel">
      <div className="panel-heading">
        <div>
          <div className="panel-title">Tracked Objects</div>
          <div className="panel-subtitle">
            Anonymous identity monitoring
          </div>
        </div>

        <span className="count-label">
          {trackingObjects.length} OBJECTS
        </span>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>OBJECT ID</th>
              <th>TYPE</th>
              <th>STATUS</th>
              <th>CONFIDENCE</th>
              <th>CAMERA</th>
              <th>LAST SEEN</th>
            </tr>
          </thead>

          <tbody>
            {trackingObjects.map((object) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>Showing demonstration tracking records</span>
        <span>View all <ArrowUpRight size={13} /></span>
      </div>
    </section>
  )
}
