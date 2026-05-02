import type {
  AlumniSubmission,
  AlumniSubmissionRow,
  Contact,
  ContactRow,
  Internship,
  InternshipExperience,
  InternshipExperienceRow,
  InternshipRow,
} from '../types'

export function mapContactRow(row: ContactRow): Contact {
  return {
    id: row.id,
    fullName: row.full_name,
    gender: row.gender ?? '',
    fieldOfWork: row.field_of_work ?? '',
    highestDegree: row.highest_degree ?? '',
    degreeObtainedDate: row.degree_obtained_date ?? '',
    currentTitle: row.current_title,
    currentEmployer: row.current_employer,
    previousWork: row.previous_work ?? '',
    willingToBeContacted: row.willing_to_be_contacted,
    email: row.email ?? '',
    location: row.location,
  }
}

export function mapInternshipRow(row: InternshipRow): Internship {
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

export function mapInternshipExperienceRow(row: InternshipExperienceRow): InternshipExperience {
  return {
    id: row.id,
    internshipId: row.internship_id,
    authorName: row.author_name,
    note: row.note,
    createdAt: row.created_at,
    userId: row.user_id,
  }
}

export function mapAlumniSubmissionRow(row: AlumniSubmissionRow): AlumniSubmission {
  return {
    id: row.id,
    fullName: row.full_name,
    gender: row.gender ?? '',
    fieldOfWork: row.field_of_work ?? '',
    highestDegree: row.highest_degree ?? '',
    degreeObtainedDate: row.degree_obtained_date ?? '',
    currentTitle: row.current_title,
    currentEmployer: row.current_employer,
    previousWork: row.previous_work ?? '',
    willingToBeContacted: row.willing_to_be_contacted,
    email: row.email ?? '',
    location: row.location,
    consentToShare: row.consent_to_share,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  }
}
