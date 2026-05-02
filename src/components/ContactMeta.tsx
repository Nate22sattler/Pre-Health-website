import type { ContactProfile } from '../types'
import { formatDateObtained, formatYesNo } from '../lib/formatters'

type ContactMetaProps = {
  profile: ContactProfile
}

export function ContactMeta({ profile }: ContactMetaProps) {
  const rows = [
    ['Gender', profile.gender || 'Not provided'],
    ['Field of Work', profile.fieldOfWork || 'Not provided'],
    ['Highest Degree Obtained', profile.highestDegree || 'Not provided'],
    ['Graduation Date', formatDateObtained(profile.degreeObtainedDate)],
    ['Current Title', profile.currentTitle],
    ['Current Employer', profile.currentEmployer],
    ['Willing to Be Contacted?', formatYesNo(profile.willingToBeContacted)],
    ['Best form of contact?', profile.bestFormOfContact],
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
