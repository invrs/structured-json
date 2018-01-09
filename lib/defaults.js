import { retrieveLoc } from "./locators"
import { matchDefaultKey } from "./matchers"

export function checkConditions({ conditions, rootObj }) {
  let pass = true
  
  if (conditions) {
    pass = !conditions.find(condition =>
      !retrieveLoc(rootObj._original, condition)
    )
  }

  return pass
}

export function mergeDirection({ depth, direction, rootObj, obj, loc }) {
  let parent = retrieveLoc(rootObj, loc.slice(0, -1))
  let fn = direction == "<" ? mergeLeft : mergeRight
  fn({ depth, rootObj: parent, obj, loc })
}

export function mergeLeft({ depth, rootObj, obj, loc }) {
  for (let key in rootObj) {
    if (depth <= 1) {
      Object.assign(rootObj, obj)
    } else {
      let newLoc = loc.slice(0, -1)
      let parent = retrieveLoc(rootObj, newLoc)
      mergeLeft({
        depth: depth - 1,
        rootObj: parent,
        obj,
        loc: newLoc
      })
    }
  }
}

export function mergeRight({ depth, rootObj, obj, loc }) {
  for (let key in rootObj) {
    if (rootObj[key].constructor !== Object || matchDefaultKey(key)) {
      continue
    }
    if (depth > 1) {
      mergeRight({
        depth: depth - 1,
        rootObj: rootObj[key],
        obj,
        loc: loc.concat([ key ])
      })
    } else {
      Object.assign(rootObj[key], obj, rootObj[key])
    }
  }
}
