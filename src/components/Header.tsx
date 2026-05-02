import preHealthLogo from '../assets/pre-health-logo.png'
import type { View } from '../types'

type HeaderProps = {
  view: View
  isAdmin: boolean
  onNavigate: (view: View) => void
  onSignOut: () => void
}

export function Header({ view, isAdmin, onNavigate, onSignOut }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img
          className="topbar-logo"
          src={preHealthLogo}
          alt="Sattler Pre-Health Association logo with the motto Connect, Equip, Serve."
        />
        <p className="eyebrow">Sattler College Pre-Health Association</p>
      </div>
      <div className="topbar-actions">
        <nav className="nav">
          <button className={view === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('home')}>
            Main page
          </button>
          <button
            className={view === 'directory' ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate('directory')}
          >
            Alumni contacts
          </button>
          <button
            className={view === 'internships' ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate('internships')}
          >
            Internships
          </button>
          {isAdmin ? (
            <button
              className={view === 'review' ? 'nav-link active' : 'nav-link'}
              onClick={() => onNavigate('review')}
            >
              Review submissions
            </button>
          ) : null}
        </nav>

        <div className="session-tools">
          <button
            type="button"
            className="nav-link"
            onClick={() => {
              void onSignOut()
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}

export function PublicHeader() {
  return (
    <header className="topbar public-topbar">
      <div className="topbar-brand">
        <img
          className="topbar-logo"
          src={preHealthLogo}
          alt="Sattler Pre-Health Association logo with the motto Connect, Equip, Serve."
        />
        <p className="eyebrow">Sattler College Pre-Health Club</p>
      </div>
    </header>
  )
}
