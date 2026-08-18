export function includesIgnoreCase(value, query) {
  if (!query) return true
  return String(value).toLowerCase().indexOf(String(query).toLowerCase()) !== -1
}

export function filterByField(items, field, query) {
  return (items || []).filter((item) => includesIgnoreCase(item[field], query))
}

export function compareByField(field, direction = 'asc') {
  const sign = direction === 'desc' ? -1 : 1
  return (a, b) => {
    if (a[field] < b[field]) return -1 * sign
    if (a[field] > b[field]) return 1 * sign
    return 0
  }
}

export function sortByField(items, field, direction = 'asc') {
  return (items || []).slice().sort(compareByField(field, direction))
}

export function mergeById(items, extraItems, key = 'id') {
  const extras = extraItems || []
  return (items || []).map((item) => ({
    ...item,
    ...extras.find((extra) => extra[key] == item[key]),
  }))
}
