import { matchOps, retrieveLoc, retrieveParentLoc } from "./locators"

export function deleteOp({ base, loc }) {
  let { key, parent } = retrieveParentLoc({ base, loc })
  delete parent[key]
}

export function dynamicOp({ base, loc }) {
  // todo: dynamic getter
}

export function mergeOp({ base, orig, loc, over, under, dest, source }) {
  let { key, parent } = retrieveParentLoc({ base, loc: dest })
  let sourceObj = retrieveLoc(orig, source)
  let baseOverSource = Object.assign({}, sourceObj, parent[key])
  Object.assign(parent[key], baseOverSource)
}

export function replaceOp({ base, loc, inKey, inValue, from, to }) {
  let { key, parent } = retrieveParentLoc({ base, loc })
  let value = parent[key]

  if (inKey) {
    delete parent[key]
    key = key.replace(from, to)
    parent[key] = value
  }

  if (inValue) {
    value = value.replace(from, to)
    parent[key] = value
  }
}
