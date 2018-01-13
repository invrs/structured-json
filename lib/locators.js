export function leftLoc(loc) {
  return loc.slice(0, -1)
}

export function rightLoc({ loc, key }) {
  return loc.concat([ key ])
}

export function leftLocValue({ rootObj, loc }) {
  if (loc.length == 0) {
    return { obj: false }
  }
  loc = leftLoc(loc)
  let obj = retrieveLoc(rootObj, loc)
  return { key: loc[loc.length-1], loc, obj }
}

export function rightLocValue({ rootObj, loc, key }) {
  loc = rightLoc({ loc, key })
  let obj = retrieveLoc(rootObj, loc)
  return { key, loc, obj }
}

export function retrieveLoc(obj, loc) {
  if (loc.constructor === String) {
    loc = loc.split(/\./)
  }
  return loc.reduce(
    (memo, item) => { return memo[item] },
    obj
  )
}

export function retrieveParentLoc(obj, loc, original) {
  let key = loc[loc.length - 1]
  let parent = loc.slice(0, -1)
  obj = original ? obj._original : obj
  return { key, parent: retrieveLoc(obj, parent) }
}

export function retrieveOgParentLoc(rootObj, loc) {
  return retrieveParentLoc(rootObj, loc, true)
}
