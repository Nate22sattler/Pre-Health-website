// Is the thing that displays the different elements of the web app; is rendered by main.tsx.

import { useEffect, useState } from 'react'
import preHealthLogo from './assets/pre-health-logo.png'
import './App.css'
import { supabase } from './supabaseClient'

type View = 'home' | 'directory' | 'internships'

type Contact = {
  id: string
  name: string
  field: string
  role: string
  location: string
  connectionType: string
  notes: string
}

type Internship = {
  id: string
  title: string
  organization: string
  focus: string
  term: string
  location: string
  format: string
  applicationWindow: string
  fit: string
  description: string
  nextStep: string
}

type ContactRow = {
  id: string
  name: string
  field: string
  role: string
  location: string
  connection_type: string
  notes: string
}

type InternshipRow = {
  id: string
  title: string
  organization: string
  focus: string
  term: string
  location: string
  format: string
  application_window: string
  fit: string
  description: string
  next_step: string
}

function mapContactRow(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    field: row.field,
    role: row.role,
    location: row.location,
    connectionType: row.connection_type,
    notes: row.notes,
  }
}

function mapInternshipRow(row: InternshipRow): Internship {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    focus: row.focus,
    term: row.term,
    location: row.location,
    format: row.format,
    applicationWindow: row.application_window,
    fit: row.fit,
    description: row.description,
    nextStep: row.next_step,
  }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedField, setSelectedField] = useState('All fields')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadData() {
      setLoading(true)
      setError(null)

      const [
        { data: contactRows, error: contactsError },
        { data: internshipRows, error: internshipsError },
      ] = await Promise.all([
        supabase.from('contacts').select('*').order('name'),
        supabase.from('internships').select('*').order('title'),
      ])

      if (!isActive) {
        return
      }

      if (contactsError || internshipsError) {
        setError(
          contactsError?.message ?? internshipsError?.message ?? 'Unable to load data from Supabase.',
        )
        setLoading(false)
        return
      }

      setContacts(((contactRows as ContactRow[] | null) ?? []).map((row: ContactRow) => mapContactRow(row)))
      setInternships(
        ((internshipRows as InternshipRow[] | null) ?? []).map((row: InternshipRow) =>
          mapInternshipRow(row),
        ),
      )
      setLoading(false)
    }

    void loadData()

    return () => {
      isActive = false
    }
  }, [])

  const fields = ['All fields', ...new Set(contacts.map((contact) => contact.field))]

  const visibleContacts =
    selectedField === 'All fields'
      ? contacts
      : contacts.filter((contact) => contact.field === selectedField)

  return (
    <div className="site-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Sattler College Pre-Health Club</p>
          <h1>Find mentors. Ask questions. Move forward.</h1>
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
          <button
            className={view === 'internships' ? 'nav-link active' : 'nav-link'}
            onClick={() => setView('internships')}
          >
            Internships
          </button>
        </nav>
      </header>

      {view === 'home' ? (
        <main className="page">
          <section className="hero-panel">
            <div className="hero-copy">
              <p className="section-label">Sattler Pre-Health Association</p>
              <h2>Choosing your path can be a formidable obstacle. We&apos;re here to change that.</h2>
              <p className="lead">
                This platform is designed to help students discover career paths, learn from
                alumni, and reach out with clarity and confidence. To begin browsing alumnis or research oppurtunities navigate to the respective page. 
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

            <div className="hero-side-stack">
              <aside className="brand-panel">
                <div className="brand-panel-frame">
                  <img
                    className="brand-logo"
                    src={preHealthLogo}
                    alt="Sattler Pre-Health Association logo with the motto Connect, Equip, Serve."
                  />
                </div>

                <div className="brand-panel-copy">
                  <h3>Connect. Equip. Serve.</h3>
                  <p>
                    The Sattler Pre-Health Association is aimed at creating a tight-knit community among fellow students pursuing health careers, equipping them to stay motivated and navigate the path to graduate school. This will be accomplished through building broader networks, compiling resources, and offering various workshops and speaking events through the semester.
                  </p>
                </div>
              </aside>
            </div>
          </section>

          <section id="how-it-works" className="content-grid">
            <article className="content-card">
              <p className="section-label">mentor connections</p>
              <h3>Connect with Alumni Mentors</h3>
              <ul>
                <li>Explain the mission in one sentence.</li>
                <li>Show how students can use the site in a few quick steps.</li>
                <li>Invite alumni and professionals to participate.</li>
              </ul>
            </article>

            <article className="content-card">
              <p className="section-label">career discovery</p>
              <h3>Discover Internships and Experiences</h3>
              <ul>
                <li>Name, field, current role, location, and best topics to discuss.</li>
                <li>Clear categories like medicine, dentistry, PT, nursing, or public health.</li>
                <li>Simple filters so students can find relevant mentors quickly.</li>
              </ul>
            </article>

            <article className="content-card">
              <p className="section-label">real world experience</p>
              <h3>Explore Healthcare Paths</h3>
              <ul>
                <li>Search and filtering by major, profession, and application stage.</li>
                <li>A request form for students who want an introduction.</li>
                <li>Admin tools for club leaders to update alumni entries each semester.</li>
              </ul>
            </article>
          </section>
        </main>
      ) : view === 'directory' ? (
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
            {loading ? (
              <article className="content-card status-card">
                <p>Loading alumni contacts...</p>
              </article>
            ) : error ? (
              <article className="content-card status-card">
                <p>{error}</p>
              </article>
            ) : visibleContacts.length === 0 ? (
              <article className="content-card status-card">
                <p>No contacts available yet.</p>
              </article>
            ) : (
              visibleContacts.map((contact) => (
                <article key={contact.id} className="contact-card">
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
              ))
            )}
          </section>
        </main>
      ) : (
        <main className="page">
          <section className="internships-hero">
            <div className="hero-copy">
              <p className="section-label">Internship guide</p>
              <h2>Find early experiences that help you test your direction.</h2>
              <p className="lead">
                This page gives students a simple starting point for exploring internships
                across clinical, research, and community health settings. Each opportunity
                highlights what it is best for, when to apply, and how to prepare.
              </p>
            </div>

            <aside className="signal-card">
              <p className="section-label">How to use this page</p>
              <ul>
                <li>Start with opportunities that match the kind of exposure you need next.</li>
                <li>Pay attention to timing so you can prepare before application windows open.</li>
                <li>Use the next-step note to turn interest into one concrete action.</li>
              </ul>
            </aside>
          </section>

          <section className="internship-overview">
            <article className="content-card">
              <p className="section-label">Why internships matter</p>
              <h3>They help students move from general interest to informed commitment.</h3>
              <p>
                Good internships give more than a line on a resume. They help students see
                workflows, ask better questions, and notice which settings energize them.
              </p>
            </article>

            <article className="content-card">
              <p className="section-label">What to look for</p>
              <h3>Choose opportunities with clear learning value.</h3>
              <p>
                Strong options usually offer mentorship, direct observation, and enough
                structure for you to understand how the organization actually serves people.
              </p>
            </article>
          </section>

          <section className="internships-list">
            {loading ? (
              <article className="content-card status-card">
                <p>Loading internships...</p>
              </article>
            ) : error ? (
              <article className="content-card status-card">
                <p>{error}</p>
              </article>
            ) : internships.length === 0 ? (
              <article className="content-card status-card">
                <p>No internships available yet.</p>
              </article>
            ) : (
              internships.map((internship) => (
                <article key={internship.id} className="internship-card">
                  <div className="internship-header">
                    <div>
                      <p className="contact-field">{internship.focus}</p>
                      <h3>{internship.title}</h3>
                    </div>
                    <p className="internship-organization">{internship.organization}</p>
                  </div>

                  <p className="internship-description">{internship.description}</p>

                  <div className="internship-table-wrapper">
                    <table className="internship-table">
                      <tbody>
                        <tr>
                          <th scope="row">Term</th>
                          <td>{internship.term}</td>
                        </tr>
                        <tr>
                          <th scope="row">Location</th>
                          <td>{internship.location}</td>
                        </tr>
                        <tr>
                          <th scope="row">Format</th>
                          <td>{internship.format}</td>
                        </tr>
                        <tr>
                          <th scope="row">Apply</th>
                          <td>{internship.applicationWindow}</td>
                        </tr>
                        <tr>
                          <th scope="row">Best fit</th>
                          <td>{internship.fit}</td>
                        </tr>
                        <tr>
                          <th scope="row">Next step</th>
                          <td>{internship.nextStep}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>
              ))
            )}
          </section>
        </main>
      )}
    </div>
  )
}

export default App
