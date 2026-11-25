
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  change: string
  icon: ReactNode
  color: string
  detail: string
}

export default function StatCard({
  label,
  value,
  change,
  icon,
  color,
  detail,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-bottom">
        <span className="stat-change">
          <ArrowUpRight size={14} /> {change}
        </span>
        <span>{detail}</span>
      </div>
    </div>
  )
}
