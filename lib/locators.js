export function retrieveLoc(rootObj, loc) {
  return loc.reduce(
    (memo, item) => { return memo[item] },
    rootObj._original
  )
}
