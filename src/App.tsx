// Is the thing that displays the different elements of the web app; is rendered by main.tsx.

import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

type View = 'home' | 'directory' | 'internships'

type Contact = {
  name: string
  field: string
  role: string
  location: string
  connectionType: string
  notes: string
}

type Internship = {
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

const internships: Internship[] = [
  {
    title: 'Hospital Volunteer Internship',
    organization: 'Boston Medical Center',
    focus: 'Clinical exposure',
    term: 'Summer',
    location: 'Boston, MA',
    format: 'In person',
    applicationWindow: 'January-March',
    fit: 'Pre-med and pre-PA students',
    description:
      'A structured placement that helps students observe patient-facing environments, build professionalism, and reflect on clinical calling.',
    nextStep:
      'Prepare a short resume, ask for one reference, and be ready to explain why direct service matters to you.',
  },
  {
    title: 'Public Health Research Internship',
    organization: 'Massachusetts Department of Public Health',
    focus: 'Community health and policy',
    term: 'Summer or semester',
    location: 'Hybrid',
    format: 'Hybrid',
    applicationWindow: 'February-April',
    fit: 'Public health, biology, and psychology students',
    description:
      'Students support outreach, data organization, and program evaluation while learning how prevention work happens beyond the clinic.',
    nextStep:
      'Look for application prompts about communication, service, and interest in health equity before submitting.',
  },
  {
    title: 'Dental Shadowing Fellowship',
    organization: 'Worcester Family Dental',
    focus: 'Dental practice exposure',
    term: 'Rolling placements',
    location: 'Worcester, MA',
    format: 'In person',
    applicationWindow: 'Year-round',
    fit: 'Students exploring dentistry',
    description:
      'A lighter-commitment opportunity designed for students who want to understand the pace, teamwork, and patient education side of dentistry.',
    nextStep:
      'Reach out with a concise email, a brief introduction, and a few available dates for observation.',
  },
]

const fields = ['All fields', ...new Set(contacts.map((contact) => contact.field))]

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedField, setSelectedField] = useState('All fields')

  // Test Supabase connection
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from('test_table')
        .select('*')

      console.log('SUPABASE DATA:', data)
      console.log('SUPABASE ERROR:', error)
    }

    testConnection()
  }, [])

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
            {internships.map((internship) => (
              <article key={internship.title} className="internship-card">
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
            ))}
          </section>
        </main>
      )}
    </div>
  )
}

export default App
