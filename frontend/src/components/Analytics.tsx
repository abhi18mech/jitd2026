
import {
  Activity,
  Camera,
  Eye,
  Target,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts'

import { trackingObjects, performanceData } from '../data/mockData'

const statusColors: Record<string, string> = {
  Active: '#22c55e',
  Lost: '#f97316',
  Recovered: '#a78bfa',
  Uncertain: '#eab308',
}

const statusData = ['Active', 'Lost', 'Recovered', 'Uncertain'].map(
  status => ({
    name: status,
    value: trackingObjects.filter(item => item.status === status).length,
  })
)

const cameraData = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'].map(camera => ({
  camera,
  objects: trackingObjects.filter(item => item.camera === camera).length,
}))

const averageConfidence =
  trackingObjects.length > 0
    ? Math.round(
        trackingObjects.reduce((sum, item) => sum + item.confidence, 0) /
          trackingObjects.length
      )
    : 0

const averageFps = Math.round(
  performanceData.reduce((sum, item) => sum + item.fps, 0) /
    performanceData.length
)

const averageLatency = Math.round(
  performanceData.reduce((sum, item) => sum + item.latency, 0) /
    performanceData.length
)

const tooltipStyle = {
  background: '#111c2c',
  border: '1px solid #29384b',
  borderRadius: 8,
  color: '#e5e7eb',
}

export default function Analytics() {
  return (
    <div className="analytics-page">
      <div className="welcome-row">
        <div>
          <h2>Analytics Dashboard</h2>
          <p>Tracking insights, camera activity and system performance.</p>
        </div>
        <div className="demo-indicator">
          <span /> MOCK DATA ┬╖ DEMONSTRATION
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Objects</span>
            <div className="stat-icon cyan"><Eye size={19} /></div>
          </div>
          <div className="stat-value">{trackingObjects.length}</div>
          <div className="stat-bottom">
            <span className="stat-change">Tracked records</span>
            <span>Demo dataset</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Average Confidence</span>
            <div className="stat-icon green"><Target size={19} /></div>
          </div>
          <div className="stat-value">{averageConfidence}%</div>
          <div className="stat-bottom">
            <span className="stat-change">Mean score</span>
            <span>Across all objects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Active Cameras</span>
            <div className="stat-icon purple"><Camera size={19} /></div>
          </div>
          <div className="stat-value">{cameraData.length}</div>
          <div className="stat-bottom">
            <span className="stat-change">Camera records</span>
            <span>CAM-01 to CAM-04</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Average FPS</span>
            <div className="stat-icon orange"><Activity size={19} /></div>
          </div>
          <div className="stat-value">{averageFps}</div>
          <div className="stat-bottom">
            <span className="stat-change">Processing speed</span>
            <span>Illustrative metric</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="panel analytics-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-title">Tracking Status Distribution</div>
              <div className="panel-subtitle">Objects grouped by current status</div>
            </div>
            <span className="count-label">BY STATUS</span>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  innerRadius={62}
                  paddingAngle={4}
                >
                  {statusData.map(item => (
                    <Cell key={item.name} fill={statusColors[item.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel analytics-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-title">Camera-wise Object Count</div>
              <div className="panel-subtitle">Objects assigned to each camera</div>
            </div>
            <span className="count-label">BY CAMERA</span>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cameraData}>
                <CartesianGrid stroke="#263244" strokeDasharray="3 3" />
                <XAxis dataKey="camera" stroke="#748198" fontSize={11} />
                <YAxis
                  stroke="#748198"
                  fontSize={11}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="objects"
                  name="Objects"
                  fill="#22d3ee"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="panel analytics-panel analytics-performance">
        <div className="panel-heading">
          <div>
            <div className="panel-title">System Performance Trends</div>
            <div className="panel-subtitle">
              FPS and latency across recorded demo intervals
            </div>
          </div>
          <span className="count-label">PERFORMANCE</span>
        </div>

        <div className="performance-summary">
          <div>
            <span>Average FPS</span>
            <strong>{averageFps}</strong>
          </div>
          <div>
            <span>Average Latency</span>
            <strong>{averageLatency} ms</strong>
          </div>
        </div>

        <div className="analytics-chart performance-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid stroke="#263244" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#748198" fontSize={11} />
              <YAxis yAxisId="left" stroke="#22d3ee" fontSize={11} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#a78bfa"
                fontSize={11}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="fps"
                name="FPS"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="latency"
                name="Latency (ms)"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="health-note">
          Illustrative performance data ΓÇö not connected to a live backend.
        </div>
      </section>
    </div>
  )
}
