import type { ReactNode } from 'react'
import preHealthLogo from '../assets/pre-health-logo.png'
import { ALLOWED_EMAIL_DOMAIN_LABEL } from '../auth'

type AuthGateScreenProps = {
  error: string | null
  isSigningIn: boolean
  onSignIn: () => void
}

type AuthShellProps = {
  children: ReactNode
  asideTitle: string
  asideText: string
}

function AuthShell({ children, asideTitle, asideText }: AuthShellProps) {
  return (
    <div className="site-shell">
      <main className="page auth-screen">
        <section className="auth-panel">
          <div className="hero-copy auth-copy">{children}</div>

          <aside className="brand-panel auth-aside">
            <div className="brand-panel-frame">
              <img
                className="brand-logo"
                src={preHealthLogo}
                alt="Sattler Pre-Health Association logo with the motto Connect, Equip, Serve."
              />
            </div>
            <div className="brand-panel-copy">
              <h3>{asideTitle}</h3>
              <p>{asideText}</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export function AuthLoadingScreen() {
  return (
    <AuthShell
      asideTitle="Trusted access only"
      asideText="This space is reserved for the Sattler pre-health community so students can share resources and reflections with confidence."
    >
      <p className="section-label">Private community access</p>
      <h2>Checking your Sattler access.</h2>
      <p className="lead">
        We&apos;re verifying your session so the site can stay private to institutional members.
      </p>
      <p className="auth-loading-state">Loading secure access...</p>
    </AuthShell>
  )
}

export function AuthGateScreen({ error, isSigningIn, onSignIn }: AuthGateScreenProps) {
  return (
    <AuthShell
      asideTitle="Why the gate?"
      asideText="We're protecting contact details and student reflections by limiting access to trusted institutional accounts."
    >
      <p className="section-label">Private community access</p>
      <h2>Sign in with your Sattler Google account.</h2>
      <p className="lead">
        The directory, internship guide, and shared reflections are only available to approved
        institutional users.
      </p>

      <div className="auth-actions">
        <button
          type="button"
          className="primary-button"
          onClick={onSignIn}
          disabled={isSigningIn}
        >
          {isSigningIn ? 'Redirecting to Google...' : 'Continue with Google'}
        </button>
        <p className="auth-note">
          Only Google accounts with an <strong>{ALLOWED_EMAIL_DOMAIN_LABEL}</strong> email address
          can access this site.
        </p>
      </div>

      {error ? <p className="auth-feedback auth-feedback-error">{error}</p> : null}
    </AuthShell>
  )
}
