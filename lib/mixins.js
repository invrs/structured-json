import { matchKey } from "./match"

export function gatherMixins({ json, ref, mixins }) {
  for (let key in json) {
    let match = matchKey(key)
    if (match) {
      mixins[match[1]] = ref
    }
  }
}
