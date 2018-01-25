export const ASSIGN_VALUE_REGEX = /^\s*[\<\>\=]{2,}/
export const DEFAULT_KEY_REGEX = /^([\<\>\s]{2,})(\??)(.*)/
export const DYNAMIC_REGEX = /([\<\>=\s]{2,})(\??)\s*([^\?\<\>]*)/g
export const MIXIN_REGEX = /(\.?)(\$[\w\-]+)/g
export const MIXIN_KEY_REGEX = /^\$[\w\-]+/g

export function matchOps(value) {
  if (value.constructor !== String) {
    return
  }

  let match
  let ops = []

  while ((match = DYNAMIC_REGEX.exec(value)) !== null) {
    matchOp({ match, ops })
  }

  return ops.length ? ops : undefined
}

export function matchOp({ match, ops }) {
  let [, direction, condition, refs] = match

  let depth = direction.replace(/[^\<\>]/g, "").length / 2

  condition = !!condition
  direction = direction.charAt(0)
  refs = refs.split(/\s+/).filter(r => !!r)

  ops.push({ condition, depth, direction, refs })
}

export function matchMixins(value) {
  if (value.constructor === String) {
    let match
    let mixins = []

    while ((match = MIXIN_REGEX.exec(value)) !== null) {
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
