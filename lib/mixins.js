import { retrieveLoc } from "./locators"
import { matchMixinKey, MIXIN_VALUE_REGEX } from "./matchers"

export function gatherMixinLocs({ rootObj, obj, loc, mixins }) {
  for (let key in retrieveLoc(rootObj, loc)) {
    let match = matchMixinKey(key)
    if (match) {
      mixins[match[0]] = loc.concat([ match[0] ]).join(".")
    }
  }
}

export function replaceMixinValues(value, replacement) {
  return value.replace(MIXIN_VALUE_REGEX, replacement)
}
