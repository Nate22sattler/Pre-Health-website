import type { AlumniSubmission } from '../types'
import { ContactMeta } from '../components/ContactMeta'
import { formatExperienceDate } from '../lib/formatters'

type ReviewPageProps = {
  isAdmin: boolean
  alumniSubmissions: AlumniSubmission[]
  submissionReviewLoading: boolean
  submissionReviewError: string | null
  submissionReviewSavingById: Record<string, boolean>
  onRefresh: () => void
  onReviewSubmission: (submission: AlumniSubmission, nextStatus: 'approved' | 'rejected') => void
}

export function ReviewPage({
  isAdmin,
  alumniSubmissions,
  submissionReviewLoading,
  submissionReviewError,
  submissionReviewSavingById,
  onRefresh,
  onReviewSubmission,
}: ReviewPageProps) {
  return (
    <main className="page">
      <section className="directory-header">
        <div>
          <p className="section-label">Admin review</p>
          <h2>Review alumni submissions before they enter the directory.</h2>
          <p className="lead">
            Approving a submission creates a new alumni contact. Rejecting it keeps it out of the
            contacts page.
          </p>
        </div>

        <button type="button" className="primary-button" disabled={submissionReviewLoading} onClick={onRefresh}>
          {submissionReviewLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      <section className="review-list">
        {!isAdmin ? (
          <article className="content-card status-card">
            <p>You need admin access to review alumni submissions.</p>
          </article>
        ) : submissionReviewError ? (
          <article className="content-card status-card">
            <p>{submissionReviewError}</p>
          </article>
        ) : submissionReviewLoading ? (
          <article className="content-card status-card">
            <p>Loading pending submissions...</p>
          </article>
        ) : alumniSubmissions.length === 0 ? (
          <article className="content-card status-card">
            <p>No pending alumni submissions.</p>
          </article>
        ) : (
          alumniSubmissions.map((submission) => (
            <article key={submission.id} className="review-card">
              <div className="contact-header">
                <div>
                  <p className="contact-field">{submission.fieldOfWork || 'Field not provided'}</p>
                  <h3>{submission.fullName}</h3>
                </div>
                <p className="review-date">Submitted {formatExperienceDate(submission.createdAt)}</p>
              </div>

              <ContactMeta profile={submission} />
              <p className="contact-notes">
                {submission.previousWork || 'No previous work listed.'}
              </p>

              <div className="contact-admin-actions">
                <button
                  type="button"
                  className="primary-button"
                  disabled={submissionReviewSavingById[submission.id]}
                  onClick={() => onReviewSubmission(submission, 'approved')}
                >
                  {submissionReviewSavingById[submission.id] ? 'Saving...' : 'Approve'}
                </button>
                <button
                  type="button"
                  className="experience-delete-button"
                  disabled={submissionReviewSavingById[submission.id]}
                  onClick={() => onReviewSubmission(submission, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}
