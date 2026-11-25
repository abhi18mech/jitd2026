
import { useMemo, useState } from 'react'
import {
  Bell,
  Menu,
  Search,
  CircleHelp,
  X,
  CheckCheck,
  AlertTriangle,
  RefreshCw,
  Activity,
  UserRound,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { trackingObjects } from '../data/mockData'

interface HeaderProps {
  title: string
  onMenuClick: () => void
  onSearch: (query: string) => void
  onNavigate: (page: string) => void
}

export default function Header({
  title,
  onMenuClick,
  onSearch,
  onNavigate,
}: HeaderProps) {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [readNotifications, setReadNotifications] = useState(false)

  const results = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return []

    return trackingObjects.filter(object =>
      object.id.toLowerCase().includes(query) ||
      object.type.toLowerCase().includes(query) ||
      object.camera.toLowerCase().includes(query)
    )
  }, [search])

  const notifications = trackingObjects.filter(
    object =>
      object.status === 'Lost' ||
      object.status === 'Uncertain' ||
      object.status === 'Recovered'
  )

  const unreadCount = readNotifications ? 0 : notifications.length

  const handleSearch = () => {
    if (!search.trim()) return
    onSearch(search.trim())
    setSearchOpen(false)
  }

  const handleNotificationClick = (objectId: string) => {
    setSearch(objectId)
    setSearchOpen(false)
    setNotificationsOpen(false)
    setHelpOpen(false)
    setProfileOpen(false)
    onSearch(objectId)
  }

  const openSettings = () => {
    onNavigate('Settings')
    setProfileOpen(false)
  }

  return (
    <header className="topbar">
      <div className="header-left">
        <button
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div>
          <div className="breadcrumb">ARGUS-X / WORKSPACE</div>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="header-actions">

        {/* Search */}
        <div className="header-search-container">
          <div className="header-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search objects..."
              value={search}
              onFocus={() => setSearchOpen(true)}
              onChange={event => {
                setSearch(event.target.value)
                setSearchOpen(true)
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') handleSearch()
                if (event.key === 'Escape') setSearchOpen(false)
              }}
              aria-label="Search tracked objects"
            />

            {search && (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {searchOpen && search.trim() && (
            <div className="header-search-results">
              {results.length > 0 ? (
                results.map(object => (
                  <button
                    type="button"
                    key={object.id}
                    onClick={() => handleNotificationClick(object.id)}
                  >
                    <strong>{object.id}</strong>
                    <span>
                      {object.type} · {object.camera} · {object.status}
                    </span>
                  </button>
                ))
              ) : (
                <div className="header-no-results">
                  No matching objects found
                </div>
              )}

              {results.length > 0 && (
                <button
                  type="button"
                  className="header-search-all"
                  onClick={handleSearch}
                >
                  View all matching objects
                </button>
              )}
            </div>
          )}
        </div>

        {/* Help */}
        <div className="header-popup-container">
          <button
            type="button"
            className="icon-button"
            title="Help"
            aria-label="Open Help Center"
            onClick={() => {
              setHelpOpen(!helpOpen)
              setNotificationsOpen(false)
              setProfileOpen(false)
            }}
          >
            <CircleHelp size={19} />
          </button>

          {helpOpen && (
            <div className="header-help-popup">
              <div className="header-popup-heading">
                <div>
                  <strong>Help Center</strong>
                  <p>ARGUS-X User Guide</p>
                </div>

                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  aria-label="Close help"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="help-item">
                <strong>Search Objects</strong>
                <p>Find objects using their ID, type or camera ID.</p>
              </div>

              <div className="help-item">
                <strong>Live Monitoring</strong>
                <p>View the simulated camera feed and detected objects.</p>
              </div>

              <div className="help-item">
                <strong>Object Tracking</strong>
                <p>View tracked objects and their current status.</p>
              </div>

              <div className="help-item">
                <strong>Identity Recovery</strong>
                <p>Review identity recovery events.</p>
              </div>

              <div className="help-item">
                <strong>Tracking History</strong>
                <p>Review recorded tracking events.</p>
              </div>

              <div className="help-item">
                <strong>Analytics</strong>
                <p>View tracking and performance statistics.</p>
              </div>

              <div className="help-demo-note">
                DEMO HELP CONTENT
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="header-popup-container">
          <button
            type="button"
            className="icon-button notification"
            title="Notifications"
            aria-label="Open notifications"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen)
              setHelpOpen(false)
              setProfileOpen(false)
            }}
          >
            <Bell size={19} />
            {unreadCount > 0 && <span />}
          </button>

          {notificationsOpen && (
            <div className="header-notifications-popup">
              <div className="notification-heading">
                <div>
                  <strong>Notifications</strong>
                  <p>
                    {unreadCount > 0
                      ? `${unreadCount} unread demo alerts`
                      : 'All alerts marked as read'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(object => (
                    <button
                      type="button"
                      className="notification-item notification-clickable"
                      key={object.id}
                      onClick={() => handleNotificationClick(object.id)}
                    >
                      <div className={`notification-icon ${
                        object.status === 'Lost'
                          ? 'notification-lost'
                          : object.status === 'Recovered'
                          ? 'notification-recovered'
                          : 'notification-uncertain'
                      }`}>
                        {object.status === 'Lost' ? (
                          <AlertTriangle size={17} />
                        ) : object.status === 'Recovered' ? (
                          <RefreshCw size={17} />
                        ) : (
                          <Activity size={17} />
                        )}
                      </div>

                      <div className="notification-content">
                        <strong>
                          {object.status === 'Lost'
                            ? 'Object Lost'
                            : object.status === 'Recovered'
                            ? 'Identity Recovered'
                            : 'Uncertain Tracking'}
                        </strong>

                        <p>
                          {object.id} · {object.type} · {object.camera}
                        </p>

                        <small>
                          Status: {object.status} · {object.lastSeen}
                        </small>
                      </div>

                      {!readNotifications && (
                        <span className="notification-unread-dot" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="notification-empty">
                    No notifications available
                  </div>
                )}
              </div>

              <button
                type="button"
                className="mark-notifications-read"
                onClick={() => setReadNotifications(true)}
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>

              <div className="notification-demo-note">
                DEMONSTRATION ALERTS · MOCK DATA
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="header-popup-container">
          <button
            type="button"
            className="avatar profile-avatar"
            title="Profile"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen(!profileOpen)
              setHelpOpen(false)
              setNotificationsOpen(false)
            }}
          >
            AX
            <ChevronDown size={12} />
          </button>

          {profileOpen && (
            <div className="header-profile-popup">
              <div className="profile-user-info">
                <div className="profile-large-avatar">
                  <UserRound size={23} />
                </div>

                <div>
                  <strong>ARGUS-X Operator</strong>
                  <p>Administrator</p>
                </div>
              </div>

              <div className="profile-status">
                <span className="profile-status-dot" />
                Demo session active
              </div>

              <div className="profile-divider" />

              <button
                type="button"
                className="profile-menu-item"
                onClick={openSettings}
              >
                <Settings size={17} />
                <span>Settings</span>
              </button>

              <div className="profile-demo-note">
                DEMONSTRATION PROFILE
              </div>

              <div className="profile-signout-disabled">
                <LogOut size={16} />
                <span>Sign out unavailable in demo</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
