import { Bell, Menu, Search, CircleHelp } from 'lucide-react'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <Menu size={21} />
        </button>

        <div>
          <div className="breadcrumb">ARGUS-X / WORKSPACE</div>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="header-actions">
        <div className="header-search">
          <Search size={16} />
          <span>Search objects...</span>
          <kbd>⌘ K</kbd>
        </div>

        <button className="icon-button" title="Help">
          <CircleHelp size={19} />
        </button>

        <button className="icon-button notification" title="Notifications">
          <Bell size={19} />
          <span />
        </button>

        <div className="avatar">AX</div>
      </div>
    </header>
  )
}