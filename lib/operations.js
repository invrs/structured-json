import { isObject } from "./helpers"
import { retrieveLoc, retrieveParentLoc } from "./locators"
import { matchOps } from "./matchers"

export function deleteOp({ base, loc }) {
  let { key, parent } = retrieveParentLoc({ base, loc })
  delete parent[key]
}

export function dynamicOp({ base, loc, orig, matches }) {
  let { key, parent } = retrieveParentLoc({ base, loc })
  Object.defineProperty(parent, key, {
    get() {
      return  matches.slice().reverse().reduce(
        (memo, { depth, refs: [ ref ] }) => {
          let source = ref.indexOf("$") > -1 ? orig : base
          let value = retrieveLoc(source, ref)
          if (isObject(value)) {
            return Object.assign(memo, value)
          } else {
            return value
          }
        },
        {}
      )
    }
  })
}

export function mergeOp({ base, orig, loc, over, under, dest, source }) {
  let { key, parent } = retrieveParentLoc({ base, loc: dest })
  let sourceObj = retrieveLoc(orig, source)
  let baseOverSource = Object.assign({}, sourceObj, parent[key])
  Object.assign(parent[key], baseOverSource)
}

export function replaceOp({ base, loc, inKey, inValue, replace, replaceWith }) {
  let { key, parent } = retrieveParentLoc({ base, loc })
  let value = parent[key]

  if (inKey) {
    delete parent[key]
    if (replace) {
      key = key.replace(replace, replaceWith)
    } else {
      key = replaceWith
    }
    parent[key] = value
  }

  if (inValue) {
    if (replace) {
      value = value.replace(replace, replaceWith)
    } else {
      value = replaceWith
    }
    parent[key] = value
  }
}
