export function retrieveLoc(obj, loc) {
  if (loc.constructor === String) {
    loc = loc.split(/\./)
  }
  return loc.reduce(
    (memo, item) => { return memo[item] },
    obj
  )
}
