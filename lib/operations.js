import { matchOps, retrieveLoc, retrieveParentLoc } from "./locators"

export function deleteOp({ rootObj, loc }) {
  let { key, parent } = retrieveParentLoc(rootObj, loc)
  delete parent[key]
}

export function dynamicOp({ rootObj, loc }) {
  // todo: dynamic getter
}

export function mergeOp({ rootObj, over, under, dest, source }) {
  dest = retrieveLoc(rootObj, dest)
  source = retrieveLoc(rootObj, source)

  if (over) {
    Object.assign(dest, source)
  }
  if (under) {
    Object.assign(source, dest, source)
  }
}

export function replaceOp({ rootObj, loc, inKey, inValue, from, to }) {
  let { key, parent } = retrieveParentLoc(rootObj, loc)
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
