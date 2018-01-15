import { matchOps, retrieveLoc, retrieveParentLoc } from "./locators"

export function deleteOp({ base, loc }) {
  let { key, parent } = retrieveParentLoc({ base, loc })
  delete parent[key]
}

export function dynamicOp({ base, loc }) {
  // todo: dynamic getter
}

export function mergeOp({ base, over, under, dest, source }) {
  dest = retrieveLoc(base, dest)
  source = retrieveLoc(base, source)

  if (over) {
    Object.assign(dest, source)
  }
  if (under) {
    Object.assign(source, dest, source)
  }
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
