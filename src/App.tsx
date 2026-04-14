import { useState } from 'react'
import './App.css'

type View = 'home' | 'directory'

type Contact = {
  name: string
  field: string
  role: string
  location: string
  connectionType: string
  notes: string
}

const contacts: Contact[] = [
  {
    name: 'Rachel Kim',
    field: 'Medicine',
    role: 'MS2, University of Rochester School of Medicine',
    location: 'New York',
    connectionType: 'Medical school',
    notes: 'Happy to speak with pre-med students about gap years, applications, and interviews.',
  },
  {
    name: 'Daniel Owusu',
    field: 'Physical Therapy',
    role: 'Physical Therapist, Hartford HealthCare',
    location: 'Connecticut',
    connectionType: 'Clinical career',
    notes: 'Can share what clinical rotations are like and how to compare PT programs.',
  },
  {
    name: 'Mia Hernandez',
    field: 'Public Health',
    role: 'Program Coordinator, Boston community health nonprofit',
    location: 'Massachusetts',
    connectionType: 'Public health',
    notes: 'Interested in mentoring students exploring community health and policy work.',
  },
  {
    name: 'Nathan Brooks',
    field: 'Dentistry',
    role: 'D1, Tufts University School of Dental Medicine',
    location: 'Massachusetts',
    connectionType: 'Dental school',
    notes: 'Can answer questions about shadowing, DAT prep, and choosing between schools.',
  },
]

const fields = ['All fields', ...new Set(contacts.map((contact) => contact.field))]

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedField, setSelectedField] = useState('All fields')

  const visibleContacts =
    selectedField === 'All fields'
      ? contacts
      : contacts.filter((contact) => contact.field === selectedField)

  return (
    <div className="site-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Sattler College Pre-Health Club</p>
          <h1>Build a bridge from curious students to trusted mentors.</h1>
        </div>
        <nav className="nav">
          <button
            className={view === 'home' ? 'nav-link active' : 'nav-link'}
            onClick={() => setView('home')}
          >
            Main page
          </button>
          <button
            className={view === 'directory' ? 'nav-link active' : 'nav-link'}
            onClick={() => setView('directory')}
          >
            Alumni contacts
          </button>
        </nav>
      </header>

      {view === 'home' ? (
        <main className="page">
          <section className="hero-panel">
            <div className="hero-copy">
              <p className="section-label">Why this site matters</p>
              <h2>Students should not have to figure out healthcare careers alone.</h2>
              <p className="lead">
                This website can become the club&apos;s central place for students to
                discover career paths, learn from alumni, and reach out with more confidence.
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => setView('directory')}>
                  Browse alumni
                </button>
                <a className="secondary-link" href="#how-it-works">
                  See the plan
                </a>
              </div>
            </div>

            <aside className="signal-card">
              <p className="section-label">First MVP</p>
              <ul>
                <li>A welcoming homepage that explains the purpose of the club network.</li>
                <li>A clean alumni directory organized by field and career stage.</li>
                <li>A simple way for students to know who to contact and what to ask.</li>
              </ul>
            </aside>
          </section>

          <section id="how-it-works" className="content-grid">
            <article className="content-card">
              <p className="section-label">Main page goals</p>
              <h3>What the homepage should do</h3>
              <ul>
                <li>Explain the mission in one sentence.</li>
                <li>Show how students can use the site in a few quick steps.</li>
                <li>Invite alumni and professionals to participate.</li>
              </ul>
            </article>

            <article className="content-card">
              <p className="section-label">Directory goals</p>
              <h3>What the contacts page should include</h3>
              <ul>
                <li>Name, field, current role, location, and best topics to discuss.</li>
                <li>Clear categories like medicine, dentistry, PT, nursing, or public health.</li>
                <li>Simple filters so students can find relevant mentors quickly.</li>
              </ul>
            </article>

            <article className="content-card">
              <p className="section-label">What comes later</p>
              <h3>Strong next features after the MVP</h3>
              <ul>
                <li>Search and filtering by major, profession, and application stage.</li>
                <li>A request form for students who want an introduction.</li>
                <li>Admin tools for club leaders to update alumni entries each semester.</li>
              </ul>
            </article>
          </section>
        </main>
      ) : (
        <main className="page">
          <section className="directory-header">
            <div>
              <p className="section-label">Alumni directory</p>
              <h2>Start with a small, high-trust list of mentors.</h2>
              <p className="lead">
                Even ten strong contacts is enough to make this page valuable in the first version.
              </p>
            </div>

            <label className="filter">
              <span>Filter by field</span>
              <select
                value={selectedField}
                onChange={(event) => setSelectedField(event.target.value)}
              >
                {fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="directory-grid">
            {visibleContacts.map((contact) => (
              <article key={contact.name} className="contact-card">
                <div className="contact-header">
                  <p className="contact-field">{contact.field}</p>
                  <h3>{contact.name}</h3>
                </div>
                <p className="contact-role">{contact.role}</p>
                <dl className="contact-meta">
                  <div>
                    <dt>Location</dt>
                    <dd>{contact.location}</dd>
                  </div>
                  <div>
                    <dt>Best for</dt>
                    <dd>{contact.connectionType}</dd>
                  </div>
                </dl>
                <p className="contact-notes">{contact.notes}</p>
              </article>
            ))}
          </section>
        </main>
      )}
    </div>
  )
}

export default App
