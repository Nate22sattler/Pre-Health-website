import type { ExperienceDraft, SubmissionFormData } from './types'

export const idealCandidateOptions = ['pre-MD', 'pre-PhD', 'other']
export const opportunityTypeOptions = ['Clinical', 'Basic Science', 'Other']
export const contactFieldOptions = ['PT', 'MD', 'DDS', 'OT', 'PH', 'BSN', 'PA', 'Research']
export const highestDegreeOptions = ['Associate', "Bachelor's", "Master's", 'Doctorate']

export const initialFormData: SubmissionFormData = {
  fullName: '',
  gender: '',
  fieldOfWork: '',
  highestDegree: '',
  degreeObtainedDate: '',
  currentTitle: '',
  currentEmployer: '',
  previousWork: '',
  willingToBeContacted: '',
  bestFormOfContact: '',
  location: '',
  consentToShare: false,
}

export function createExperienceDraft(): ExperienceDraft {
  return {
    authorName: '',
    note: '',
  }
}
