export function matchFirstRef({ ref }) {
  return ref.match(/^[^.]+/)
}

export function matchKey(key) {
  return key.match(/^(\$.+)/)
}

export function matchValue(value) {
  if (value.constructor === String)
    return value.match(/^(\$|<<)/)
}
