
import { Maximize2, Video, Crosshair, Radio } from 'lucide-react'

const detections = [
  { id: 'OBJ-001', x: '16%', y: '23%', color: 'cyan' },
  { id: 'OBJ-002', x: '65%', y: '43%', color: 'green' },
  { id: 'OBJ-004', x: '40%', y: '57%', color: 'purple' },
]

export default function LiveMonitor() {
  return (
    <section className="panel monitor-panel">
      <div className="panel-heading">
        <div>
          <div className="panel-title">Live Monitoring</div>
          <div className="panel-subtitle">
            Primary surveillance feed
          </div>
        </div>

        <div className="live-label">
          <span /> SIMULATED FEED
        </div>
      </div>

      <div className="camera-scene">
        <div className="scene-grid" />

        <div className="scene-top">
          <span><Video size={14} /> CAM-01 / NORTH GATE</span>
          <span>DEMO MODE</span>
        </div>

        <div className="scene-center">
          <Crosshair size={34} strokeWidth={1} />
          <strong>ARGUS-X VISION</strong>
          <small>SIMULATED MONITORING ENVIRONMENT</small>
        </div>

        {detections.map((d) => (
          <div
            key={d.id}
            className={`detection-box ${d.color}`}
            style={{ left: d.x, top: d.y }}
          >
            <span>{d.id}</span>
            <i />
          </div>
        ))}

        <div className="scene-bottom">
          <span><Radio size={13} /> TRACKING ACTIVE</span>
          <span>1920 × 1080 · 30 FPS (DEMO)</span>
        </div>
      </div>

      <div className="monitor-footer">
        <div>
          <span className="small-dot green-dot" />
          3 visible demo tracks
        </div>

        <button className="text-button">
          <Maximize2 size={14} /> Expand view
        </button>
      </div>
    </section>
  )
}
