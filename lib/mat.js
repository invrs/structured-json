export function firstKey({ name }) {
  return name.match(/^[^.]+/)
}

export function key({ json, key }) {
  return key.match(/^(\$.+)/)
}

export function value({ json, key }) {
  if (json[key].constructor === String)
    return json[key].match(/^(\$|<<)/)
}
