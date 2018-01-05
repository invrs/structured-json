export function matchFirstKey({ ref }) {
  return ref.match(/^[^.]+/)
}

export function matchKey({ json, key }) {
  return key.match(/^(\$.+)/)
}

export function matchValue({ json, key }) {
  if (json[key].constructor === String)
    return json[key].match(/^(\$|<<)/)
}
