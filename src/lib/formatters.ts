const experienceDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatExperienceDate(date: string): string {
  return experienceDateFormatter.format(new Date(date))
}

export function formatDateObtained(date: string): string {
  if (!date) {
    return 'Not provided'
  }

  if (/^\d{4}$/.test(date)) {
    return date
  }

  const [year, month, day] = date.slice(0, 10).split('-')

  if (!year || !month || !day) {
    return 'Not provided'
  }

  return `${month}/${day}/${year}`
}

export function getWebsiteHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`
}

export function formatYesNo(value: boolean | null): string {
  if (value === null) {
    return 'Not provided'
  }

  return value ? 'Yes' : 'No'
}
