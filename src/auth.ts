const DEFAULT_ALLOWED_EMAIL_DOMAIN = 'sattler.edu'

export const ALLOWED_EMAIL_DOMAIN = (
  import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN ?? DEFAULT_ALLOWED_EMAIL_DOMAIN
)
  .trim()
  .toLowerCase()

export const ALLOWED_EMAIL_DOMAIN_LABEL = `@${ALLOWED_EMAIL_DOMAIN}`

export function isAllowedInstitutionEmail(email: string | null | undefined): boolean {
  const normalizedEmail = email?.trim().toLowerCase() ?? ''

  if (!normalizedEmail.includes('@')) {
    return false
  }

  return normalizedEmail.endsWith(ALLOWED_EMAIL_DOMAIN_LABEL)
}

export function getInstitutionalAccessMessage(): string {
  return `Only Google accounts with an ${ALLOWED_EMAIL_DOMAIN_LABEL} email address can access this site.`
}

export function readAuthCallbackError(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const url = new URL(window.location.href)
  const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash)

  const callbackError =
    url.searchParams.get('error_description') ??
    url.searchParams.get('error') ??
    hashParams.get('error_description') ??
    hashParams.get('error')

  if (!callbackError) {
    return null
  }

  url.searchParams.delete('error')
  url.searchParams.delete('error_description')
  hashParams.delete('error')
  hashParams.delete('error_description')

  const nextHash = hashParams.toString()
  const nextUrl = `${url.pathname}${url.search}${nextHash ? `#${nextHash}` : ''}`

  window.history.replaceState({}, document.title, nextUrl)

  return callbackError
}
