
import { useState } from 'react'
import {
  Activity, Users, Eye, RefreshCw, Gauge,
  ShieldCheck, AlertTriangle, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatCard from './components/StatCard'
import LiveMonitor from './components/LiveMonitor'
import TrackingTable from './components/TrackingTable'
import RecoveryHistory from './components/RecoveryHistory'
import ObjectTracking from './components/ObjectTracking'
import IdentityRecovery from './components/IdentityRecovery'
import TrackingHistory from './components/TrackingHistory'
import Analytics from './components/Analytics'
import { trackingObjects, performanceData } from './data/mockData'
import './App.css'

function PerformanceChart() {
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <div className="panel-title">System Performance</div>
          <div className="panel-subtitle">
            Illustrative FPS over recent intervals
          </div>
        </div>
        <span className="count-label">DEMO ANALYTICS</span>
      </div>

      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="fpsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#263244" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#748198" fontSize={11} />
            <YAxis stroke="#748198" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: '#111c2c',
                border: '1px solid #29384b',
                borderRadius: 8,
                color: '#e5e7eb',
              }}
            />
            <Area
              type="monotone"
              dataKey="fps"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#fpsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function App() {
  const [active, setActive] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeCount = trackingObjects.filter(
    x => x.status === 'Active'
  ).length

  const lostCount = trackingObjects.filter(
    x => x.status === 'Lost'
  ).length

  const recoveredCount = trackingObjects.filter(
    x => x.status === 'Recovered'
  ).length

  const uncertainCount = trackingObjects.filter(
    x => x.status === 'Uncertain'
  ).length

  const renderPage = () => {
    switch (active) {
      case 'Overview':
        return (
          <>
            <div className="welcome-row">
              <div>
                <h2>Monitoring Overview</h2>
                <p>Real-time object intelligence and identity continuity.</p>
              </div>
              <div className="demo-indicator">
                <span /> MOCK DATA · DEMONSTRATION
              </div>
            </div>

            <div className="stats-grid">
              <StatCard
                label="Total Objects"
                value={trackingObjects.length}
                change="Tracked"
                detail="Demo records"
                icon={<Users size={19} />}
                color="cyan"
              />
              <StatCard
                label="Active Tracks"
                value={activeCount}
                change="Live status"
                detail="Currently visible"
                icon={<Eye size={19} />}
                color="green"
              />
              <StatCard
                label="Recovered"
                value={recoveredCount}
                change="Restored"
                detail="Identity continuity"
                icon={<RefreshCw size={19} />}
                color="purple"
              />
              <StatCard
                label="Lost / Uncertain"
                value={lostCount + uncertainCount}
                change="Requires review"
                detail="Demo records"
                icon={<AlertTriangle size={19} />}
                color="orange"
              />
            </div>

            <div className="monitor-grid">
              <LiveMonitor />

              <section className="panel health-panel">
                <div className="panel-heading">
                  <div>
                    <div className="panel-title">System Health</div>
                    <div className="panel-subtitle">Simulated performance</div>
                  </div>
                  <Activity size={18} className="muted-icon" />
                </div>

                <div className="health-score">
                  <div className="health-circle">
                    <ShieldCheck size={29} />
                    <strong>98%</strong>
                    <small>DEMO</small>
                  </div>
                  <div>
                    <strong className="health-text">Operational</strong>
                    <p>Illustrative system status</p>
                  </div>
                </div>

                <div className="health-metric">
                  <span><Gauge size={15} /> Processing speed</span>
                  <strong>33 FPS</strong>
                </div>
                <div className="health-metric">
                  <span><Zap size={15} /> Processing latency</span>
                  <strong>34 ms</strong>
                </div>
                <div className="health-metric">
                  <span><Activity size={15} /> Tracking confidence</span>
                  <strong>91.6%</strong>
                </div>
                <div className="health-note">
                  <span className="small-dot green-dot" />
                  Illustrative metrics – not connected to backend
                </div>
              </section>
            </div>

            <div className="lower-grid">
              <TrackingTable />
              <RecoveryHistory />
            </div>

            <PerformanceChart />
          </>
        )

      case 'Live Monitoring':
        return (
          <>
            <div className="welcome-row">
              <div>
                <h2>Live Monitoring</h2>
                <p>Monitor camera feeds and detected objects.</p>
              </div>
              <div className="demo-indicator">
                <span /> SIMULATED CAMERA FEED
              </div>
            </div>
            <LiveMonitor />
          </>
        )
     case 'Object Tracking':
  return <ObjectTracking />

case 'Identity Recovery':
  return <IdentityRecovery />

case 'Tracking History':
  return <TrackingHistory />  

    case 'Analytics':
  return <Analytics />  
      case 'Settings':
        return (
          <>
            <div className="welcome-row">
              <div>
                <h2>Settings</h2>
                <p>Application information and demonstration configuration.</p>
              </div>
            </div>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <div className="panel-title">Application Settings</div>
                  <div className="panel-subtitle">
                    Current frontend configuration
                  </div>
                </div>
              </div>

              <div className="health-metric">
                <span>Application</span>
                <strong>ARGUS-X</strong>
              </div>
              <div className="health-metric">
                <span>Version</span>
                <strong>1.0.0 Demo</strong>
              </div>
              <div className="health-metric">
                <span>Data source</span>
                <strong>Mock data</strong>
              </div>
              <div className="health-metric">
                <span>Interface theme</span>
                <strong>Dark</strong>
              </div>
              <div className="health-note">
                Backend settings will be added after API integration.
              </div>
            </section>
          </>
        )

      default:
        return <h2>Page not found</h2>
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNavigate={setActive}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <Header
          title={active}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="dashboard-content">
          {renderPage()}

          <footer className="dashboard-footer">
            <span>ARGUS-X · TRACK THE UNTRACKABLE</span>
            <span>CLOCKIT 2026 · FRONTEND DEMONSTRATION</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
