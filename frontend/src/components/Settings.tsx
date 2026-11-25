
import { useState } from 'react'
import {
  Camera,
  Bell,
  ShieldCheck,
  SlidersHorizontal,
  Save,
  RotateCcw,
} from 'lucide-react'

const STORAGE_KEY = 'argus-x-settings'

const initialCameras = [
  { id: 'CAM-01', name: 'Camera 01', enabled: true },
  { id: 'CAM-02', name: 'Camera 02', enabled: true },
  { id: 'CAM-03', name: 'Camera 03', enabled: true },
  { id: 'CAM-04', name: 'Camera 04', enabled: true },
]

const defaultSettings = {
  cameras: initialCameras,
  threshold: 70,
  continuousTracking: true,
  identityRecovery: true,
  notifications: {
    lost: true,
    recovered: true,
    uncertain: false,
  },
}

interface SettingsProps {
  theme: 'dark' | 'light'
  onThemeChange: (theme: 'dark' | 'light') => void
}

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) return defaultSettings

    const parsed = JSON.parse(stored)

    return {
      cameras: Array.isArray(parsed.cameras)
        ? initialCameras.map(camera => {
            const saved = parsed.cameras.find(
              (item: { id: string; enabled: boolean }) =>
                item.id === camera.id
            )

            return {
              ...camera,
              enabled:
                typeof saved?.enabled === 'boolean'
                  ? saved.enabled
                  : camera.enabled,
            }
          })
        : defaultSettings.cameras,

      threshold:
        typeof parsed.threshold === 'number'
          ? Math.min(100, Math.max(10, parsed.threshold))
          : defaultSettings.threshold,

      continuousTracking:
        typeof parsed.continuousTracking === 'boolean'
          ? parsed.continuousTracking
          : defaultSettings.continuousTracking,

      identityRecovery:
        typeof parsed.identityRecovery === 'boolean'
          ? parsed.identityRecovery
          : defaultSettings.identityRecovery,

      notifications: {
        lost:
          typeof parsed.notifications?.lost === 'boolean'
            ? parsed.notifications.lost
            : defaultSettings.notifications.lost,
        recovered:
          typeof parsed.notifications?.recovered === 'boolean'
            ? parsed.notifications.recovered
            : defaultSettings.notifications.recovered,
        uncertain:
          typeof parsed.notifications?.uncertain === 'boolean'
            ? parsed.notifications.uncertain
            : defaultSettings.notifications.uncertain,
      },
    }
  } catch {
    return defaultSettings
  }
}

export default function Settings({ theme, onThemeChange }: SettingsProps) {
  const [initialSettings] = useState(loadSettings)

  const [cameras, setCameras] = useState(initialSettings.cameras)
  const [threshold, setThreshold] = useState(initialSettings.threshold)
  const [continuousTracking, setContinuousTracking] = useState(
    initialSettings.continuousTracking
  )
  const [identityRecovery, setIdentityRecovery] = useState(
    initialSettings.identityRecovery
  )
  const [notifications, setNotifications] = useState(
    initialSettings.notifications
  )

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
    const confirmed = window.confirm(
      'Are you sure you want to reset all settings to default values?'
    )

    if (!confirmed) return

    setCameras(initialCameras)
    setThreshold(70)
    setContinuousTracking(true)
    setIdentityRecovery(true)
    setNotifications({
      lost: true,
      recovered: true,
      uncertain: false,
    })

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings))
      setSaved(true)
    } catch {
      setSaved(false)
      alert('Unable to save default settings in this browser.')
    }
  }

  const saveSettings = () => {
    try {
      const settings = {
        cameras,
        threshold,
        continuousTracking,
        identityRecovery,
        notifications,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      setSaved(true)
    } catch {
      setSaved(false)
      alert('Unable to save settings in this browser.')
    }
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
          <span>10% · Low</span>
          <span>100% · High</span>
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
          <strong>{theme === 'dark' ? 'Dark' : 'Light'}</strong>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Dashboard Appearance</strong>
            <span>Switch between dark and light themes</span>
          </div>

          <button
            className="theme-toggle-button"
            onClick={() =>
              onThemeChange(theme === 'dark' ? 'light' : 'dark')
            }
          >
            {theme === 'dark' ? '☀ Light Theme' : '☾ Dark Theme'}
          </button>
        </div>

        <div className="health-note">
          Settings are saved in this browser using local storage.
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
              Settings saved successfully in this browser
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
