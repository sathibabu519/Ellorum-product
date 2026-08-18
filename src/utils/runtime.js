export function exposeGlobal(name, value) {
  const scopes = [
    typeof window !== 'undefined' ? window : null,
    typeof global !== 'undefined' ? global : null,
  ]
  scopes.forEach((scope) => {
    if (scope) scope[name] = value
  })
}
