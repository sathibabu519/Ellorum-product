const ERROR_BADGE_STYLE =
  'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;'
const WARNING_STYLE = 'color: orange;'

export function logError(label, error) {
  // eslint-disable-next-line no-console
  console.log(`%c${label}`, ERROR_BADGE_STYLE, error && error.message)
}

export function logWarning(label, error) {
  // eslint-disable-next-line no-console
  console.log(`%c${label}`, WARNING_STYLE, error && error.message)
}
