// Is the thing that displays the different elements of the web app; is rendered by main.tsx.

import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import preHealthLogo from './assets/pre-health-logo.png'
import './App.css'
import {
  ALLOWED_EMAIL_DOMAIN_LABEL,
  getInstitutionalAccessMessage,
  isAllowedInstitutionEmail,
  readAuthCallbackError,
} from './auth'
import { supabase } from './supabaseClient'

type View = 'home' | 'directory' | 'internships' | 'submit'

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

type ContactEditDraft = Omit<Contact, 'id'>

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

function createExperienceDraft(): ExperienceDraft {
  return {
    authorName: '',
    note: '',
  }
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

function formatExperienceDate(date: string): string {
  return experienceDateFormatter.format(new Date(date))
}

function getWebsiteHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`
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
      return
    }

    async function checkAdmin() {
      const { data } = await supabase.rpc('is_admin')
      setIsAdmin(data === true)
    }

    void checkAdmin()
  }, [session])

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
        supabase.from('contacts').select('*').order('name'),
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

  const fields = ['All fields', ...new Set(contacts.map((contact) => contact.field))]

  const visibleContacts =
    selectedField === 'All fields'
      ? contacts
      : contacts.filter((contact) => contact.field === selectedField)

  const signedInUserEmail = session?.user.email ?? null

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
    setView('home')

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      setAuthError(signOutError.message)
    }
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
      name: contact.name,
      field: contact.field,
      role: contact.role,
      location: contact.location,
      connectionType: contact.connectionType,
      notes: contact.notes,
    })
  }

  function handleContactEditCancel() {
    setEditingContactId(null)
    setContactEditDraft(null)
  }

  function handleContactEditDraftChange(field: keyof ContactEditDraft, value: string) {
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
        name: contactEditDraft.name,
        field: contactEditDraft.field,
        role: contactEditDraft.role,
        location: contactEditDraft.location,
        connection_type: contactEditDraft.connectionType,
        notes: contactEditDraft.notes,
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

  if (authLoading) {
    return <AuthLoadingScreen />
  }

  if (!session) {
    return <AuthGateScreen error={authError} isSigningIn={isSigningIn} onSignIn={handleGoogleSignIn} />
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Sattler College Pre-Health Club</p>
          <h1>Find mentors. Ask questions. Move forward.</h1>
        </div>
        <div className="topbar-actions">
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

          <div className="session-tools">
            {signedInUserEmail ? <p className="session-badge">{signedInUserEmail}</p> : null}
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
                        <span>Name</span>
                        <input
                          type="text"
                          value={contactEditDraft.name}
                          onChange={(e) => handleContactEditDraftChange('name', e.target.value)}
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Field</span>
                        <input
                          type="text"
                          value={contactEditDraft.field}
                          onChange={(e) => handleContactEditDraftChange('field', e.target.value)}
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Role</span>
                        <input
                          type="text"
                          value={contactEditDraft.role}
                          onChange={(e) => handleContactEditDraftChange('role', e.target.value)}
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
                      <label className="experience-form-field">
                        <span>Connection type</span>
                        <input
                          type="text"
                          value={contactEditDraft.connectionType}
                          onChange={(e) =>
                            handleContactEditDraftChange('connectionType', e.target.value)
                          }
                        />
                      </label>
                      <label className="experience-form-field">
                        <span>Notes</span>
                        <textarea
                          rows={3}
                          value={contactEditDraft.notes}
                          onChange={(e) => handleContactEditDraftChange('notes', e.target.value)}
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
                <li>Look for opportunities that match your career plans. (For competitive programs, consider applying to approximately 20 internships.)</li>
                <li>List all potential internships by application deadline in a spreadsheet.</li>
                <li>Ask 2-3 professors or advisors to write a <i>strong</i> letter of recommendation.</li>
                <li>Share a list of potential internships with your letters writers at least 2 weeks before 
                  the first deadline. Include notes about specific traits they should highlight for particular 
                  internships.</li>
                <li>Optimize your personal statement and CV.</li>
                <li>Submit and pray.</li>
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
