import { matchMixinKey, matchMixins } from "./matchers"
import { rightLoc } from "./locators"

export function gatherMixins({ loc, obj, mixins }) {
  for (let key in obj) {
    let match = matchMixinKey(key)
    if (match) {
      mixins[match[0]] = loc.concat([ match[0] ]).join(".")
    }
  }
}

export function resolveMixinOp({ key, ops, loc, refs, mixins, isValue }) {
  for (let ref of refs) {
    for (let replace of matchMixins(ref)) {
      let replaceWith = mixins[replace]

      if (replaceWith && replace != replaceWith) {
        ops.push({
          op: `replace${isValue ? "Value" : "Key"}`,
          loc: rightLoc({ loc, key }),
          replace,
          replaceWith
        })
      }
    }
  }
}
