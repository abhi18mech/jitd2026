
import { useState } from 'react'
import {
  Camera,
  Bell,
  ShieldCheck,
  SlidersHorizontal,
  Save,
  RotateCcw,
} from 'lucide-react'

const initialCameras = [
  { id: 'CAM-01', name: 'Camera 01', enabled: true },
  { id: 'CAM-02', name: 'Camera 02', enabled: true },
  { id: 'CAM-03', name: 'Camera 03', enabled: true },
  { id: 'CAM-04', name: 'Camera 04', enabled: true },
]

export default function Settings() {
  const [cameras, setCameras] = useState(initialCameras)
  const [threshold, setThreshold] = useState(70)
  const [continuousTracking, setContinuousTracking] = useState(true)
  const [identityRecovery, setIdentityRecovery] = useState(true)

  const [notifications, setNotifications] = useState({
    lost: true,
    recovered: true,
    uncertain: false,
  })

  const [saved, setSaved] = useState(false)

  const toggleCamera = (id: string) => {
    setCameras(previous =>
      previous.map(camera =>
        camera.id === id
          ? { ...camera, enabled: !camera.enabled }
          : camera
      )
    )
    setSaved(false)
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(previous => ({
      ...previous,
      [key]: !previous[key],
    }))
    setSaved(false)
  }

  const resetSettings = () => {
    setCameras(initialCameras)
    setThreshold(70)
    setContinuousTracking(true)
    setIdentityRecovery(true)
    setNotifications({
      lost: true,
      recovered: true,
      uncertain: false,
    })
    setSaved(false)
  }

  const saveSettings = () => {
    setSaved(true)
  }

  const enabledCameras = cameras.filter(camera => camera.enabled).length

  return (
    <div className="settings-page">

      <div className="welcome-row">
        <div>
          <h2>System Settings</h2>
          <p>Configure monitoring, tracking and notification preferences.</p>
        </div>
        <div className="demo-indicator">
          <span /> LOCAL DEMONSTRATION
        </div>
      </div>

      {/* SETTINGS OVERVIEW */}

      <div className="settings-overview">
        <div className="settings-overview-card">
          <Camera size={20} />
          <div>
            <strong>{enabledCameras}/{cameras.length}</strong>
            <span>Enabled cameras</span>
          </div>
        </div>

        <div className="settings-overview-card">
          <ShieldCheck size={20} />
          <div>
            <strong>{threshold}%</strong>
            <span>Confidence threshold</span>
          </div>
        </div>

        <div className="settings-overview-card">
          <Bell size={20} />
          <div>
            <strong>
              {Object.values(notifications).filter(Boolean).length}
            </strong>
            <span>Enabled alerts</span>
          </div>
        </div>
      </div>

      {/* CAMERA CONFIGURATION */}

      <section className="panel settings-panel">
        <div className="panel-heading">
          <div className="settings-heading-icon">
            <Camera size={19} />
            <div>
              <div className="panel-title">Camera Configuration</div>
              <div className="panel-subtitle">
                Enable or disable camera monitoring
              </div>
            </div>
          </div>
          <span className="count-label">CAMERAS</span>
        </div>

        <div className="settings-camera-list">
          {cameras.map(camera => (
            <div className="settings-row" key={camera.id}>
              <div className="settings-row-info">
                <strong>{camera.name}</strong>
                <span>{camera.id}</span>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={camera.enabled}
                  onChange={() => toggleCamera(camera.id)}
                />
                <span className="settings-switch-track" />
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKING PREFERENCES */}

      <section className="panel settings-panel">
        <div className="panel-heading">
          <div className="settings-heading-icon">
            <SlidersHorizontal size={19} />
            <div>
              <div className="panel-title">Tracking Preferences</div>
              <div className="panel-subtitle">
                Configure object tracking behaviour
              </div>
            </div>
          </div>
        </div>

        <div className="settings-threshold">
          <div className="settings-row-info">
            <strong>Confidence Threshold</strong>
            <span>Minimum confidence required for a tracking match</span>
          </div>
          <strong className="threshold-value">{threshold}%</strong>
        </div>

        <input
          className="settings-range"
          type="range"
          min="10"
          max="100"
          step="5"
          value={threshold}
          onChange={event => {
            setThreshold(Number(event.target.value))
            setSaved(false)
          }}
        />

        <div className="settings-range-labels">
          <span>10% ┬╖ Low</span>
          <span>100% ┬╖ High</span>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Continuous Tracking</strong>
            <span>Maintain object tracking across frames</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={continuousTracking}
              onChange={event => {
                setContinuousTracking(event.target.checked)
                setSaved(false)
              }}
            />
            <span className="settings-switch-track" />
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Identity Recovery</strong>
            <span>Allow recovery of temporarily lost identities</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={identityRecovery}
              onChange={event => {
                setIdentityRecovery(event.target.checked)
                setSaved(false)
              }}
            />
            <span className="settings-switch-track" />
          </label>
        </div>
      </section>

      {/* NOTIFICATION PREFERENCES */}

      <section className="panel settings-panel">
        <div className="panel-heading">
          <div className="settings-heading-icon">
            <Bell size={19} />
            <div>
              <div className="panel-title">Notification Preferences</div>
              <div className="panel-subtitle">
                Choose which tracking events should generate alerts
              </div>
            </div>
          </div>
        </div>

        {([
          ['lost', 'Lost Object Alert', 'Notify when an object is lost'],
          ['recovered', 'Recovery Alert', 'Notify when an identity is recovered'],
          ['uncertain', 'Uncertain Match Alert', 'Notify when a match has low confidence'],
        ] as const).map(([key, title, description]) => (
          <div className="settings-row" key={key}>
            <div className="settings-row-info">
              <strong>{title}</strong>
              <span>{description}</span>
            </div>

            <label className="settings-switch">
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={() => toggleNotification(key)}
              />
              <span className="settings-switch-track" />
            </label>
          </div>
        ))}
      </section>

      {/* APPLICATION INFORMATION */}

      <section className="panel settings-panel">
        <div className="panel-heading">
          <div className="settings-heading-icon">
            <ShieldCheck size={19} />
            <div>
              <div className="panel-title">Application Information</div>
              <div className="panel-subtitle">
                Current application configuration
              </div>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <span>Application</span>
          <strong>ARGUS-X</strong>
        </div>

        <div className="settings-row">
          <span>Version</span>
          <strong>1.0.0 Demo</strong>
        </div>

        <div className="settings-row">
          <span>Data source</span>
          <strong>Mock data</strong>
        </div>

        <div className="settings-row">
          <span>Interface theme</span>
          <strong>Dark</strong>
        </div>

        <div className="health-note">
          Settings are currently managed in frontend state only.
          Backend integration is not enabled.
        </div>
      </section>

      {/* ACTION BUTTONS */}

      <div className="settings-actions">
        <button
          className="settings-reset-button"
          onClick={resetSettings}
        >
          <RotateCcw size={16} /> Reset Defaults
        </button>

        <div className="settings-save-group">
          {saved && (
            <span className="settings-saved-message">
              Settings saved for this session
            </span>
          )}

          <button
            className="settings-save-button"
            onClick={saveSettings}
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>

    </div>
  )
}
