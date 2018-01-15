export const ASSIGN_VALUE_REGEX = /^\s*[\<\>\=]{2,}/
export const DEFAULT_KEY_REGEX = /^([\<\>\s]{2,})(\??)(.*)/
export const DYNAMIC_REGEX = /([\<\>=\s]{2,})(\??)\s*([^\?\<\>]*)/g
export const MIXIN_REGEX = /(\.?)(\$[\w\-]+)/g
export const MIXIN_KEY_REGEX = /^\$[\w\-]+/g
export const REL_MIXIN_REGEX = /(\.?)(\$[\w\-]+)/g

export function matchOps(value) {
  if (value.constructor !== String) { return }

  let match
  let ops = []

  while ((match = DYNAMIC_REGEX.exec(value)) !== null) {
    let [ , direction, condition, refs ] = match

    let depth = direction.replace(/[^\<\>]/g, "").length / 2

    condition = !!condition
    direction = direction.charAt(0)
    refs = refs.split(/\s+/)
    
    ops.push({ condition, depth, direction, refs })
  }
  
  return ops.length ? ops : undefined
}

export function matchRelMixins(value) {
  return matchMixins(value, true)
}

export function matchMixins(value, rel) {
  if (value.constructor === String) {
    let match
    let mixins = []
    let regex = rel ? REL_MIXIN_REGEX : MIXIN_REGEX

    while ((match = regex.exec(value)) !== null) {
      if (!match[1]) {
        mixins.push(match[2])
      }
    }

    return mixins
  }
}

export function matchMixinKey(key) {
  if (key.constructor === String) {
    return key.match(MIXIN_KEY_REGEX)
  }
}
