export const ASSIGN_VALUE_REGEX = /^\s*[\<\>\=]{2,}/
export const DEFAULT_KEY_REGEX = /^([\<\>\s]{2,})(\??)(.*)/
export const MIXIN_REGEX = /[^\.]\$[\w\-]+/g
export const MIXIN_KEY_REGEX = /^\$[\w\-]+/g

export function matchDefaultKey(key) {
  let match = key.match(DEFAULT_KEY_REGEX)
  let conditions, depth, direction

  if (!match) return

  if (match[1]) {
    direction = match[1].replace(/\s/, "")
    depth = direction.length / 2
    direction = direction.charAt(0)
  }

  if (match[2] && match[3]) {
    conditions = match[3]
      .split(/\s+/)
      .filter(str => str != "")
  }
  
  return { conditions, depth, direction }
}

export function matchDynamicKey(key) {
  if (key.constructor === String) {
    return key.match(DEFAULT_KEY_REGEX) ?
      (matchMixins(key) || []) :
      undefined
  }
}

export function matchDynamicValue(key, value) {
  if (value.constructor !== String) {
    return
  }

  let match = key.match(DEFAULT_KEY_REGEX) ||
    value.match(ASSIGN_VALUE_REGEX)

  return match ?
    matchMixins(value) :
    undefined
}

export function matchMixins(value) {
  if (value.constructor === String) {
    let match = value.match(MIXIN_REGEX)
    if (match) {
      return match.map(v => v.substr(1))
    }
  }
}

export function matchMixinKey(key) {
  if (key.constructor !== String) {
    return
  }

  return key.match(MIXIN_KEY_REGEX)
}
