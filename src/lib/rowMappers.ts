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
    employmentStatus: row.employment_status ?? '',
    currentProgramGraduationDate: row.current_program_graduation_date ?? '',
    fieldOfWork: row.field_of_work ?? '',
    highestDegree: row.highest_degree ?? '',
    degreeObtainedDate: row.degree_obtained_date ?? '',
    currentTitle: row.current_title,
    currentEmployer: row.current_employer,
    bio: row.bio ?? row.previous_work ?? '',
    willingToAdviseIn: row.willing_to_advise_in ?? [],
    otherAdvisingArea: row.other_advising_area ?? '',
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
    idealCandidateOther: row.ideal_candidate_other ?? '',
    opportunityType: row.opportunity_type ?? '',
    opportunityTypeOther: row.opportunity_type_other ?? '',
    deadline: row.deadline ?? '',
    website: row.website ?? '',
    comments: row.comments ?? '',
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
    employmentStatus: row.employment_status ?? '',
    currentProgramGraduationDate: row.current_program_graduation_date ?? '',
    fieldOfWork: row.field_of_work ?? '',
    highestDegree: row.highest_degree ?? '',
    degreeObtainedDate: row.degree_obtained_date ?? '',
    currentTitle: row.current_title,
    currentEmployer: row.current_employer,
    bio: row.bio ?? row.previous_work ?? '',
    willingToAdviseIn: row.willing_to_advise_in ?? [],
    otherAdvisingArea: row.other_advising_area ?? '',
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
