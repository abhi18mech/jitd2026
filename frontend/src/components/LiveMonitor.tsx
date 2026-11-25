import { useState } from 'react'
import { Video, Radio, Maximize2 } from 'lucide-react'

export default function LiveMonitor() {
  const [error, setError] = useState(false)

  const streamUrl = 'http://localhost:8000/api/stream'

  return (
    <section className="panel monitor-panel">
      <div className="panel-heading">
        <div>
          <div className="panel-title">Live ARGUS-X Monitoring</div>
          <div className="panel-subtitle">
            YOLO + BoT-SORT + OSNet Identity Recovery
          </div>
        </div>

        <div className="live-label">
          <span /> {error ? 'CONNECTION ERROR' : 'LIVE CAMERA'}
        </div>
      </div>

      <div
        className="camera-scene"
        style={{ position: 'relative', minHeight: 350 }}
      >
        <img
          src={streamUrl}
          alt="ARGUS-X live camera with AI detection overlays"
          onError={() => setError(true)}
          onLoad={() => setError(false)}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 350,
            objectFit: 'contain',
            display: 'block'
          }}
        />

        {error && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: '#080e18',
            color: 'white',
            textAlign: 'center'
          }}>
            <div>
              <Video size={35} />
              <h3>Camera not connected</h3>
              <p>Start the ARGUS-X FastAPI server.</p>
            </div>
          </div>
        )}
      </div>

      <div className="monitor-footer">
        <div>
          <span className="small-dot green-dot" />
          <Radio size={13} /> AI tracking stream
        </div>

        <a
          href={streamUrl}
          target="_blank"
          rel="noreferrer"
          className="text-button"
        >
          <Maximize2 size={14} /> Expand view
        </a>
      </div>
    </section>
  )
}
