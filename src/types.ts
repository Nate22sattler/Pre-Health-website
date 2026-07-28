import type { FormEvent } from 'react'

export type View = 'home' | 'directory' | 'internships' | 'submit' | 'review'

export type Contact = {
  id: string
  fullName: string
  gender: string
  employmentStatus: string
  currentProgramGraduationDate: string
  fieldOfWork: string
  highestDegree: string
  degreeObtainedDate: string
  currentTitle: string
  currentEmployer: string
  bio: string
  willingToAdviseIn: string[]
  otherAdvisingArea: string
  willingToBeContacted: boolean | null
  email: string
  location: string
}

export type Internship = {
  id: string
  name: string
  institution: string
  location: string
  summary: string
  idealCandidate: string
  idealCandidateOther: string
  opportunityType: string
  opportunityTypeOther: string
  deadline: string
  website: string
  comments: string
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
  employmentStatus: string
  currentProgramGraduationDate: string
  fieldOfWork: string
  highestDegree: string
  degreeObtainedDate: string
  currentTitle: string
  currentEmployer: string
  bio: string
  willingToAdviseIn: string[]
  otherAdvisingArea: string
  willingToBeContacted: boolean
  email: string
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
  | 'employmentStatus'
  | 'currentProgramGraduationDate'
  | 'fieldOfWork'
  | 'highestDegree'
  | 'degreeObtainedDate'
  | 'currentTitle'
  | 'currentEmployer'
  | 'willingToAdviseIn'
  | 'otherAdvisingArea'
  | 'willingToBeContacted'
  | 'email'
  | 'location'
>

export type ContactRow = {
  id: string
  full_name: string
  gender: string | null
  employment_status: string | null
  current_program_graduation_date: string | null
  field_of_work: string | null
  highest_degree: string | null
  degree_obtained_date: string | null
  highest_degree_and_date: string | null
  current_title: string
  current_employer: string
  bio: string | null
  previous_work?: string | null
  willing_to_advise_in: string[] | null
  other_advising_area: string | null
  willing_to_be_contacted: boolean | null
  email: string | null
  location: string
}

export type InternshipRow = {
  id: string
  name: string
  institution: string
  location: string
  summary: string
  ideal_candidate: string | null
  ideal_candidate_other: string | null
  opportunity_type: string | null
  opportunity_type_other: string | null
  deadline: string | null
  website: string | null
  comments: string | null
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
  employment_status: string | null
  current_program_graduation_date: string | null
  field_of_work: string | null
  highest_degree: string | null
  degree_obtained_date: string | null
  highest_degree_and_date: string | null
  current_title: string
  current_employer: string
  bio: string | null
  previous_work?: string | null
  willing_to_advise_in: string[] | null
  other_advising_area: string | null
  willing_to_be_contacted: boolean
  email: string | null
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
  employmentStatus: string
  currentProgramGraduationDate: string
  fieldOfWork: string
  highestDegree: string
  degreeObtainedDate: string
  currentTitle: string
  currentEmployer: string
  bio: string
  willingToAdviseIn: string[]
  otherAdvisingArea: string
  willingToBeContacted: string
  email: string
  location: string
  consentToShare: boolean
}

export type SubmitHandler = (event: FormEvent<HTMLFormElement>) => void
