
import {
  LayoutDashboard,
  Camera,
  Scan,
  RefreshCw,
  History,
  ChartNoAxesCombined,
  Settings,
  Shield,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Live Monitoring', icon: Camera },
  { name: 'Object Tracking', icon: Scan },
  { name: 'Identity Recovery', icon: RefreshCw },
  { name: 'Tracking History', icon: History },
  { name: 'Analytics', icon: ChartNoAxesCombined },
  { name: 'Settings', icon: Settings },
]

interface SidebarProps {
  active: string
  onNavigate: (name: string) => void
  open: boolean
  onClose: () => void
}

export default function Sidebar({
  active,
  onNavigate,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {open && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Shield size={23} />
          </div>

          <div>
            <h2>ARGUS<span>-X</span></h2>
            <small>TRACK THE UNTRACKABLE</small>
          </div>

          <button className="mobile-close" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="nav-list">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${
                active === name ? 'nav-active' : ''
              }`}
              onClick={() => {
                onNavigate(name)
                onClose()
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
              {active === name && (
                <span className="nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-dot" />
            <div>
              <strong>System Operational</strong>
              <small>All services running</small>
            </div>
          </div>

          <div className="version">
            ARGUS-X v1.0.0 · DEMO
          </div>
        </div>
      </aside>
    </>
  )
}
