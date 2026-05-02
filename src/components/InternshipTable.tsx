import type { Internship } from '../types'
import { getWebsiteHref } from '../lib/formatters'

type InternshipTableProps = {
  internship: Internship
}

export function InternshipTable({ internship }: InternshipTableProps) {
  const rows = [
    ['Name of Internship', internship.name],
    ['Institution', internship.institution],
    ['Location', internship.location || 'Not provided'],
    ['Summary', internship.summary || 'Not provided'],
    ['Ideal Candidate', internship.idealCandidate || 'Not provided'],
    ['Clinical or Basic Science or Other', internship.opportunityType || 'Not provided'],
    ['Deadline', internship.deadline || 'Not provided'],
  ]

  return (
    <div className="internship-table-wrapper">
      <table className="internship-table">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{value}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Website</th>
            <td>
              {internship.website ? (
                <a href={getWebsiteHref(internship.website)} target="_blank" rel="noreferrer">
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
  )
}
