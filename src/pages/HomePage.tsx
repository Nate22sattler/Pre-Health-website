import homeHeroImage from '../assets/v3.jpeg'
import mentorCardImage from '../assets/mentor.jpg'
import internshipCardImage from '../assets/intern.jpg'
import careerCardImage from '../assets/career.jpg'
import type { View } from '../types'

type HomePageProps = {
  onNavigate: (view: View) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main className="page">
      <section
        className="home-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 20, 38, 0.58), rgba(10, 20, 38, 0.58)), url(${homeHeroImage})`,
        }}
      >
        <div className="home-hero-copy">
          <p className="section-label">Sattler Pre-Health Association</p>
          <h1>Find</h1>
          <h1>Ask questions</h1>
          <h1>Move forward</h1>
        </div>
      </section>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="section-label">Sattler Pre-Health Association</p>
          <h2>Choosing your path can be a formidable obstacle. We&apos;re here to change that.</h2>
          <p className="lead">
            This platform is designed to help students discover career paths, learn from alumni,
            and reach out with clarity and confidence. To begin browsing alumnis or research
            oppurtunities navigate to the respective page. 
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate('directory')}>
              Browse alumni
            </button>
            <a className="secondary-link" href="#how-it-works">
              See the plan
            </a>
          </div>
        </div>

        <div className="hero-side-stack">
          <aside className="brand-panel">
            <div className="brand-panel-copy">
              <h3>Connect. Equip. Serve.</h3>
              <p>
                The Sattler Pre-Health Association is aimed at creating a tight-knit community
                among fellow students pursuing health careers, equipping them to stay motivated and
                navigate the path to graduate school. This will be accomplished through building
                broader networks, compiling resources, and offering various workshops and speaking
                events through the semester.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section id="how-it-works" className="content-grid">
        <button
          type="button"
          className="content-card content-card-photo"
          style={{ backgroundImage: `url(${mentorCardImage})` }}
          onClick={() => onNavigate('directory')}
        >
          <p className="section-label">mentor connections</p>
          <h3>Connect with Alumni Mentors</h3>
        </button>

        <button
          type="button"
          className="content-card content-card-photo"
          style={{ backgroundImage: `url(${internshipCardImage})` }}
          onClick={() => onNavigate('internships')}
        >
          <p className="section-label">career discovery</p>
          <h3>Discover Internships and Experiences</h3>
        </button>

        <button
          type="button"
          className="content-card content-card-photo"
          style={{ backgroundImage: `url(${careerCardImage})` }}
          onClick={() => onNavigate('internships')}
        >
          <p className="section-label">real world experience</p>
          <h3>Explore Healthcare Paths</h3>
        </button>
      </section>
    </main>
  )
}
