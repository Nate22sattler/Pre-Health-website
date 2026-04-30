// Is the thing that displays the different elements of the web app; is rendered by main.tsx.

import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import preHealthLogo from './assets/pre-health-logo.png'
import homeHeroImage from './assets/v3.jpeg'
import mentorCardImage from './assets/mentor.jpg'
import internshipCardImage from './assets/intern.jpg'
import careerCardImage from './assets/career.jpg'
import './App.css'
import {
  ALLOWED_EMAIL_DOMAIN_LABEL,
  getInstitutionalAccessMessage,
  isAllowedInstitutionEmail,
  readAuthCallbackError,
} from './auth'
import { supabase } from './supabaseClient'

type View = 'home' | 'directory' | 'internships' | 'submit' | 'review'

type Contact = {
  id: string
  fullName: string
  gender: string
  fieldOfWork: string
  highestDegreeAndDate: string
  currentTitle: string
  currentEmployer: string
  previousWork: string
  willingToBeContacted: boolean | null
  bestFormOfContact: string
  location: string
}

type Internship = {
  id: string
  name: string
  institution: string
  location: string
  summary: string
  idealCandidate: string
  opportunityType: string
  deadline: string
  website: string
}

type InternshipExperience = {
  id: string
  internshipId: string
  authorName: string
  note: string
  createdAt: string
  userId: string | null
}

type AlumniSubmission = {
  id: string
  fullName: string
  gender: string
  fieldOfWork: string
  highestDegreeAndDate: string
  currentTitle: string
  currentEmployer: string
  previousWork: string
  willingToBeContacted: boolean
  bestFormOfContact: string
  location: string
  consentToShare: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
}

type ContactEditDraft = Omit<Contact, 'id'>

type ContactRow = {
  id: string
  full_name: string
  gender: string | null
  field_of_work: string | null
  highest_degree_and_date: string | null
  current_title: string
  current_employer: string
  previous_work: string | null
  willing_to_be_contacted: boolean | null
  best_form_of_contact: string
  location: string
}

type InternshipRow = {
  id: string
  name: string
  institution: string
  location: string
  summary: string
  ideal_candidate: string | null
  opportunity_type: string | null
  deadline: string | null
  website: string | null
}

type InternshipExperienceRow = {
  id: string
  internship_id: string
  author_name: string
  note: string
  created_at: string
  user_id: string | null
}

type AlumniSubmissionRow = {
  id: string
  full_name: string
  gender: string | null
  field_of_work: string | null
  highest_degree_and_date: string | null
  current_title: string
  current_employer: string
  previous_work: string | null
  willing_to_be_contacted: boolean
  best_form_of_contact: string
  location: string
  consent_to_share: boolean
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

type ExperienceDraft = {
  authorName: string
  note: string
}

type ExperiencePanelMode = 'read' | 'share'

const experienceDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const idealCandidateOptions = ['pre-MD', 'pre-PhD', 'other']
const opportunityTypeOptions = ['Clinical', 'Basic Science', 'Other']
const contactFieldOptions = ['PT', 'MD', 'DDS', 'OT', 'PH', 'BSN', 'PA', 'Research']

function createExperienceDraft(): ExperienceDraft {
  return {
    authorName: '',
    note: '',
  }
}

function mapContactRow(row: ContactRow): Contact {
  return {
    id: row.id,
    fullName: row.full_name,
    gender: row.gender ?? '',
    fieldOfWork: row.field_of_work ?? '',
    highestDegreeAndDate: row.highest_degree_and_date ?? '',
    currentTitle: row.current_title,
    currentEmployer: row.current_employer,
    previousWork: row.previous_work ?? '',
    willingToBeContacted: row.willing_to_be_contacted,
    bestFormOfContact: row.best_form_of_contact,
    location: row.location,
  }
}

function mapInternshipRow(row: InternshipRow): Internship {
  return {
    id: row.id,
    name: row.name,
    institution: row.institution,
    location: row.location,
    summary: row.summary,
    idealCandidate: row.ideal_candidate ?? '',
    opportunityType: row.opportunity_type ?? '',
    deadline: row.deadline ?? '',
    website: row.website ?? '',
  }
}

function mapInternshipExperienceRow(row: InternshipExperienceRow): InternshipExperience {
  return {
    id: row.id,
    internshipId: row.internship_id,
    authorName: row.author_name,
    note: row.note,
    createdAt: row.created_at,
    userId: row.user_id,
  }
}

function mapAlumniSubmissionRow(row: AlumniSubmissionRow): AlumniSubmission {
  return {
    id: row.id,
    fullName: row.full_name,
    gender: row.gender ?? '',
    fieldOfWork: row.field_of_work ?? '',
    highestDegreeAndDate: row.highest_degree_and_date ?? '',
    currentTitle: row.current_title,
    currentEmployer: row.current_employer,
    previousWork: row.previous_work ?? '',
    willingToBeContacted: row.willing_to_be_contacted,
    bestFormOfContact: row.best_form_of_contact,
    location: row.location,
    consentToShare: row.consent_to_share,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  }
}

function formatExperienceDate(date: string): string {
  return experienceDateFormatter.format(new Date(date))
}

function getWebsiteHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`
}

function formatYesNo(value: boolean | null): string {
  if (value === null) {
    return 'Not provided'
  }

  return value ? 'Yes' : 'No'
}

type SubmissionFormData = {
  fullName: string
  gender: string
  fieldOfWork: string
  highestDegreeAndDate: string
  currentTitle: string
  currentEmployer: string
  previousWork: string
  willingToBeContacted: string
  bestFormOfContact: string
  location: string
  consentToShare: boolean
}

const initialFormData: SubmissionFormData = {
  fullName: '',
  gender: '',
  fieldOfWork: '',
  highestDegreeAndDate: '',
  currentTitle: '',
  currentEmployer: '',
  previousWork: '',
  willingToBeContacted: '',
  bestFormOfContact: '',
  location: '',
  consentToShare: false,
}

type AuthGateScreenProps = {
  error: string | null
  isSigningIn: boolean
  onSignIn: () => void
}

function AuthLoadingScreen() {
  return (
    <div className="site-shell">
      <main className="page auth-screen">
        <section className="auth-panel">
          <div className="hero-copy auth-copy">
            <p className="section-label">Private community access</p>
            <h2>Checking your Sattler access.</h2>
            <p className="lead">
              We&apos;re verifying your session so the site can stay private to institutional
              members.
            </p>
            <p className="auth-loading-state">Loading secure access...</p>
          </div>

          <aside className="brand-panel auth-aside">
            <div className="brand-panel-frame">
              <img
                className="brand-logo"
                src={preHealthLogo}
                alt="Sattler Pre-Health Association logo with the motto Connect, Equip, Serve."
              />
            </div>
            <div className="brand-panel-copy">
              <h3>Trusted access only</h3>
              <p>
                This space is reserved for the Sattler pre-health community so students can share
                resources and reflections with confidence.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

function AuthGateScreen({ error, isSigningIn, onSignIn }: AuthGateScreenProps) {
  return (
    <div className="site-shell">
      <main className="page auth-screen">
        <section className="auth-panel">
          <div className="hero-copy auth-copy">
            <p className="section-label">Private community access</p>
            <h2>Sign in with your Sattler Google account.</h2>
            <p className="lead">
              The directory, internship guide, and shared reflections are only available to
              approved institutional users.
            </p>

            <div className="auth-actions">
              <button
                type="button"
                className="primary-button"
                onClick={onSignIn}
                disabled={isSigningIn}
              >
                {isSigningIn ? 'Redirecting to Google...' : 'Continue with Google'}
              </button>
              <p className="auth-note">
                Only Google accounts with an <strong>{ALLOWED_EMAIL_DOMAIN_LABEL}</strong> email
                address can access this site.
              </p>
            </div>

            {error ? <p className="auth-feedback auth-feedback-error">{error}</p> : null}
          </div>

          <aside className="brand-panel auth-aside">
            <div className="brand-panel-frame">
              <img
                className="brand-logo"
                src={preHealthLogo}
                alt="Sattler Pre-Health Association logo with the motto Connect, Equip, Serve."
              />
            </div>
            <div className="brand-panel-copy">
              <h3>Why the gate?</h3>
              <p>
                We&apos;re protecting contact details and student reflections by limiting access to
                trusted institutional accounts.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

function App() {
  const [view, setView] = useState<View>('home')
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [selectedField, setSelectedField] = useState('All fields')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [experiencePanelModeByInternshipId, setExperiencePanelModeByInternshipId] = useState<
    Record<string, ExperiencePanelMode | null>
  >({})
  const [experiencesByInternshipId, setExperiencesByInternshipId] = useState<
    Record<string, InternshipExperience[]>
  >({})
  const [experienceLoadingByInternshipId, setExperienceLoadingByInternshipId] = useState<
    Record<string, boolean>
  >({})
  const [experienceErrorByInternshipId, setExperienceErrorByInternshipId] = useState<
    Record<string, string | null>
  >({})
  const [experienceDraftsByInternshipId, setExperienceDraftsByInternshipId] = useState<
    Record<string, ExperienceDraft>
  >({})
  const [experienceFormErrorByInternshipId, setExperienceFormErrorByInternshipId] = useState<
    Record<string, string | null>
  >({})
  const [experienceSubmittingByInternshipId, setExperienceSubmittingByInternshipId] = useState<
    Record<string, boolean>
  >({})
  const [experienceDeletingById, setExperienceDeletingById] = useState<Record<string, boolean>>({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [contactEditDraft, setContactEditDraft] = useState<ContactEditDraft | null>(null)
  const [contactSavingById, setContactSavingById] = useState<Record<string, boolean>>({})
  const [contactDeletingById, setContactDeletingById] = useState<Record<string, boolean>>({})
  const [editingInternshipId, setEditingInternshipId] = useState<string | null>(null)
  const [internshipEditDraft, setInternshipEditDraft] = useState<Omit<Internship, 'id'> | null>(null)
  const [internshipSavingById, setInternshipSavingById] = useState<Record<string, boolean>>({})
  const [internshipDeletingById, setInternshipDeletingById] = useState<Record<string, boolean>>({})
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null)
  const [experienceEditDraft, setExperienceEditDraft] = useState('')
  const [experienceSavingById, setExperienceSavingById] = useState<Record<string, boolean>>({})
  const experienceAuthorInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [formData, setFormData] = useState<SubmissionFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SubmissionFormData, string>>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmittingAlumniForm, setIsSubmittingAlumniForm] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [alumniSubmissions, setAlumniSubmissions] = useState<AlumniSubmission[]>([])
  const [submissionReviewLoading, setSubmissionReviewLoading] = useState(false)
  const [submissionReviewError, setSubmissionReviewError] = useState<string | null>(null)
  const [submissionReviewSavingById, setSubmissionReviewSavingById] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let isActive = true
    const callbackError = readAuthCallbackError()

    if (callbackError) {
      setAuthError(callbackError)
    }

    async function syncApprovedSession(
      nextSession: Session | null,
      preserveExistingErrorOnEmptySession = false,
    ) {
      if (!nextSession) {
        if (!isActive) {
          return
        }

        setSession(null)
        setAuthLoading(false)
        setIsSigningIn(false)

        if (!preserveExistingErrorOnEmptySession) {
          setAuthError(null)
        }

        return
      }

      if (isAllowedInstitutionEmail(nextSession.user.email)) {
        if (!isActive) {
          return
        }

        setSession(nextSession)
        setAuthError(null)
        setAuthLoading(false)
        setIsSigningIn(false)
        return
      }

      const invalidAccessMessage = getInstitutionalAccessMessage()
      setAuthError(invalidAccessMessage)

      const { error: signOutError } = await supabase.auth.signOut()

      if (!isActive) {
        return
      }

      setSession(null)
      setAuthLoading(false)
      setIsSigningIn(false)

      if (signOutError) {
        setAuthError(
          `${invalidAccessMessage} We also ran into trouble clearing the session. Please refresh and try again.`,
        )
      }
    }

    async function initializeAuth() {
      const {
        data: { session: existingSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (!isActive) {
        return
      }

      if (sessionError) {
        setSession(null)
        setAuthError(sessionError.message)
        setAuthLoading(false)
        setIsSigningIn(false)
        return
      }

      await syncApprovedSession(existingSession, Boolean(callbackError))
    }

    void initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncApprovedSession(nextSession, true)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setIsAdmin(false)
      setAlumniSubmissions([])
      return
    }

    async function checkAdmin() {
      const { data } = await supabase.rpc('is_admin')
      setIsAdmin(data === true)
    }

    void checkAdmin()
  }, [session])

  useEffect(() => {
    if (!session || !isAdmin) {
      setAlumniSubmissions([])
      setSubmissionReviewLoading(false)
      setSubmissionReviewError(null)
      return
    }

    void loadAlumniSubmissions()
  }, [session, isAdmin])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!session) {
      setView('home')
      setSelectedField('All fields')
      setContacts([])
      setInternships([])
      setLoading(false)
      setError(null)
      setExperiencePanelModeByInternshipId({})
      setExperiencesByInternshipId({})
      setExperienceLoadingByInternshipId({})
      setExperienceErrorByInternshipId({})
      setExperienceDraftsByInternshipId({})
      setExperienceFormErrorByInternshipId({})
      setExperienceSubmittingByInternshipId({})
      setExperienceDeletingById({})
      setEditingInternshipId(null)
      setInternshipEditDraft(null)
      setInternshipSavingById({})
      setInternshipDeletingById({})
      setEditingExperienceId(null)
      setExperienceEditDraft('')
      setExperienceSavingById({})
      return
    }

    let isActive = true

    async function loadData() {
      setLoading(true)
      setError(null)

      const [
        { data: contactRows, error: contactsError },
        { data: internshipRows, error: internshipsError },
      ] = await Promise.all([
        supabase.from('contacts').select('*').order('full_name'),
        supabase.from('internships').select('*').order('name'),
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
  }, [authLoading, session])

  const fields = [
    'All fields',
    ...new Set([
      ...contactFieldOptions,
      ...contacts.map((contact) => contact.fieldOfWork).filter(Boolean),
    ]),
  ]
  const normalizedPath = window.location.pathname.replace(/\/$/, '')
  const isPublicAlumniSubmissionRoute =
    normalizedPath === '/alumni-submit' || window.location.hash === '#alumni-submit'

  const visibleContacts =
    selectedField === 'All fields'
      ? contacts
      : contacts.filter((contact) => contact.fieldOfWork === selectedField)

  function navigateToView(nextView: View) {
    setView(nextView)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  async function handleGoogleSignIn() {
    setAuthError(null)
    setIsSigningIn(true)

    const redirectUrl = new URL(window.location.href)
    redirectUrl.search = ''
    redirectUrl.hash = ''

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
      },
    })

    if (signInError) {
      setAuthError(signInError.message)
      setIsSigningIn(false)
    }
  }

  async function handleSignOut() {
    setAuthError(null)
    navigateToView('home')

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      setAuthError(signOutError.message)
    }
  }

  async function loadAlumniSubmissions() {
    setSubmissionReviewLoading(true)
    setSubmissionReviewError(null)

    const { data, error: submissionsError } = await supabase
      .from('alumni_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (submissionsError) {
      setSubmissionReviewError(submissionsError.message)
      setSubmissionReviewLoading(false)
      return
    }

    setAlumniSubmissions(
      ((data as AlumniSubmissionRow[] | null) ?? []).map((row) => mapAlumniSubmissionRow(row)),
    )
    setSubmissionReviewLoading(false)
  }

  async function loadExperiencesForInternship(internshipId: string, forceRefresh = false) {
    if (!forceRefresh && internshipId in experiencesByInternshipId) {
      return
    }

    setExperienceLoadingByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: true,
    }))
    setExperienceErrorByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: null,
    }))

    const { data, error: experienceError } = await supabase
      .from('internship_experiences')
      .select('*')
      .eq('internship_id', internshipId)
      .order('created_at', { ascending: false })

    if (experienceError) {
      setExperienceErrorByInternshipId((currentState) => ({
        ...currentState,
        [internshipId]: experienceError.message,
      }))
      setExperienceLoadingByInternshipId((currentState) => ({
        ...currentState,
        [internshipId]: false,
      }))
      return
    }

    setExperiencesByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: ((data as InternshipExperienceRow[] | null) ?? []).map((row) =>
        mapInternshipExperienceRow(row),
      ),
    }))
    setExperienceLoadingByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: false,
    }))
  }

  function toggleReadExperienceSection(internshipId: string) {
    const nextMode =
      experiencePanelModeByInternshipId[internshipId] === 'read' ? null : 'read'

    setExperiencePanelModeByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: nextMode,
    }))

    if (nextMode === 'read') {
      void loadExperiencesForInternship(internshipId)
    }
  }

  function handleShareExperience(internshipId: string) {
    const nextMode =
      experiencePanelModeByInternshipId[internshipId] === 'share' ? null : 'share'

    setExperiencePanelModeByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: nextMode,
    }))

    if (nextMode === 'share') {
      window.setTimeout(() => {
        experienceAuthorInputRefs.current[internshipId]?.focus()
      }, 0)
    }
  }

  function handleExperienceDraftChange(
    internshipId: string,
    field: keyof ExperienceDraft,
    value: string,
  ) {
    setExperienceDraftsByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: {
        ...(currentState[internshipId] ?? createExperienceDraft()),
        [field]: value,
      },
    }))
  }

  async function handleExperienceSubmit(
    event: FormEvent<HTMLFormElement>,
    internshipId: string,
  ) {
    event.preventDefault()

    const currentDraft = experienceDraftsByInternshipId[internshipId] ?? createExperienceDraft()
    const authorName = currentDraft.authorName.trim()
    const note = currentDraft.note.trim()

    if (!authorName || !note) {
      setExperienceFormErrorByInternshipId((currentState) => ({
        ...currentState,
        [internshipId]: 'Please enter your name and a short note before submitting.',
      }))
      return
    }

    setExperienceSubmittingByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: true,
    }))
    setExperienceFormErrorByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: null,
    }))

    const { error: insertError } = await supabase.from('internship_experiences').insert({
      internship_id: internshipId,
      author_name: authorName,
      note,
      user_id: session!.user.id,
    })

    if (insertError) {
      setExperienceSubmittingByInternshipId((currentState) => ({
        ...currentState,
        [internshipId]: false,
      }))
      setExperienceFormErrorByInternshipId((currentState) => ({
        ...currentState,
        [internshipId]: insertError.message,
      }))
      return
    }

    setExperienceDraftsByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: createExperienceDraft(),
    }))

    await loadExperiencesForInternship(internshipId, true)

    setExperienceSubmittingByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: false,
    }))
  }

  async function handleExperienceDelete(internshipId: string, experienceId: string) {
    setExperienceDeletingById((currentState) => ({
      ...currentState,
      [experienceId]: true,
    }))
    setExperienceErrorByInternshipId((currentState) => ({
      ...currentState,
      [internshipId]: null,
    }))

    const { error: deleteError } = await supabase
      .from('internship_experiences')
      .delete()
      .eq('id', experienceId)

    if (deleteError) {
      setExperienceDeletingById((currentState) => ({
        ...currentState,
        [experienceId]: false,
      }))
      setExperienceErrorByInternshipId((currentState) => ({
        ...currentState,
        [internshipId]: deleteError.message,
      }))
      return
    }

    await loadExperiencesForInternship(internshipId, true)

    setExperienceDeletingById((currentState) => ({
      ...currentState,
      [experienceId]: false,
    }))
  }

  function handleContactEditStart(contact: Contact) {
    setEditingContactId(contact.id)
    setContactEditDraft({
      fullName: contact.fullName,
      gender: contact.gender,
      fieldOfWork: contact.fieldOfWork,
      highestDegreeAndDate: contact.highestDegreeAndDate,
      currentTitle: contact.currentTitle,
      currentEmployer: contact.currentEmployer,
      previousWork: contact.previousWork,
      willingToBeContacted: contact.willingToBeContacted,
      bestFormOfContact: contact.bestFormOfContact,
      location: contact.location,
    })
  }

  function handleContactEditCancel() {
    setEditingContactId(null)
    setContactEditDraft(null)
  }

  function handleContactEditDraftChange(field: keyof ContactEditDraft, value: string | boolean | null) {
    setContactEditDraft((current) => (current ? { ...current, [field]: value } : current))
  }

  async function handleContactEditSave(contactId: string) {
    if (!contactEditDraft) {
      return
    }

    setContactSavingById((current) => ({ ...current, [contactId]: true }))

    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        full_name: contactEditDraft.fullName,
        gender: contactEditDraft.gender || null,
        field_of_work: contactEditDraft.fieldOfWork || null,
        highest_degree_and_date: contactEditDraft.highestDegreeAndDate || null,
        current_title: contactEditDraft.currentTitle,
        current_employer: contactEditDraft.currentEmployer,
        previous_work: contactEditDraft.previousWork || null,
        willing_to_be_contacted: contactEditDraft.willingToBeContacted,
        best_form_of_contact: contactEditDraft.bestFormOfContact,
        location: contactEditDraft.location,
      })
      .eq('id', contactId)

    setContactSavingById((current) => ({ ...current, [contactId]: false }))

    if (updateError) {
      return
    }

    setContacts((current) =>
      current.map((c) => (c.id === contactId ? { id: contactId, ...contactEditDraft } : c)),
    )
    setEditingContactId(null)
    setContactEditDraft(null)
  }

  async function handleContactDelete(contactId: string) {
    if (!window.confirm('Delete this contact? This cannot be undone.')) {
      return
    }

    setContactDeletingById((current) => ({ ...current, [contactId]: true }))

    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId)

    setContactDeletingById((current) => ({ ...current, [contactId]: false }))

    if (deleteError) {
      return
    }

    setContacts((current) => current.filter((c) => c.id !== contactId))
  }

  function handleInternshipEditStart(internship: Internship) {
    setEditingInternshipId(internship.id)
    setInternshipEditDraft({
      name: internship.name,
      institution: internship.institution,
      location: internship.location,
      summary: internship.summary,
      idealCandidate: internship.idealCandidate,
      opportunityType: internship.opportunityType,
      deadline: internship.deadline,
      website: internship.website,
    })
  }

  function handleInternshipEditCancel() {
    setEditingInternshipId(null)
    setInternshipEditDraft(null)
  }

  function handleInternshipEditDraftChange(field: keyof Omit<Internship, 'id'>, value: string) {
    setInternshipEditDraft((current) => (current ? { ...current, [field]: value } : current))
  }

  async function handleInternshipEditSave(internshipId: string) {
    if (!internshipEditDraft) {
      return
    }

    setInternshipSavingById((current) => ({ ...current, [internshipId]: true }))

    const { error: updateError } = await supabase
      .from('internships')
      .update({
        name: internshipEditDraft.name,
        institution: internshipEditDraft.institution,
        location: internshipEditDraft.location,
        summary: internshipEditDraft.summary,
        ideal_candidate: internshipEditDraft.idealCandidate || null,
        opportunity_type: internshipEditDraft.opportunityType || null,
        deadline: internshipEditDraft.deadline || null,
        website: internshipEditDraft.website || null,
      })
      .eq('id', internshipId)

    setInternshipSavingById((current) => ({ ...current, [internshipId]: false }))

    if (updateError) {
      return
    }

    setInternships((current) =>
      current.map((i) =>
        i.id === internshipId ? { id: internshipId, ...internshipEditDraft } : i,
      ),
    )
    setEditingInternshipId(null)
    setInternshipEditDraft(null)
  }

  async function handleInternshipDelete(internshipId: string) {
    if (!window.confirm('Delete this internship? This cannot be undone.')) {
      return
    }

    setInternshipDeletingById((current) => ({ ...current, [internshipId]: true }))

    const { error: deleteError } = await supabase
      .from('internships')
      .delete()
      .eq('id', internshipId)

    setInternshipDeletingById((current) => ({ ...current, [internshipId]: false }))

    if (deleteError) {
      return
    }

    setInternships((current) => current.filter((i) => i.id !== internshipId))
  }

  function handleExperienceEditStart(experience: InternshipExperience) {
    setEditingExperienceId(experience.id)
    setExperienceEditDraft(experience.note)
  }

  function handleExperienceEditCancel() {
    setEditingExperienceId(null)
    setExperienceEditDraft('')
  }

  async function handleExperienceEditSave(internshipId: string, experienceId: string) {
    setExperienceSavingById((current) => ({ ...current, [experienceId]: true }))

    const { error: updateError } = await supabase
      .from('internship_experiences')
      .update({ note: experienceEditDraft })
      .eq('id', experienceId)

    setExperienceSavingById((current) => ({ ...current, [experienceId]: false }))

    if (updateError) {
      return
    }

    setExperiencesByInternshipId((current) => ({
      ...current,
      [internshipId]: (current[internshipId] ?? []).map((e) =>
        e.id === experienceId ? { ...e, note: experienceEditDraft } : e,
      ),
    }))
    setEditingExperienceId(null)
    setExperienceEditDraft('')
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target
    const nextValue =
      event.target instanceof HTMLInputElement && event.target.type === 'checkbox'
        ? event.target.checked
        : value

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }))

    setFormErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  function validateForm() {
    const nextErrors: Partial<Record<keyof SubmissionFormData, string>> = {}

    if (!formData.fullName.trim()) nextErrors.fullName = 'Please enter your name.'
    if (!formData.fieldOfWork.trim()) nextErrors.fieldOfWork = 'Please select your field of work.'
    if (!formData.currentTitle.trim()) nextErrors.currentTitle = 'Please enter your current title.'
    if (!formData.currentEmployer.trim()) {
      nextErrors.currentEmployer = 'Please enter your current employer.'
    }
    if (!formData.location.trim()) nextErrors.location = 'Please enter your location.'
    if (!formData.willingToBeContacted.trim()) {
      nextErrors.willingToBeContacted = 'Please let us know if you are willing to be contacted.'
    }
    if (!formData.bestFormOfContact.trim()) {
      nextErrors.bestFormOfContact = 'Please choose the best form of contact.'
    }
    if (!formData.consentToShare) {
      nextErrors.consentToShare =
        'Please confirm that this information may be shared with Sattler pre-health students.'
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      setIsSubmitted(false)
      setSubmissionError(null)
      return
    }

    setIsSubmittingAlumniForm(true)
    setFormErrors({})
    setSubmissionError(null)

    const { error: submitError } = await supabase.from('alumni_submissions').insert({
      full_name: formData.fullName.trim(),
      gender: formData.gender.trim() || null,
      field_of_work: formData.fieldOfWork || null,
      highest_degree_and_date: formData.highestDegreeAndDate.trim() || null,
      current_title: formData.currentTitle.trim(),
      current_employer: formData.currentEmployer.trim(),
      previous_work: formData.previousWork.trim() || null,
      willing_to_be_contacted: formData.willingToBeContacted === 'true',
      best_form_of_contact: formData.bestFormOfContact.trim(),
      location: formData.location.trim(),
      consent_to_share: formData.consentToShare,
      status: 'pending',
    })

    setIsSubmittingAlumniForm(false)

    if (submitError) {
      setSubmissionError(submitError.message)
      setIsSubmitted(false)
      return
    }

    setIsSubmitted(true)
    setFormData(initialFormData)

    if (isAdmin) {
      void loadAlumniSubmissions()
    }
  }

  async function handleReviewSubmission(
    submission: AlumniSubmission,
    nextStatus: 'approved' | 'rejected',
  ) {
    setSubmissionReviewSavingById((current) => ({ ...current, [submission.id]: true }))
    setSubmissionReviewError(null)

    if (nextStatus === 'approved') {
      const { data: insertedContactRow, error: insertContactError } = await supabase
        .from('contacts')
        .insert({
          full_name: submission.fullName,
          gender: submission.gender || null,
          field_of_work: submission.fieldOfWork || null,
          highest_degree_and_date: submission.highestDegreeAndDate || null,
          current_title: submission.currentTitle,
          current_employer: submission.currentEmployer,
          previous_work: submission.previousWork || null,
          willing_to_be_contacted: submission.willingToBeContacted,
          best_form_of_contact: submission.bestFormOfContact,
          location: submission.location,
        })
        .select('*')
        .single()

      if (insertContactError) {
        setSubmissionReviewSavingById((current) => ({ ...current, [submission.id]: false }))
        setSubmissionReviewError(insertContactError.message)
        return
      }

      if (insertedContactRow) {
        setContacts((current) =>
          [...current, mapContactRow(insertedContactRow as ContactRow)].sort((a, b) =>
            a.fullName.localeCompare(b.fullName),
          ),
        )
      }
    }

    const { error: updateSubmissionError } = await supabase
      .from('alumni_submissions')
      .update({
        status: nextStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: session?.user.id ?? null,
      })
      .eq('id', submission.id)

    setSubmissionReviewSavingById((current) => ({ ...current, [submission.id]: false }))

    if (updateSubmissionError) {
      setSubmissionReviewError(updateSubmissionError.message)
      return
    }

    setAlumniSubmissions((current) => current.filter((item) => item.id !== submission.id))
  }

  function renderAlumniSubmissionContent(isPublicPage = false) {
    return (
      <>
        <section className="submit-layout">
          <div className="hero-copy">
            <p className="section-label">Join the network</p>
            <h2>Share your story so students know who they can learn from.</h2>
            <p className="lead">
              Alumni and health professionals can use this form to submit their information for
              the Sattler Pre-Health Association directory. Submissions are reviewed before they
              appear on the alumni contacts page.
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
              <span>Gender</span>
              <input
                name="gender"
                type="text"
                value={formData.gender}
                onChange={handleInputChange}
              />
            </label>

            <label className="form-field">
              <span>Field of Work</span>
              <select
                name="fieldOfWork"
                value={formData.fieldOfWork}
                onChange={handleInputChange}
              >
                <option value="">Select an option</option>
                {contactFieldOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.fieldOfWork ? <small>{formErrors.fieldOfWork}</small> : null}
            </label>

            <label className="form-field">
              <span>Highest Degree and Date obtained</span>
              <input
                name="highestDegreeAndDate"
                type="text"
                value={formData.highestDegreeAndDate}
                onChange={handleInputChange}
              />
            </label>

            <label className="form-field">
              <span>Current Title</span>
              <input
                name="currentTitle"
                type="text"
                value={formData.currentTitle}
                onChange={handleInputChange}
              />
              {formErrors.currentTitle ? <small>{formErrors.currentTitle}</small> : null}
            </label>

            <label className="form-field">
              <span>Current Employer</span>
              <input
                name="currentEmployer"
                type="text"
                value={formData.currentEmployer}
                onChange={handleInputChange}
              />
              {formErrors.currentEmployer ? <small>{formErrors.currentEmployer}</small> : null}
            </label>

            <label className="form-field">
              <span>Any different previous work</span>
              <textarea
                name="previousWork"
                rows={4}
                value={formData.previousWork}
                onChange={handleInputChange}
              />
            </label>

            <label className="form-field">
              <span>Willing to Be Contacted?</span>
              <select
                name="willingToBeContacted"
                value={formData.willingToBeContacted}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
              >
                <option value="">Select one</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
              </select>
              {formErrors.bestFormOfContact ? <small>{formErrors.bestFormOfContact}</small> : null}
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

            <label className="form-field form-field-wide consent-field">
              <input
                name="consentToShare"
                type="checkbox"
                checked={formData.consentToShare}
                onChange={handleInputChange}
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
      </>
    )
  }

  if (isPublicAlumniSubmissionRoute) {
    return (
      <div className="site-shell">
        <header className="topbar public-topbar">
          <div className="topbar-brand">
            <img
              className="topbar-logo"
              src={preHealthLogo}
              alt="Sattler Pre-Health Association logo with the motto Connect, Equip, Serve."
            />
            <p className="eyebrow">Sattler College Pre-Health Club</p>
          </div>
        </header>

        <main className="page">{renderAlumniSubmissionContent(true)}</main>
      </div>
    )
  }

  if (authLoading) {
    return <AuthLoadingScreen />
  }

  if (!session) {
    return <AuthGateScreen error={authError} isSigningIn={isSigningIn} onSignIn={handleGoogleSignIn} />
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <img
            className="topbar-logo"
            src={preHealthLogo}
            alt="Sattler Pre-Health Association logo with the motto Connect, Equip, Serve."
          />
          <p className="eyebrow">Sattler College Pre-Health Association</p>
        </div>
        <div className="topbar-actions">
          <nav className="nav">
            <button
              className={view === 'home' ? 'nav-link active' : 'nav-link'}
              onClick={() => navigateToView('home')}
            >
              Main page
            </button>
            <button
              className={view === 'directory' ? 'nav-link active' : 'nav-link'}
              onClick={() => navigateToView('directory')}
            >
              Alumni contacts
            </button>
            <button
              className={view === 'internships' ? 'nav-link active' : 'nav-link'}
              onClick={() => navigateToView('internships')}
            >
              Internships
            </button>
            {isAdmin ? (
              <button
                className={view === 'review' ? 'nav-link active' : 'nav-link'}
                onClick={() => navigateToView('review')}
              >
                Review submissions
              </button>
            ) : null}
          </nav>

          <div className="session-tools">
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                void handleSignOut()
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {view === 'home' ? (
        <main className="page">
          <section
            className="home-hero"
            style={{
              backgroundImage: `linear-gradient(rgba(10, 20, 38, 0.58), rgba(10, 20, 38, 0.58)), url(${homeHeroImage})`,
            }}
          >
            <div className="home-hero-copy">
              <p className="section-label">Sattler Pre-Health Association</p>
              <h1>Find mentors</h1>
              <h1>Ask questions</h1>
              <h1>Move forward</h1>
            </div>
          </section>

          <section className="hero-panel">
            <div className="hero-copy">
              <p className="section-label">Sattler Pre-Health Association</p>
              <h2>Choosing your path can be a formidable obstacle. We&apos;re here to change that.</h2>
              <p className="lead">
                This platform is designed to help students discover career paths, learn from
                alumni, and reach out with clarity and confidence. To begin browsing alumnis or research oppurtunities navigate to the respective page. 
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => navigateToView('directory')}>
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
                    The Sattler Pre-Health Association is aimed at creating a tight-knit community among fellow students pursuing health careers, equipping them to stay motivated and navigate the path to graduate school. This will be accomplished through building broader networks, compiling resources, and offering various workshops and speaking events through the semester.
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
              onClick={() => navigateToView('directory')}
            >
              <p className="section-label">mentor connections</p>
              <h3>Connect with Alumni Mentors</h3>
            </button>

            <button
              type="button"
              className="content-card content-card-photo"
              style={{ backgroundImage: `url(${internshipCardImage})` }}
              onClick={() => navigateToView('internships')}
            >
              <p className="section-label">career discovery</p>
              <h3>Discover Internships and Experiences</h3>
            </button>

            <button
              type="button"
              className="content-card content-card-photo"
              style={{ backgroundImage: `url(${careerCardImage})` }}
              onClick={() => navigateToView('internships')}
            >
              <p className="section-label">real world experience</p>
              <h3>Explore Healthcare Paths</h3>
            </button>
          </section>
        </main>
      ) : view === 'directory' ? (
        <main className="page">
          <section className="directory-header">
            <div>
              <p className="section-label">Alumni directory</p>
              <h2>Start with a small, high-trust list of mentors.</h2>
              <p className="lead">
                Even ten strong contacts can make a huge difference in your confidence and clarity. Browse the directory to find alumni mentors you can reach out to for advice, informational interviews, or shadowing opportunities.
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

              <button className="primary-button" onClick={() => navigateToView('submit')}>
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
                    <>
                      <div className="contact-header">
                        <p className="section-label">Edit contact</p>
                      </div>
                      <label className="experience-form-field">
                        <span>Full Name</span>
                        <input
                          type="text"
                          value={contactEditDraft.fullName}
                          onChange={(e) => handleContactEditDraftChange('fullName', e.target.value)}
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Gender</span>
                        <input
                          type="text"
                          value={contactEditDraft.gender}
                          onChange={(e) => handleContactEditDraftChange('gender', e.target.value)}
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Field of Work</span>
                        <select
                          value={contactEditDraft.fieldOfWork}
                          onChange={(e) =>
                            handleContactEditDraftChange('fieldOfWork', e.target.value)
                          }
                        >
                          <option value="">Select an option</option>
                          {contactFieldOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="experience-form-field">
                        <span>Highest Degree and Date obtained</span>
                        <input
                          type="text"
                          value={contactEditDraft.highestDegreeAndDate}
                          onChange={(e) =>
                            handleContactEditDraftChange('highestDegreeAndDate', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Current Title</span>
                        <input
                          type="text"
                          value={contactEditDraft.currentTitle}
                          onChange={(e) =>
                            handleContactEditDraftChange('currentTitle', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Current Employer</span>
                        <input
                          type="text"
                          value={contactEditDraft.currentEmployer}
                          onChange={(e) =>
                            handleContactEditDraftChange('currentEmployer', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Any different previous work</span>
                        <textarea
                          rows={3}
                          value={contactEditDraft.previousWork}
                          onChange={(e) =>
                            handleContactEditDraftChange('previousWork', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Willing to Be Contacted?</span>
                        <select
                          value={
                            contactEditDraft.willingToBeContacted === null
                              ? ''
                              : String(contactEditDraft.willingToBeContacted)
                          }
                          onChange={(e) =>
                            handleContactEditDraftChange(
                              'willingToBeContacted',
                              e.target.value === '' ? null : e.target.value === 'true',
                            )
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
                          value={contactEditDraft.bestFormOfContact}
                          onChange={(e) =>
                            handleContactEditDraftChange('bestFormOfContact', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Location</span>
                        <input
                          type="text"
                          value={contactEditDraft.location}
                          onChange={(e) =>
                            handleContactEditDraftChange('location', e.target.value)
                          }
                        />
                      </label>
                      <div className="contact-admin-actions">
                        <button
                          type="button"
                          className="primary-button"
                          disabled={contactSavingById[contact.id]}
                          onClick={() => {
                            void handleContactEditSave(contact.id)
                          }}
                        >
                          {contactSavingById[contact.id] ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="nav-link"
                          onClick={handleContactEditCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="contact-header">
                        <p className="contact-field">{contact.fieldOfWork || 'Field not provided'}</p>
                        <h3>{contact.fullName}</h3>
                      </div>
                      <dl className="contact-meta">
                        <div>
                          <dt>Gender</dt>
                          <dd>{contact.gender || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt>Field of Work</dt>
                          <dd>{contact.fieldOfWork || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt>Highest Degree and Date obtained</dt>
                          <dd>{contact.highestDegreeAndDate || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt>Current Title</dt>
                          <dd>{contact.currentTitle}</dd>
                        </div>
                        <div>
                          <dt>Current Employer</dt>
                          <dd>{contact.currentEmployer}</dd>
                        </div>
                        <div>
                          <dt>Willing to Be Contacted?</dt>
                          <dd>{formatYesNo(contact.willingToBeContacted)}</dd>
                        </div>
                        <div>
                          <dt>Best form of contact?</dt>
                          <dd>{contact.bestFormOfContact}</dd>
                        </div>
                        <div>
                          <dt>Location</dt>
                          <dd>{contact.location}</dd>
                        </div>
                      </dl>
                      <p className="contact-notes">
                        {contact.previousWork || 'No previous work listed.'}
                      </p>
                      {isAdmin ? (
                        <div className="contact-admin-actions">
                          <button
                            type="button"
                            className="experience-delete-button"
                            onClick={() => handleContactEditStart(contact)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="experience-delete-button"
                            disabled={contactDeletingById[contact.id]}
                            onClick={() => {
                              void handleContactDelete(contact.id)
                            }}
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
      ) : view === 'submit' ? (
        <main className="page">{renderAlumniSubmissionContent()}</main>
      ) : view === 'review' ? (
        <main className="page">
          <section className="directory-header">
            <div>
              <p className="section-label">Admin review</p>
              <h2>Review alumni submissions before they enter the directory.</h2>
              <p className="lead">
                Approving a submission creates a new alumni contact. Rejecting it keeps it out of
                the contacts page.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              disabled={submissionReviewLoading}
              onClick={() => {
                void loadAlumniSubmissions()
              }}
            >
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
                      <p className="contact-field">
                        {submission.fieldOfWork || 'Field not provided'}
                      </p>
                      <h3>{submission.fullName}</h3>
                    </div>
                    <p className="review-date">
                      Submitted {formatExperienceDate(submission.createdAt)}
                    </p>
                  </div>

                  <dl className="contact-meta">
                    <div>
                      <dt>Gender</dt>
                      <dd>{submission.gender || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt>Field of Work</dt>
                      <dd>{submission.fieldOfWork || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt>Highest Degree and Date obtained</dt>
                      <dd>{submission.highestDegreeAndDate || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt>Current Title</dt>
                      <dd>{submission.currentTitle}</dd>
                    </div>
                    <div>
                      <dt>Current Employer</dt>
                      <dd>{submission.currentEmployer}</dd>
                    </div>
                    <div>
                      <dt>Willing to Be Contacted?</dt>
                      <dd>{formatYesNo(submission.willingToBeContacted)}</dd>
                    </div>
                    <div>
                      <dt>Best form of contact?</dt>
                      <dd>{submission.bestFormOfContact}</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>{submission.location}</dd>
                    </div>
                  </dl>

                  <p className="contact-notes">
                    {submission.previousWork || 'No previous work listed.'}
                  </p>

                  <div className="contact-admin-actions">
                    <button
                      type="button"
                      className="primary-button"
                      disabled={submissionReviewSavingById[submission.id]}
                      onClick={() => {
                        void handleReviewSubmission(submission, 'approved')
                      }}
                    >
                      {submissionReviewSavingById[submission.id] ? 'Saving...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="experience-delete-button"
                      disabled={submissionReviewSavingById[submission.id]}
                      onClick={() => {
                        void handleReviewSubmission(submission, 'rejected')
                      }}
                    >
                      Reject
                    </button>
                  </div>
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
              <h2>Where ambition meets innovation. Find a world-class internship that shapes your future.</h2>
              <p className="lead">
                Start exploring internships across clinical, research, 
                and community health settings—each opportunity is designed 
                to help you understand its fit, timing, and how to prepare.
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
                  {editingInternshipId === internship.id && internshipEditDraft ? (
                    <>
                      <div className="internship-header">
                        <p className="section-label">Edit internship</p>
                      </div>
                      <label className="experience-form-field">
                        <span>Name of Internship</span>
                        <input
                          type="text"
                          value={internshipEditDraft.name}
                          onChange={(e) => handleInternshipEditDraftChange('name', e.target.value)}
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Institution</span>
                        <input
                          type="text"
                          value={internshipEditDraft.institution}
                          onChange={(e) =>
                            handleInternshipEditDraftChange('institution', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Location</span>
                        <input
                          type="text"
                          value={internshipEditDraft.location}
                          onChange={(e) =>
                            handleInternshipEditDraftChange('location', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Summary</span>
                        <textarea
                          rows={3}
                          value={internshipEditDraft.summary}
                          onChange={(e) =>
                            handleInternshipEditDraftChange('summary', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Ideal Candidate</span>
                        <select
                          value={internshipEditDraft.idealCandidate}
                          onChange={(e) =>
                            handleInternshipEditDraftChange('idealCandidate', e.target.value)
                          }
                        >
                          <option value="">Select an option</option>
                          {idealCandidateOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="experience-form-field">
                        <span>Clinical or Basic Science or Other</span>
                        <select
                          value={internshipEditDraft.opportunityType}
                          onChange={(e) =>
                            handleInternshipEditDraftChange('opportunityType', e.target.value)
                          }
                        >
                          <option value="">Select an option</option>
                          {opportunityTypeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="experience-form-field">
                        <span>Deadline</span>
                        <input
                          type="text"
                          value={internshipEditDraft.deadline}
                          onChange={(e) =>
                            handleInternshipEditDraftChange('deadline', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Website</span>
                        <input
                          type="text"
                          value={internshipEditDraft.website}
                          onChange={(e) =>
                            handleInternshipEditDraftChange('website', e.target.value)
                          }
                        />
                      </label>
                      <div className="internship-admin-actions">
                        <button
                          type="button"
                          className="primary-button"
                          disabled={internshipSavingById[internship.id]}
                          onClick={() => {
                            void handleInternshipEditSave(internship.id)
                          }}
                        >
                          {internshipSavingById[internship.id] ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="nav-link"
                          onClick={handleInternshipEditCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                  <div className="internship-header">
                    <div>
                      <p className="contact-field">
                        {internship.opportunityType || 'Internship'}
                      </p>
                      <h3>{internship.name}</h3>
                    </div>
                    <p className="internship-organization">{internship.institution}</p>
                  </div>

                  <p className="internship-description">{internship.summary}</p>

                  <div className="internship-table-wrapper">
                    <table className="internship-table">
                      <tbody>
                        <tr>
                          <th scope="row">Name of Internship</th>
                          <td>{internship.name}</td>
                        </tr>
                        <tr>
                          <th scope="row">Institution</th>
                          <td>{internship.institution}</td>
                        </tr>
                        <tr>
                          <th scope="row">Location</th>
                          <td>{internship.location || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Summary</th>
                          <td>{internship.summary || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Ideal Candidate</th>
                          <td>{internship.idealCandidate || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Clinical or Basic Science or Other</th>
                          <td>{internship.opportunityType || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Deadline</th>
                          <td>{internship.deadline || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Website</th>
                          <td>
                            {internship.website ? (
                              <a
                                href={getWebsiteHref(internship.website)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {internship.website}
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {isAdmin ? (
                    <div className="internship-admin-actions">
                      <button
                        type="button"
                        className="experience-delete-button"
                        onClick={() => handleInternshipEditStart(internship)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="experience-delete-button"
                        disabled={internshipDeletingById[internship.id]}
                        onClick={() => {
                          void handleInternshipDelete(internship.id)
                        }}
                      >
                        {internshipDeletingById[internship.id] ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  ) : null}

                  <div className="internship-actions">
                    <button
                      type="button"
                      className="internship-action-button"
                      aria-expanded={
                        experiencePanelModeByInternshipId[internship.id] === 'read'
                          ? 'true'
                          : 'false'
                      }
                      aria-controls={`internship-experiences-read-${internship.id}`}
                      onClick={() => toggleReadExperienceSection(internship.id)}
                    >
                      Read experiences
                    </button>
                    <button
                      type="button"
                      className="internship-action-button internship-action-button-secondary"
                      aria-expanded={
                        experiencePanelModeByInternshipId[internship.id] === 'share'
                          ? 'true'
                          : 'false'
                      }
                      aria-controls={`internship-experiences-share-${internship.id}`}
                      onClick={() => handleShareExperience(internship.id)}
                    >
                      Share your experience
                    </button>
                  </div>

                  {experiencePanelModeByInternshipId[internship.id] === 'read' ? (
                    <section
                      id={`internship-experiences-read-${internship.id}`}
                      className="internship-experiences"
                    >
                      <div className="internship-experiences-header">
                        <div>
                          <p className="section-label">Student reflections</p>
                          <h4>Experiences from students who have explored this opportunity</h4>
                        </div>
                        <p className="internship-experiences-count">
                          {(experiencesByInternshipId[internship.id] ?? []).length} shared
                        </p>
                      </div>

                      {experienceErrorByInternshipId[internship.id] ? (
                        <p className="experience-feedback experience-feedback-error">
                          {experienceErrorByInternshipId[internship.id]}
                        </p>
                      ) : null}

                      {experienceLoadingByInternshipId[internship.id] ? (
                        <p className="experience-state">Loading experiences...</p>
                      ) : (experiencesByInternshipId[internship.id] ?? []).length === 0 ? (
                        <p className="experience-state">No experiences shared yet.</p>
                      ) : (
                        <div className="experience-list">
                          {(experiencesByInternshipId[internship.id] ?? []).map((experience) => (
                            <article key={experience.id} className="experience-entry">
                              <div className="experience-entry-header">
                                <div>
                                  <h5>{experience.authorName}</h5>
                                  <p>{formatExperienceDate(experience.createdAt)}</p>
                                </div>
                                {experience.userId === session?.user?.id || isAdmin ? (
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    {editingExperienceId !== experience.id ? (
                                      <button
                                        type="button"
                                        className="experience-delete-button"
                                        onClick={() => handleExperienceEditStart(experience)}
                                      >
                                        Edit
                                      </button>
                                    ) : null}
                                    <button
                                      type="button"
                                      className="experience-delete-button"
                                      disabled={experienceDeletingById[experience.id]}
                                      onClick={() =>
                                        handleExperienceDelete(internship.id, experience.id)
                                      }
                                    >
                                      {experienceDeletingById[experience.id]
                                        ? 'Deleting...'
                                        : 'Delete'}
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              {editingExperienceId === experience.id ? (
                                <>
                                  <textarea
                                    className="experience-form-field"
                                    rows={4}
                                    value={experienceEditDraft}
                                    onChange={(e) => setExperienceEditDraft(e.target.value)}
                                  />
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button
                                      type="button"
                                      className="primary-button"
                                      disabled={experienceSavingById[experience.id]}
                                      onClick={() => {
                                        void handleExperienceEditSave(internship.id, experience.id)
                                      }}
                                    >
                                      {experienceSavingById[experience.id] ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      type="button"
                                      className="nav-link"
                                      onClick={handleExperienceEditCancel}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p className="experience-note">{experience.note}</p>
                              )}
                            </article>
                          ))}
                        </div>
                      )}

                    </section>
                  ) : null}

                  {experiencePanelModeByInternshipId[internship.id] === 'share' ? (
                    <section
                      id={`internship-experiences-share-${internship.id}`}
                      className="internship-experiences"
                    >
                      <form
                        className="experience-form"
                        onSubmit={(event) => handleExperienceSubmit(event, internship.id)}
                      >
                        <div className="experience-form-header">
                          <h5>Share your experience</h5>
                          <p>Leave a short note for the next student looking at this internship.</p>
                        </div>

                        <label className="experience-form-field">
                          <span>Your name</span>
                          <input
                            ref={(element) => {
                              experienceAuthorInputRefs.current[internship.id] = element
                            }}
                            type="text"
                            value={
                              (experienceDraftsByInternshipId[internship.id] ??
                                createExperienceDraft()).authorName
                            }
                            onChange={(event) =>
                              handleExperienceDraftChange(
                                internship.id,
                                'authorName',
                                event.target.value,
                              )
                            }
                            placeholder="Ex. Rachel K."
                          />
                        </label>

                        <label className="experience-form-field">
                          <span>Your note</span>
                          <textarea
                            rows={4}
                            value={
                              (experienceDraftsByInternshipId[internship.id] ??
                                createExperienceDraft()).note
                            }
                            onChange={(event) =>
                              handleExperienceDraftChange(internship.id, 'note', event.target.value)
                            }
                            placeholder="What was helpful, surprising, or worth knowing ahead of time?"
                          />
                        </label>

                        {experienceFormErrorByInternshipId[internship.id] ? (
                          <p className="experience-feedback experience-feedback-error">
                            {experienceFormErrorByInternshipId[internship.id]}
                          </p>
                        ) : null}

                        <button
                          type="submit"
                          className="experience-submit-button"
                          disabled={experienceSubmittingByInternshipId[internship.id]}
                        >
                          {experienceSubmittingByInternshipId[internship.id]
                            ? 'Submitting...'
                            : 'Submit experience'}
                        </button>
                      </form>
                    </section>
                  ) : null}
                    </>
                  )}
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
