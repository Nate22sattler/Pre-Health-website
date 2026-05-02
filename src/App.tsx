// Is the thing that displays the different elements of the web app; is rendered by main.tsx.

import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import './App.css'
import {
  getInstitutionalAccessMessage,
  isAllowedInstitutionEmail,
  readAuthCallbackError,
} from './auth'
import { AuthGateScreen, AuthLoadingScreen } from './components/AuthScreens'
import { Header, PublicHeader } from './components/Header'
import { contactFieldOptions, createExperienceDraft, initialFormData } from './constants'
import { mapAlumniSubmissionRow, mapContactRow, mapInternshipExperienceRow, mapInternshipRow } from './lib/rowMappers'
import { DirectoryPage } from './pages/DirectoryPage'
import { HomePage } from './pages/HomePage'
import { InternshipsPage } from './pages/InternshipsPage'
import { ReviewPage } from './pages/ReviewPage'
import { SubmitPage } from './pages/SubmitPage'
import { supabase } from './supabaseClient'
import type {
  AlumniSubmission,
  AlumniSubmissionRow,
  Contact,
  ContactEditDraft,
  ContactRow,
  ExperienceDraft,
  ExperiencePanelMode,
  Internship,
  InternshipExperience,
  InternshipExperienceRow,
  InternshipRow,
  SubmissionFormData,
  View,
} from './types'

function App() {
  const [view, setView] = useState<View>('home')
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(() => readAuthCallbackError())
  const initialAuthError = useRef(authError)
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
      ((data as AlumniSubmissionRow[] | null) ?? []).map(mapAlumniSubmissionRow),
    )
    setSubmissionReviewLoading(false)
  }

  function resetSignedOutState() {
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
    setIsAdmin(false)
    setAlumniSubmissions([])
    setSubmissionReviewLoading(false)
    setSubmissionReviewError(null)
    setEditingInternshipId(null)
    setInternshipEditDraft(null)
    setInternshipSavingById({})
    setInternshipDeletingById({})
    setEditingExperienceId(null)
    setExperienceEditDraft('')
    setExperienceSavingById({})
  }

  useEffect(() => {
    let isActive = true
    const callbackError = initialAuthError.current

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
        resetSignedOutState()

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
        resetSignedOutState()
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
      return
    }

    async function checkAdmin() {
      const { data } = await supabase.rpc('is_admin')
      const nextIsAdmin = data === true
      setIsAdmin(nextIsAdmin)

      if (!nextIsAdmin) {
        setAlumniSubmissions([])
        setSubmissionReviewLoading(false)
        setSubmissionReviewError(null)
      }
    }

    void checkAdmin()
  }, [session])

  useEffect(() => {
    if (!session || !isAdmin) {
      return
    }

    void Promise.resolve().then(loadAlumniSubmissions)
  }, [session, isAdmin])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!session) return

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

      setContacts(((contactRows as ContactRow[] | null) ?? []).map(mapContactRow))
      setInternships(((internshipRows as InternshipRow[] | null) ?? []).map(mapInternshipRow))
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
      [internshipId]: ((data as InternshipExperienceRow[] | null) ?? []).map(
        mapInternshipExperienceRow,
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

  function handleExperienceAuthorInputRef(
    internshipId: string,
    element: HTMLInputElement | null,
  ) {
    experienceAuthorInputRefs.current[internshipId] = element
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

  function handleContactEditStart({ id, ...draft }: Contact) {
    setEditingContactId(id)
    setContactEditDraft(draft)
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
        highest_degree: contactEditDraft.highestDegree || null,
        degree_obtained_date: contactEditDraft.degreeObtainedDate || null,
        current_title: contactEditDraft.currentTitle,
        current_employer: contactEditDraft.currentEmployer,
        previous_work: contactEditDraft.previousWork || null,
        willing_to_be_contacted: contactEditDraft.willingToBeContacted,
        email: contactEditDraft.email.trim(),
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

  function handleInternshipEditStart({ id, ...draft }: Internship) {
    setEditingInternshipId(id)
    setInternshipEditDraft(draft)
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
    if (!formData.highestDegree.trim()) {
      nextErrors.highestDegree = 'Please select your highest degree.'
    }
    if (!formData.degreeObtainedDate.trim()) {
      nextErrors.degreeObtainedDate = 'Please select your graduation year.'
    }
    if (!formData.currentTitle.trim()) nextErrors.currentTitle = 'Please enter your current title.'
    if (!formData.currentEmployer.trim()) {
      nextErrors.currentEmployer = 'Please enter your current employer.'
    }
    if (!formData.location.trim()) nextErrors.location = 'Please enter your location.'
    if (!formData.willingToBeContacted.trim()) {
      nextErrors.willingToBeContacted = 'Please let us know if you are willing to be contacted.'
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Please enter your email.'
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
      highest_degree: formData.highestDegree || null,
      degree_obtained_date: formData.degreeObtainedDate || null,
      current_title: formData.currentTitle.trim(),
      current_employer: formData.currentEmployer.trim(),
      previous_work: formData.previousWork.trim() || null,
      willing_to_be_contacted: formData.willingToBeContacted === 'true',
      email: formData.email.trim(),
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
          highest_degree: submission.highestDegree || null,
          degree_obtained_date: submission.degreeObtainedDate || null,
          current_title: submission.currentTitle,
          current_employer: submission.currentEmployer,
          previous_work: submission.previousWork || null,
          willing_to_be_contacted: submission.willingToBeContacted,
          email: submission.email,
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

  if (isPublicAlumniSubmissionRoute) {
    return (
      <div className="site-shell">
        <PublicHeader />
        <SubmitPage
          isPublicPage
          formData={formData}
          formErrors={formErrors}
          isSubmitted={isSubmitted}
          isSubmittingAlumniForm={isSubmittingAlumniForm}
          submissionError={submissionError}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
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
      <Header view={view} isAdmin={isAdmin} onNavigate={navigateToView} onSignOut={handleSignOut} />

      {view === 'home' ? (
        <HomePage onNavigate={navigateToView} />
      ) : view === 'directory' ? (
        <DirectoryPage
          selectedField={selectedField}
          fields={fields}
          visibleContacts={visibleContacts}
          loading={loading}
          error={error}
          isAdmin={isAdmin}
          editingContactId={editingContactId}
          contactEditDraft={contactEditDraft}
          contactSavingById={contactSavingById}
          contactDeletingById={contactDeletingById}
          onSelectedFieldChange={setSelectedField}
          onNavigate={navigateToView}
          onContactEditStart={handleContactEditStart}
          onContactEditCancel={handleContactEditCancel}
          onContactEditDraftChange={handleContactEditDraftChange}
          onContactEditSave={handleContactEditSave}
          onContactDelete={handleContactDelete}
        />
      ) : view === 'submit' ? (
        <SubmitPage
          formData={formData}
          formErrors={formErrors}
          isSubmitted={isSubmitted}
          isSubmittingAlumniForm={isSubmittingAlumniForm}
          submissionError={submissionError}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      ) : view === 'review' ? (
        <ReviewPage
          isAdmin={isAdmin}
          alumniSubmissions={alumniSubmissions}
          submissionReviewLoading={submissionReviewLoading}
          submissionReviewError={submissionReviewError}
          submissionReviewSavingById={submissionReviewSavingById}
          onRefresh={loadAlumniSubmissions}
          onReviewSubmission={handleReviewSubmission}
        />
      ) : (
        <InternshipsPage
          internships={internships}
          loading={loading}
          error={error}
          isAdmin={isAdmin}
          currentUserId={session.user.id}
          editingInternshipId={editingInternshipId}
          internshipEditDraft={internshipEditDraft}
          internshipSavingById={internshipSavingById}
          internshipDeletingById={internshipDeletingById}
          experiencePanelModeByInternshipId={experiencePanelModeByInternshipId}
          experiencesByInternshipId={experiencesByInternshipId}
          experienceLoadingByInternshipId={experienceLoadingByInternshipId}
          experienceErrorByInternshipId={experienceErrorByInternshipId}
          experienceDraftsByInternshipId={experienceDraftsByInternshipId}
          experienceFormErrorByInternshipId={experienceFormErrorByInternshipId}
          experienceSubmittingByInternshipId={experienceSubmittingByInternshipId}
          experienceDeletingById={experienceDeletingById}
          editingExperienceId={editingExperienceId}
          experienceEditDraft={experienceEditDraft}
          experienceSavingById={experienceSavingById}
          onExperienceAuthorInputRef={handleExperienceAuthorInputRef}
          onInternshipEditStart={handleInternshipEditStart}
          onInternshipEditCancel={handleInternshipEditCancel}
          onInternshipEditDraftChange={handleInternshipEditDraftChange}
          onInternshipEditSave={handleInternshipEditSave}
          onInternshipDelete={handleInternshipDelete}
          onToggleReadExperienceSection={toggleReadExperienceSection}
          onShareExperience={handleShareExperience}
          onExperienceDraftChange={handleExperienceDraftChange}
          onExperienceSubmit={handleExperienceSubmit}
          onExperienceEditStart={handleExperienceEditStart}
          onExperienceEditCancel={handleExperienceEditCancel}
          onExperienceEditDraftChange={setExperienceEditDraft}
          onExperienceEditSave={handleExperienceEditSave}
          onExperienceDelete={handleExperienceDelete}
        />
      )}
    </div>
  )
}

export default App
