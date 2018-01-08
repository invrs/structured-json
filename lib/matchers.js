export const DEFAULT_KEY_REGEX = /^([\<\>]{2})(\??)(.*)/
export const MIXIN_KEY_REGEX = /^\$[\w\.\-]+/
export const MIXIN_VALUE_REGEX = /\$[\w\.\-]+/g

export function matchDefaultKey(key) {
  let match = key.match(DEFAULT_KEY_REGEX)
  let direction = match ? match[1] : undefined
  
  if (match && match[2] && match[3]) {
    let conditions = match[3]
      .split(/\s+/)
      .filter(str => str != "")
    return { conditions, direction }
  } else if (match) {
    return { direction }
  }
}

export function matchMixinKey(key) {
  return key.match(MIXIN_KEY_REGEX)
}
