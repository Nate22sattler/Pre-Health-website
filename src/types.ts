import type { FormEvent } from 'react'

export type View = 'home' | 'directory' | 'internships' | 'submit' | 'review'

export type Contact = {
  id: string
  fullName: string
  gender: string
  fieldOfWork: string
  highestDegree: string
  degreeObtainedDate: string
  currentTitle: string
  currentEmployer: string
  previousWork: string
  willingToBeContacted: boolean | null
  bestFormOfContact: string
  location: string
}

export type Internship = {
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

export type InternshipExperience = {
  id: string
  internshipId: string
  authorName: string
  note: string
  createdAt: string
  userId: string | null
}

export type AlumniSubmission = {
  id: string
  fullName: string
  gender: string
  fieldOfWork: string
  highestDegree: string
  degreeObtainedDate: string
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

export type ContactEditDraft = Omit<Contact, 'id'>
export type ContactProfile = Pick<
  Contact,
  | 'gender'
  | 'fieldOfWork'
  | 'highestDegree'
  | 'degreeObtainedDate'
  | 'currentTitle'
  | 'currentEmployer'
  | 'willingToBeContacted'
  | 'bestFormOfContact'
  | 'location'
>

export type ContactRow = {
  id: string
  full_name: string
  gender: string | null
  field_of_work: string | null
  highest_degree: string | null
  degree_obtained_date: string | null
  highest_degree_and_date: string | null
  current_title: string
  current_employer: string
  previous_work: string | null
  willing_to_be_contacted: boolean | null
  best_form_of_contact: string
  location: string
}

export type InternshipRow = {
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

export type InternshipExperienceRow = {
  id: string
  internship_id: string
  author_name: string
  note: string
  created_at: string
  user_id: string | null
}

export type AlumniSubmissionRow = {
  id: string
  full_name: string
  gender: string | null
  field_of_work: string | null
  highest_degree: string | null
  degree_obtained_date: string | null
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

export type ExperienceDraft = {
  authorName: string
  note: string
}

export type ExperiencePanelMode = 'read' | 'share'

export type SubmissionFormData = {
  fullName: string
  gender: string
  fieldOfWork: string
  highestDegree: string
  degreeObtainedDate: string
  currentTitle: string
  currentEmployer: string
  previousWork: string
  willingToBeContacted: string
  bestFormOfContact: string
  location: string
  consentToShare: boolean
}

export type SubmitHandler = (event: FormEvent<HTMLFormElement>) => void
