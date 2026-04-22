// Is the thing that displays the different elements of the web app; is rendered by main.tsx.

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import preHealthLogo from './assets/pre-health-logo.png'
import './App.css'
import { supabase } from './supabaseClient'

type View = 'home' | 'directory' | 'internships' | 'submit'

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

type SubmissionFormData = {
  fullName: string
  email: string
  field: string
  role: string
  organization: string
  location: string
  connectionType: string
  topics: string
  notes: string
  preferredContact: string
  mentoringInterest: string
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

const initialFormData: SubmissionFormData = {
  fullName: '',
  email: '',
  field: '',
  role: '',
  organization: '',
  location: '',
  connectionType: '',
  topics: '',
  notes: '',
  preferredContact: '',
  mentoringInterest: '',
}

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedField, setSelectedField] = useState('All fields')
  const [formData, setFormData] = useState<SubmissionFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SubmissionFormData, string>>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setFormErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  function validateForm() {
    const nextErrors: Partial<Record<keyof SubmissionFormData, string>> = {}

    if (!formData.fullName.trim()) nextErrors.fullName = 'Please enter your name.'
    if (!formData.email.trim()) nextErrors.email = 'Please enter your email address.'
    if (!formData.field.trim()) nextErrors.field = 'Please enter your profession or career field.'
    if (!formData.role.trim()) nextErrors.role = 'Please enter your current role or title.'
    if (!formData.location.trim()) nextErrors.location = 'Please enter your location.'
    if (!formData.connectionType.trim()) {
      nextErrors.connectionType = 'Please select how you would like to be listed.'
    }
    if (!formData.topics.trim()) {
      nextErrors.topics = 'Please share at least one area students can ask you about.'
    }
    if (!formData.preferredContact.trim()) {
      nextErrors.preferredContact = 'Please choose a preferred contact method.'
    }
    if (!formData.mentoringInterest.trim()) {
      nextErrors.mentoringInterest = 'Please let us know if you are willing to mentor.'
    }

    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      setIsSubmitted(false)
      return
    }

    setFormErrors({})
    setIsSubmitted(true)
    setFormData(initialFormData)
  }

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

            <div className="directory-actions">
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

              <button className="primary-button" onClick={() => setView('submit')}>
                Submit Your Information
              </button>
            </div>
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
      ) : view === 'submit' ? (
        <main className="page">
          <section className="submit-layout">
            <div className="hero-copy">
              <p className="section-label">Join the network</p>
              <h2>Share your story so students know who they can learn from.</h2>
              <p className="lead">
                Alumni and health professionals can use this form to submit their information for
                the Sattler Pre-Health Association directory. We want students to find mentors,
                ask thoughtful questions, and better understand the paths in front of them.
              </p>
            </div>

            <aside className="signal-card">
              <p className="section-label">What to include</p>
              <ul>
                <li>Share the areas where you feel most helpful to students.</li>
                <li>Use the notes section to mention anything that gives context to your path.</li>
                <li>Choose how you would prefer students or club leaders to contact you.</li>
              </ul>
            </aside>
          </section>

          <section className="submit-form-panel">
            <div className="submit-form-header">
              <div>
                <p className="section-label">Submission form</p>
                <h3>Tell us a little about yourself.</h3>
              </div>
              {isSubmitted ? (
                <p className="success-message">
                  Thank you for submitting your information. We&apos;ll use it to help connect
                  students with mentors and professionals they can learn from.
                </p>
              ) : null}
            </div>

            <form className="submit-form" onSubmit={handleSubmit} noValidate>
              <label className="form-field">
                <span>Full Name</span>
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                {formErrors.fullName ? <small>{formErrors.fullName}</small> : null}
              </label>

              <label className="form-field">
                <span>Email Address</span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {formErrors.email ? <small>{formErrors.email}</small> : null}
              </label>

              <label className="form-field">
                <span>Profession / Career Field</span>
                <input
                  name="field"
                  type="text"
                  value={formData.field}
                  onChange={handleInputChange}
                />
                {formErrors.field ? <small>{formErrors.field}</small> : null}
              </label>

              <label className="form-field">
                <span>Current Role / Title</span>
                <input name="role" type="text" value={formData.role} onChange={handleInputChange} />
                {formErrors.role ? <small>{formErrors.role}</small> : null}
              </label>

              <label className="form-field">
                <span>Organization or School</span>
                <input
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleInputChange}
                />
              </label>

              <label className="form-field">
                <span>Location</span>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                />
                {formErrors.location ? <small>{formErrors.location}</small> : null}
              </label>

              <label className="form-field">
                <span>Are you a Sattler alum, health professional, or both?</span>
                <select
                  name="connectionType"
                  value={formData.connectionType}
                  onChange={handleInputChange}
                >
                  <option value="">Select one</option>
                  <option value="Sattler alum">Sattler alum</option>
                  <option value="Health professional">Health professional</option>
                  <option value="Both">Both</option>
                </select>
                {formErrors.connectionType ? <small>{formErrors.connectionType}</small> : null}
              </label>

              <label className="form-field form-field-wide">
                <span>Areas students can ask you about</span>
                <textarea
                  name="topics"
                  rows={4}
                  value={formData.topics}
                  onChange={handleInputChange}
                />
                {formErrors.topics ? <small>{formErrors.topics}</small> : null}
              </label>

              <label className="form-field form-field-wide">
                <span>Short Bio / Notes</span>
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </label>

              <label className="form-field">
                <span>Preferred contact method</span>
                <select
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleInputChange}
                >
                  <option value="">Select one</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Club leader introduction">Club leader introduction</option>
                </select>
                {formErrors.preferredContact ? <small>{formErrors.preferredContact}</small> : null}
              </label>

              <label className="form-field">
                <span>Willingness to mentor students</span>
                <select
                  name="mentoringInterest"
                  value={formData.mentoringInterest}
                  onChange={handleInputChange}
                >
                  <option value="">Select one</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {formErrors.mentoringInterest ? <small>{formErrors.mentoringInterest}</small> : null}
              </label>

              <div className="form-actions form-field-wide">
                <button className="primary-button" type="submit">
                  Submit information
                </button>
              </div>
            </form>
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
