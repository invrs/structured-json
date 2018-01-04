import * as mat from "./mat"

export function gather({ json, loc, mixins }) {
  for (let key in json) {
    let match
    if (match = mat.key({ json, key })) {
      mixins[match[1]] = loc
    }
  }
}
