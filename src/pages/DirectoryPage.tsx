import type { Contact, ContactEditDraft, View } from '../types'
import {
  advisingAreaOptions,
  contactFieldOptions,
  employmentStatusOptions,
  graduationYearOptions,
  highestDegreeOptions,
} from '../constants'
import { ContactMeta } from '../components/ContactMeta'
import { FormOptions } from '../components/FormOptions'
import alumniDirectoryPhoto from '../assets/alumni-directory-group.jpeg'

type DirectoryPageProps = {
  selectedField: string
  fields: string[]
  visibleContacts: Contact[]
  loading: boolean
  error: string | null
  isAdmin: boolean
  editingContactId: string | null
  contactEditDraft: ContactEditDraft | null
  contactSavingById: Record<string, boolean>
  contactDeletingById: Record<string, boolean>
  onSelectedFieldChange: (field: string) => void
  onNavigate: (view: View) => void
  onContactEditStart: (contact: Contact) => void
  onContactEditCancel: () => void
  onContactEditDraftChange: (
    field: keyof ContactEditDraft,
    value: string | string[] | boolean | null,
  ) => void
  onContactEditSave: (contactId: string) => void
  onContactDelete: (contactId: string) => void
}

export function DirectoryPage({
  selectedField,
  fields,
  visibleContacts,
  loading,
  error,
  isAdmin,
  editingContactId,
  contactEditDraft,
  contactSavingById,
  contactDeletingById,
  onSelectedFieldChange,
  onNavigate,
  onContactEditStart,
  onContactEditCancel,
  onContactEditDraftChange,
  onContactEditSave,
  onContactDelete,
}: DirectoryPageProps) {
  return (
    <main className="page">
      <section className="directory-header">
        <div className="directory-copy">
          <p className="section-label">Alumni directory</p>
          <h2>Reach out with confidence to our curated list of trusted contacts.</h2>
          <p className="lead">
            Browse the directory to find alumni mentors or professionals in your field of interest. Feel free to reach out for advice,
            informational interviews, or shadowing opportunities.
          </p>

          <div className="directory-actions">
            <label className="filter">
              <span>Filter by field</span>
              <select value={selectedField} onChange={(event) => onSelectedFieldChange(event.target.value)}>
                {fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button" onClick={() => onNavigate('submit')}>
              Submit Your Information
            </button>
          </div>
        </div>

        <img
          className="directory-photo"
          src={alumniDirectoryPhoto}
          alt="Sattler pre-health alumni and students gathered together"
        />
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
              {editingContactId === contact.id && contactEditDraft ? (
                <ContactEditForm
                  contactId={contact.id}
                  draft={contactEditDraft}
                  isSaving={contactSavingById[contact.id]}
                  onCancel={onContactEditCancel}
                  onChange={onContactEditDraftChange}
                  onSave={onContactEditSave}
                />
              ) : (
                <>
                  <div className="contact-header">
                    <p className="contact-field">{contact.fieldOfWork || 'Field not provided'}</p>
                    <h3>{contact.fullName}</h3>
                  </div>
                  <ContactMeta profile={contact} />
                  <p className="contact-notes">{contact.bio || 'No bio provided.'}</p>
                  {isAdmin ? (
                    <div className="contact-admin-actions">
                      <button
                        type="button"
                        className="experience-delete-button"
                        onClick={() => onContactEditStart(contact)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="experience-delete-button"
                        disabled={contactDeletingById[contact.id]}
                        onClick={() => onContactDelete(contact.id)}
                      >
                        {contactDeletingById[contact.id] ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  )
}

type ContactEditFormProps = {
  contactId: string
  draft: ContactEditDraft
  isSaving: boolean
  onCancel: () => void
  onChange: (field: keyof ContactEditDraft, value: string | string[] | boolean | null) => void
  onSave: (contactId: string) => void
}

function ContactEditForm({
  contactId,
  draft,
  isSaving,
  onCancel,
  onChange,
  onSave,
}: ContactEditFormProps) {
  return (
    <>
      <div className="contact-header">
        <p className="section-label">Edit contact</p>
      </div>
      <label className="experience-form-field">
        <span>Full Name</span>
        <input type="text" value={draft.fullName} onChange={(e) => onChange('fullName', e.target.value)} />
      </label>
      <label className="experience-form-field">
        <span>Gender</span>
        <input type="text" value={draft.gender} onChange={(e) => onChange('gender', e.target.value)} />
      </label>
      <label className="experience-form-field">
        <span>Current Status</span>
        <select
          value={draft.employmentStatus}
          onChange={(e) => {
            onChange('employmentStatus', e.target.value)

            if (e.target.value !== 'Student') {
              onChange('currentProgramGraduationDate', '')
            }
          }}
        >
          <option value="">Select one</option>
          <FormOptions options={employmentStatusOptions} />
        </select>
      </label>
      {draft.employmentStatus === 'Student' ? (
        <label className="experience-form-field">
          <span>Graduation Date from Current Program</span>
          <input
            type="date"
            value={draft.currentProgramGraduationDate}
            onChange={(e) => onChange('currentProgramGraduationDate', e.target.value)}
          />
        </label>
      ) : null}
      <label className="experience-form-field">
        <span>Field of Work</span>
        <select value={draft.fieldOfWork} onChange={(e) => onChange('fieldOfWork', e.target.value)}>
          <option value="">Select an option</option>
          <FormOptions options={contactFieldOptions} />
        </select>
      </label>
      <label className="experience-form-field">
        <span>Highest Degree Obtained</span>
        <select value={draft.highestDegree} onChange={(e) => onChange('highestDegree', e.target.value)}>
          <option value="">Select an option</option>
          <FormOptions options={highestDegreeOptions} />
        </select>
      </label>
      <label className="experience-form-field">
        <span>Graduation Year</span>
        <select
          value={draft.degreeObtainedDate}
          onChange={(e) => onChange('degreeObtainedDate', e.target.value)}
        >
          <option value="">Select a year</option>
          <FormOptions options={graduationYearOptions} />
        </select>
      </label>
      <label className="experience-form-field">
        <span>Current Title</span>
        <input type="text" value={draft.currentTitle} onChange={(e) => onChange('currentTitle', e.target.value)} />
      </label>
      <label className="experience-form-field">
        <span>Current Employer</span>
        <input
          type="text"
          value={draft.currentEmployer}
          onChange={(e) => onChange('currentEmployer', e.target.value)}
        />
      </label>
      <label className="experience-form-field">
        <span>Bio</span>
        <textarea rows={3} value={draft.bio} onChange={(e) => onChange('bio', e.target.value)} />
      </label>
      <fieldset className="experience-form-field checkbox-group">
        <legend>Willing to Advise In</legend>
        {advisingAreaOptions.map((area) => (
          <label key={area} className="checkbox-option">
            <input
              type="checkbox"
              value={area}
              checked={draft.willingToAdviseIn.includes(area)}
              onChange={(e) => {
                const nextAreas = e.target.checked
                  ? [...draft.willingToAdviseIn, area]
                  : draft.willingToAdviseIn.filter((currentArea) => currentArea !== area)
                onChange('willingToAdviseIn', nextAreas)

                if (area === 'Other' && !e.target.checked) {
                  onChange('otherAdvisingArea', '')
                }
              }}
            />
            <span>{area}</span>
          </label>
        ))}
      </fieldset>
      {draft.willingToAdviseIn.includes('Other') ? (
        <label className="experience-form-field">
          <span>Other Advising Area</span>
          <input
            type="text"
            value={draft.otherAdvisingArea}
            onChange={(e) => onChange('otherAdvisingArea', e.target.value)}
          />
        </label>
      ) : null}
      <label className="experience-form-field">
        <span>Willing to Be Contacted?</span>
        <select
          value={draft.willingToBeContacted === null ? '' : String(draft.willingToBeContacted)}
          onChange={(e) =>
            onChange('willingToBeContacted', e.target.value === '' ? null : e.target.value === 'true')
          }
        >
          <option value="">Select one</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <label className="experience-form-field">
        <span>Email</span>
        <input
          type="email"
          value={draft.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </label>
      <label className="experience-form-field">
        <span>Location</span>
        <input type="text" value={draft.location} onChange={(e) => onChange('location', e.target.value)} />
      </label>
      <div className="contact-admin-actions">
        <button type="button" className="primary-button" disabled={isSaving} onClick={() => onSave(contactId)}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="nav-link" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </>
  )
}
