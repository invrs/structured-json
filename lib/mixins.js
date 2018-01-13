import { matchMixinKey } from "./matchers"

export function gatherMixins({ loc, obj, mixins }) {
  for (let key in obj) {
    let match = matchMixinKey(key)
    if (match) {
      mixins[match[0]] = loc.concat([ match[0] ]).join(".")
    }
  }
}
