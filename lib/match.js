export function matchFirstKey({ name }) {
  return name.match(/^[^.]+/)
}

export function matchKey({ json, key }) {
  return key.match(/^(\$.+)/)
}

export function matchValue({ json, key }) {
  if (json[key].constructor === String)
    return json[key].match(/^(\$|<<)/)
}
