import type { FormEvent } from 'react'
import type {
  ExperienceDraft,
  ExperiencePanelMode,
  Internship,
  InternshipExperience,
} from '../types'
import { createExperienceDraft, idealCandidateOptions, opportunityTypeOptions } from '../constants'
import { formatExperienceDate } from '../lib/formatters'
import { FormOptions } from '../components/FormOptions'
import { InternshipTable } from '../components/InternshipTable'

type InternshipsPageProps = {
  internships: Internship[]
  loading: boolean
  error: string | null
  isAdmin: boolean
  currentUserId: string | undefined
  editingInternshipId: string | null
  internshipEditDraft: Omit<Internship, 'id'> | null
  internshipSavingById: Record<string, boolean>
  internshipDeletingById: Record<string, boolean>
  experiencePanelModeByInternshipId: Record<string, ExperiencePanelMode | null>
  experiencesByInternshipId: Record<string, InternshipExperience[]>
  experienceLoadingByInternshipId: Record<string, boolean>
  experienceErrorByInternshipId: Record<string, string | null>
  experienceDraftsByInternshipId: Record<string, ExperienceDraft>
  experienceFormErrorByInternshipId: Record<string, string | null>
  experienceSubmittingByInternshipId: Record<string, boolean>
  experienceDeletingById: Record<string, boolean>
  editingExperienceId: string | null
  experienceEditDraft: string
  experienceSavingById: Record<string, boolean>
  onExperienceAuthorInputRef: (internshipId: string, element: HTMLInputElement | null) => void
  onInternshipEditStart: (internship: Internship) => void
  onInternshipEditCancel: () => void
  onInternshipEditDraftChange: (field: keyof Omit<Internship, 'id'>, value: string) => void
  onInternshipEditSave: (internshipId: string) => void
  onInternshipDelete: (internshipId: string) => void
  onToggleReadExperienceSection: (internshipId: string) => void
  onShareExperience: (internshipId: string) => void
  onExperienceDraftChange: (internshipId: string, field: keyof ExperienceDraft, value: string) => void
  onExperienceSubmit: (event: FormEvent<HTMLFormElement>, internshipId: string) => void
  onExperienceEditStart: (experience: InternshipExperience) => void
  onExperienceEditCancel: () => void
  onExperienceEditDraftChange: (value: string) => void
  onExperienceEditSave: (internshipId: string, experienceId: string) => void
  onExperienceDelete: (internshipId: string, experienceId: string) => void
}

export function InternshipsPage(props: InternshipsPageProps) {
  return (
    <main className="page">
      <section className="internships-hero">
        <div className="hero-copy">
          <p className="section-label">Internship guide</p>
          <h2>Where ambition meets innovation. Find a world-class internship that shapes your future.</h2>
          <p className="lead">
            Start exploring internships across clinical, research, and community health settingsâ€”each
            opportunity is designed to help you understand its fit, timing, and how to prepare.
          </p>
        </div>

        <aside className="signal-card">
          <p className="section-label">How to Find and Apply for Internships</p>
          <ol>
            <li><strong>Look</strong> for opportunities that match your career plans. (For competitive programs, consider applying to approximately 20 internships.)</li>
            <li><strong>List</strong> all potential internships by application deadline in a spreadsheet.</li>
            <li><strong>Ask</strong> 2-3 professors or advisors to write a <i>strong</i> letter of recommendation.</li>
            <li><strong>Share</strong> a list of potential internships with your letters writers at least 2 weeks before 
              the first deadline. Include notes about specific traits they should highlight for particular 
              internships.</li>
            <li><strong>Optimize</strong> your personal statement and CV.</li>
            <li><strong>Submit</strong> and <strong>Pray</strong>.</li>
          </ol>
        </aside>
      </section>

      <section className="internship-overview">
        <article className="content-card">
          <p className="section-label">Why Internships</p>
          <h3>Explore your future career through real-world internship experience.</h3>
          <p>
             Internships bridge the gap between classroom learning and your future career, helping 
             you test and refine your goals before fully committing to a path. By conducting real-world 
             work and engaging with professionals, you grow intellectually, socially, and gain clarity about your future.
          </p>
        </article>

        <article className="content-card">
          <p className="section-label">What to look for</p>
          <h3>Choose opportunities with clear learning value.</h3>
          <p>
            Strong internship options relate to and align with personal career considerations. They 
            offer strong mentorship, networking opportunities, soft-skills training.
          </p>
        </article>
      </section>

      <section className="internships-list">
        {props.loading ? (
          <article className="content-card status-card">
            <p>Loading internships...</p>
          </article>
        ) : props.error ? (
          <article className="content-card status-card">
            <p>{props.error}</p>
          </article>
        ) : props.internships.length === 0 ? (
          <article className="content-card status-card">
            <p>No internships available yet.</p>
          </article>
        ) : (
          props.internships.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} {...props} />
          ))
        )}
      </section>
    </main>
  )
}

type InternshipCardProps = InternshipsPageProps & {
  internship: Internship
}

function InternshipCard({ internship, ...props }: InternshipCardProps) {
  return (
    <article className="internship-card">
      {props.editingInternshipId === internship.id && props.internshipEditDraft ? (
        <InternshipEditForm internshipId={internship.id} draft={props.internshipEditDraft} {...props} />
      ) : (
        <>
          <div className="internship-header">
            <div>
              <p className="contact-field">{internship.opportunityType || 'Internship'}</p>
              <h3>{internship.name}</h3>
            </div>
            <p className="internship-organization">{internship.institution}</p>
          </div>

          <p className="internship-description">{internship.summary}</p>
          <InternshipTable internship={internship} />

          {props.isAdmin ? (
            <div className="internship-admin-actions">
              <button
                type="button"
                className="experience-delete-button"
                onClick={() => props.onInternshipEditStart(internship)}
              >
                Edit
              </button>
              <button
                type="button"
                className="experience-delete-button"
                disabled={props.internshipDeletingById[internship.id]}
                onClick={() => props.onInternshipDelete(internship.id)}
              >
                {props.internshipDeletingById[internship.id] ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ) : null}

          <div className="internship-actions">
            <button
              type="button"
              className="internship-action-button"
              aria-expanded={props.experiencePanelModeByInternshipId[internship.id] === 'read' ? 'true' : 'false'}
              aria-controls={`internship-experiences-read-${internship.id}`}
              onClick={() => props.onToggleReadExperienceSection(internship.id)}
            >
              Read experiences
            </button>
            <button
              type="button"
              className="internship-action-button internship-action-button-secondary"
              aria-expanded={props.experiencePanelModeByInternshipId[internship.id] === 'share' ? 'true' : 'false'}
              aria-controls={`internship-experiences-share-${internship.id}`}
              onClick={() => props.onShareExperience(internship.id)}
            >
              Share your experience
            </button>
          </div>

          {props.experiencePanelModeByInternshipId[internship.id] === 'read' ? (
            <ReadExperiences internshipId={internship.id} {...props} />
          ) : null}

          {props.experiencePanelModeByInternshipId[internship.id] === 'share' ? (
            <ShareExperienceForm internshipId={internship.id} {...props} />
          ) : null}
        </>
      )}
    </article>
  )
}

type InternshipEditFormProps = InternshipsPageProps & {
  internshipId: string
  draft: Omit<Internship, 'id'>
}

function InternshipEditForm({ internshipId, draft, ...props }: InternshipEditFormProps) {
  return (
    <>
      <div className="internship-header">
        <p className="section-label">Edit internship</p>
      </div>
      <label className="experience-form-field">
        <span>Name of Internship</span>
        <input type="text" value={draft.name} onChange={(e) => props.onInternshipEditDraftChange('name', e.target.value)} />
      </label>
      <label className="experience-form-field">
        <span>Institution</span>
        <input type="text" value={draft.institution} onChange={(e) => props.onInternshipEditDraftChange('institution', e.target.value)} />
      </label>
      <label className="experience-form-field">
        <span>Location</span>
        <input type="text" value={draft.location} onChange={(e) => props.onInternshipEditDraftChange('location', e.target.value)} />
      </label>
      <label className="experience-form-field">
        <span>Summary</span>
        <textarea rows={3} value={draft.summary} onChange={(e) => props.onInternshipEditDraftChange('summary', e.target.value)} />
      </label>
      <label className="experience-form-field">
        <span>Ideal Candidate</span>
        <select value={draft.idealCandidate} onChange={(e) => props.onInternshipEditDraftChange('idealCandidate', e.target.value)}>
          <option value="">Select an option</option>
          <FormOptions options={idealCandidateOptions} />
        </select>
      </label>
      <label className="experience-form-field">
        <span>Clinical or Basic Science or Other</span>
        <select value={draft.opportunityType} onChange={(e) => props.onInternshipEditDraftChange('opportunityType', e.target.value)}>
          <option value="">Select an option</option>
          <FormOptions options={opportunityTypeOptions} />
        </select>
      </label>
      <label className="experience-form-field">
        <span>Deadline</span>
        <input type="text" value={draft.deadline} onChange={(e) => props.onInternshipEditDraftChange('deadline', e.target.value)} />
      </label>
      <label className="experience-form-field">
        <span>Website</span>
        <input type="text" value={draft.website} onChange={(e) => props.onInternshipEditDraftChange('website', e.target.value)} />
      </label>
      <div className="internship-admin-actions">
        <button
          type="button"
          className="primary-button"
          disabled={props.internshipSavingById[internshipId]}
          onClick={() => props.onInternshipEditSave(internshipId)}
        >
          {props.internshipSavingById[internshipId] ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="nav-link" onClick={props.onInternshipEditCancel}>
          Cancel
        </button>
      </div>
    </>
  )
}

type InternshipScopedProps = InternshipsPageProps & {
  internshipId: string
}

function ReadExperiences({ internshipId, ...props }: InternshipScopedProps) {
  const experiences = props.experiencesByInternshipId[internshipId] ?? []

  return (
    <section id={`internship-experiences-read-${internshipId}`} className="internship-experiences">
      <div className="internship-experiences-header">
        <div>
          <p className="section-label">Student reflections</p>
          <h4>Experiences from students who have explored this opportunity</h4>
        </div>
        <p className="internship-experiences-count">{experiences.length} shared</p>
      </div>

      {props.experienceErrorByInternshipId[internshipId] ? (
        <p className="experience-feedback experience-feedback-error">
          {props.experienceErrorByInternshipId[internshipId]}
        </p>
      ) : null}

      {props.experienceLoadingByInternshipId[internshipId] ? (
        <p className="experience-state">Loading experiences...</p>
      ) : experiences.length === 0 ? (
        <p className="experience-state">No experiences shared yet.</p>
      ) : (
        <div className="experience-list">
          {experiences.map((experience) => (
            <ExperienceEntry key={experience.id} internshipId={internshipId} experience={experience} {...props} />
          ))}
        </div>
      )}
    </section>
  )
}

type ExperienceEntryProps = InternshipsPageProps & {
  internshipId: string
  experience: InternshipExperience
}

function ExperienceEntry({ internshipId, experience, ...props }: ExperienceEntryProps) {
  const canEditExperience = experience.userId === props.currentUserId || props.isAdmin

  return (
    <article className="experience-entry">
      <div className="experience-entry-header">
        <div>
          <h5>{experience.authorName}</h5>
          <p>{formatExperienceDate(experience.createdAt)}</p>
        </div>
        {canEditExperience ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            {props.editingExperienceId !== experience.id ? (
              <button
                type="button"
                className="experience-delete-button"
                onClick={() => props.onExperienceEditStart(experience)}
              >
                Edit
              </button>
            ) : null}
            <button
              type="button"
              className="experience-delete-button"
              disabled={props.experienceDeletingById[experience.id]}
              onClick={() => props.onExperienceDelete(internshipId, experience.id)}
            >
              {props.experienceDeletingById[experience.id] ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ) : null}
      </div>
      {props.editingExperienceId === experience.id ? (
        <>
          <textarea
            className="experience-form-field"
            rows={4}
            value={props.experienceEditDraft}
            onChange={(e) => props.onExperienceEditDraftChange(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="primary-button"
              disabled={props.experienceSavingById[experience.id]}
              onClick={() => props.onExperienceEditSave(internshipId, experience.id)}
            >
              {props.experienceSavingById[experience.id] ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="nav-link" onClick={props.onExperienceEditCancel}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <p className="experience-note">{experience.note}</p>
      )}
    </article>
  )
}

function ShareExperienceForm({ internshipId, ...props }: InternshipScopedProps) {
  const draft = props.experienceDraftsByInternshipId[internshipId] ?? createExperienceDraft()

  return (
    <section id={`internship-experiences-share-${internshipId}`} className="internship-experiences">
      <form className="experience-form" onSubmit={(event) => props.onExperienceSubmit(event, internshipId)}>
        <div className="experience-form-header">
          <h5>Share your experience</h5>
          <p>Leave a short note for the next student looking at this internship.</p>
        </div>

        <label className="experience-form-field">
          <span>Your name</span>
          <input
            ref={(element) => props.onExperienceAuthorInputRef(internshipId, element)}
            type="text"
            value={draft.authorName}
            onChange={(event) => props.onExperienceDraftChange(internshipId, 'authorName', event.target.value)}
            placeholder="Ex. Rachel K."
          />
        </label>

        <label className="experience-form-field">
          <span>Your note</span>
          <textarea
            rows={4}
            value={draft.note}
            onChange={(event) => props.onExperienceDraftChange(internshipId, 'note', event.target.value)}
            placeholder="What was helpful, surprising, or worth knowing ahead of time?"
          />
        </label>

        {props.experienceFormErrorByInternshipId[internshipId] ? (
          <p className="experience-feedback experience-feedback-error">
            {props.experienceFormErrorByInternshipId[internshipId]}
          </p>
        ) : null}

        <button
          type="submit"
          className="experience-submit-button"
          disabled={props.experienceSubmittingByInternshipId[internshipId]}
        >
          {props.experienceSubmittingByInternshipId[internshipId] ? 'Submitting...' : 'Submit experience'}
        </button>
      </form>
    </section>
  )
}
