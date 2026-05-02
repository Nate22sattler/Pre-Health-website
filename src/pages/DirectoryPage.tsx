import type { Contact, ContactEditDraft, View } from '../types'
import { contactFieldOptions, highestDegreeOptions } from '../constants'
import { ContactMeta } from '../components/ContactMeta'
import { FormOptions } from '../components/FormOptions'

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
  onContactEditDraftChange: (field: keyof ContactEditDraft, value: string | boolean | null) => void
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
        <div>
          <p className="section-label">Alumni directory</p>
          <h2>Start with a small, high-trust list of mentors.</h2>
          <p className="lead">
            Even ten strong contacts can make a huge difference in your confidence and clarity.
            Browse the directory to find alumni mentors you can reach out to for advice,
            informational interviews, or shadowing opportunities.
          </p>
        </div>

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
                  <p className="contact-notes">{contact.previousWork || 'No previous work listed.'}</p>
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
  onChange: (field: keyof ContactEditDraft, value: string | boolean | null) => void
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
        <span>Graduation Date</span>
        <input
          type="date"
          value={draft.degreeObtainedDate}
          onChange={(e) => onChange('degreeObtainedDate', e.target.value)}
        />
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
        <span>Any different previous work</span>
        <textarea rows={3} value={draft.previousWork} onChange={(e) => onChange('previousWork', e.target.value)} />
      </label>
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
        <span>Best form of contact?</span>
        <input
          type="text"
          value={draft.bestFormOfContact}
          onChange={(e) => onChange('bestFormOfContact', e.target.value)}
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
