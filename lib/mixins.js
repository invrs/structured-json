import { matchKey } from "./match"

export function gatherMixins({ json, loc, mixins }) {
  for (let key in json) {
    let match
    if (match = matchKey({ json, key })) {
      mixins[match[1]] = loc
    }
  }
}
