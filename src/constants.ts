import type { ExperienceDraft, SubmissionFormData } from './types'

export const idealCandidateOptions = ['pre-MD', 'pre-PhD', 'other']
export const opportunityTypeOptions = ['Clinical', 'Basic Science', 'Other']
export const employmentStatusOptions = ['Employed', 'Student']
export const contactFieldOptions = [
  'MD-PhD',
  'Clinical Medicine',
  'Research',
  'Nursing',
  'OT/PT',
  'Dentistry',
  'Public Health',
  'Psychology',
  'Other',
]
export const highestDegreeOptions = ['Associate', "Bachelor's", "Master's", 'Doctorate']
export const advisingAreaOptions = [
  'MCAT/GRE Prep',
  'Graduate or professional school applications',
  'Research',
  'General career questions',
  'Other',
]
export const graduationYearOptions = Array.from(
  { length: new Date().getFullYear() + 8 - 1950 + 1 },
  (_, index) => String(new Date().getFullYear() + 8 - index),
)

export const initialFormData: SubmissionFormData = {
  fullName: '',
  gender: '',
  employmentStatus: '',
  currentProgramGraduationDate: '',
  fieldOfWork: '',
  highestDegree: '',
  degreeObtainedDate: '',
  currentTitle: '',
  currentEmployer: '',
  bio: '',
  willingToAdviseIn: [],
  otherAdvisingArea: '',
  willingToBeContacted: '',
  email: '',
  location: '',
  consentToShare: false,
}

export function createExperienceDraft(): ExperienceDraft {
  return {
    authorName: '',
    note: '',
  }
}
