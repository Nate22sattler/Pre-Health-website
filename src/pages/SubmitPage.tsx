import type { ChangeEvent } from 'react'
import { contactFieldOptions, highestDegreeOptions } from '../constants'
import type { SubmissionFormData, SubmitHandler } from '../types'
import { FormOptions } from '../components/FormOptions'

type SubmitPageProps = {
  isPublicPage?: boolean
  formData: SubmissionFormData
  formErrors: Partial<Record<keyof SubmissionFormData, string>>
  isSubmitted: boolean
  isSubmittingAlumniForm: boolean
  submissionError: string | null
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onSubmit: SubmitHandler
}

export function SubmitPage({
  isPublicPage = false,
  formData,
  formErrors,
  isSubmitted,
  isSubmittingAlumniForm,
  submissionError,
  onInputChange,
  onSubmit,
}: SubmitPageProps) {
  return (
    <main className="page">
      <section className="submit-layout">
        <div className="hero-copy">
          <p className="section-label">Join the network</p>
          <h2>Share your story so students know who they can learn from.</h2>
          <p className="lead">
            Alumni and health professionals can use this form to submit their information for the
            Sattler Pre-Health Association directory. Submissions are reviewed before they appear
            on the alumni contacts page.
          </p>
        </div>

        <aside className="signal-card">
          <p className="section-label">{isPublicPage ? 'Private review' : 'Shareable link'}</p>
          <ul>
            <li>Share your field, degree, current title, and employer.</li>
            <li>Mention previous work that gives context to your path.</li>
            <li>Choose whether and how students or club leaders may contact you.</li>
          </ul>
          {!isPublicPage ? (
            <p className="share-link">
              <a href="/alumni-submit" target="_blank" rel="noreferrer">
                Open the shareable alumni form
              </a>
            </p>
          ) : null}
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
              Thank you for submitting your information. A club leader will review it before it
              appears in the alumni directory.
            </p>
          ) : null}
          {submissionError ? (
            <p className="auth-feedback auth-feedback-error">{submissionError}</p>
          ) : null}
        </div>

        <form className="submit-form" onSubmit={onSubmit} noValidate>
          <label className="form-field">
            <span>Full Name</span>
            <input name="fullName" type="text" value={formData.fullName} onChange={onInputChange} />
            {formErrors.fullName ? <small>{formErrors.fullName}</small> : null}
          </label>

          <label className="form-field">
            <span>Gender</span>
            <input name="gender" type="text" value={formData.gender} onChange={onInputChange} />
          </label>

          <label className="form-field">
            <span>Field of Work</span>
            <select name="fieldOfWork" value={formData.fieldOfWork} onChange={onInputChange}>
              <option value="">Select an option</option>
              <FormOptions options={contactFieldOptions} />
            </select>
            {formErrors.fieldOfWork ? <small>{formErrors.fieldOfWork}</small> : null}
          </label>

          <label className="form-field">
            <span>Highest Degree Obtained</span>
            <select name="highestDegree" value={formData.highestDegree} onChange={onInputChange}>
              <option value="">Select an option</option>
              <FormOptions options={highestDegreeOptions} />
            </select>
            {formErrors.highestDegree ? <small>{formErrors.highestDegree}</small> : null}
          </label>

          <label className="form-field">
            <span>Graduation Date</span>
            <input
              name="degreeObtainedDate"
              type="date"
              value={formData.degreeObtainedDate}
              onChange={onInputChange}
            />
            {formErrors.degreeObtainedDate ? <small>{formErrors.degreeObtainedDate}</small> : null}
          </label>

          <label className="form-field">
            <span>Current Title</span>
            <input
              name="currentTitle"
              type="text"
              value={formData.currentTitle}
              onChange={onInputChange}
            />
            {formErrors.currentTitle ? <small>{formErrors.currentTitle}</small> : null}
          </label>

          <label className="form-field">
            <span>Current Employer</span>
            <input
              name="currentEmployer"
              type="text"
              value={formData.currentEmployer}
              onChange={onInputChange}
            />
            {formErrors.currentEmployer ? <small>{formErrors.currentEmployer}</small> : null}
          </label>

          <label className="form-field">
            <span>Any different previous work</span>
            <textarea
              name="previousWork"
              rows={4}
              value={formData.previousWork}
              onChange={onInputChange}
            />
          </label>

          <label className="form-field">
            <span>Willing to Be Contacted?</span>
            <select
              name="willingToBeContacted"
              value={formData.willingToBeContacted}
              onChange={onInputChange}
            >
              <option value="">Select one</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            {formErrors.willingToBeContacted ? (
              <small>{formErrors.willingToBeContacted}</small>
            ) : null}
          </label>

          <label className="form-field">
            <span>Best form of contact?</span>
            <select
              name="bestFormOfContact"
              value={formData.bestFormOfContact}
              onChange={onInputChange}
            >
              <option value="">Select one</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
            </select>
            {formErrors.bestFormOfContact ? <small>{formErrors.bestFormOfContact}</small> : null}
          </label>

          <label className="form-field">
            <span>Location</span>
            <input name="location" type="text" value={formData.location} onChange={onInputChange} />
            {formErrors.location ? <small>{formErrors.location}</small> : null}
          </label>

          <label className="form-field form-field-wide consent-field">
            <input
              name="consentToShare"
              type="checkbox"
              checked={formData.consentToShare}
              onChange={onInputChange}
            />
            <span>
              I agree that this information may be shared with Sattler pre-health students after
              review by a club leader.
            </span>
            {formErrors.consentToShare ? <small>{formErrors.consentToShare}</small> : null}
          </label>

          <div className="form-actions form-field-wide">
            <button className="primary-button" type="submit" disabled={isSubmittingAlumniForm}>
              {isSubmittingAlumniForm ? 'Submitting...' : 'Submit information'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
