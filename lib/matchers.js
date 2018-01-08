export const MIXIN_KEY_REGEX = /^\$[\w\.\-]+/
export const MIXIN_VALUE_REGEX = /\$[\w\.\-]+/g

export function matchMixinKey(key) {
  return key.match(MIXIN_KEY_REGEX)
}
