import type { ContactProfile } from '../types'
import { formatDateObtained, formatYesNo } from '../lib/formatters'

type ContactMetaProps = {
  profile: ContactProfile
}

export function ContactMeta({ profile }: ContactMetaProps) {
  const isStudent = profile.employmentStatus === 'Student'
  const advisingAreas = [
    ...profile.willingToAdviseIn.filter((area) => area !== 'Other'),
    ...(profile.willingToAdviseIn.includes('Other')
      ? [profile.otherAdvisingArea || 'Other']
      : []),
  ]
  const rows = [
    ['Gender', profile.gender || 'Not provided'],
    ['Current Status', profile.employmentStatus || 'Not provided'],
    ...(isStudent
      ? [
          [
            'Current Program Graduation Date',
            formatDateObtained(profile.currentProgramGraduationDate),
          ],
        ]
      : []),
    ['Field of Work', profile.fieldOfWork || 'Not provided'],
    ['Highest Degree Obtained', profile.highestDegree || 'Not provided'],
    ['Graduation Year', formatDateObtained(profile.degreeObtainedDate)],
    ['Current Title', profile.currentTitle],
    ['Current Employer', profile.currentEmployer],
    ['Willing to Advise In', advisingAreas.length > 0 ? advisingAreas.join(', ') : 'Not provided'],
    ['Willing to Be Contacted?', formatYesNo(profile.willingToBeContacted)],
    ['Email', profile.email],
    ['Location', profile.location],
  ]

  return (
    <dl className="contact-meta">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
