export const ASSIGN_VALUE_REGEX = /^\s*\<\=/
export const DEFAULT_KEY_REGEX = /^([\<\>\s]{2,})(\??)(.*)/
export const MIXIN_KEY_REGEX = /^\$[\w\.\-]+/
export const MIXIN_VALUE_REGEX = /\$[\w\.\-]+/g

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

export function matchMixinKey(key) {
  return key.match(MIXIN_KEY_REGEX)
}

export function matchMixinValue(key, value) {
  if (value.constructor !== String) {
    return
  }

  let match = value.match(ASSIGN_VALUE_REGEX) ||
    matchDefaultKey(key)

  if (match) {
    return value.match(MIXIN_VALUE_REGEX)
  }
}
