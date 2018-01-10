import { matchMixinKey, MIXIN_VALUE_REGEX } from "./matchers"

export function gatherMixins({ loc, obj, mixins }) {
  for (let key in obj) {
    let match = matchMixinKey(key)
    if (match) {
      mixins[match[0]] = loc.concat([ match[0] ]).join(".")
    }
  }
}

export function replaceMixinValues(value, replacement) {
  return value.replace(MIXIN_VALUE_REGEX, replacement)
}
