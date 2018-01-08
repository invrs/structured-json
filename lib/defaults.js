import { retrieveLoc } from "./locators"

export function mergeDefaultsLeft({ rootObj, obj, loc }) {
  let parent = retrieveLoc(rootObj, loc.slice(0, -1))
  Object.assign(parent, obj)
  delete parent[loc[loc.length-1]]
}

export function mergeDefaultsRight({ rootObj, obj, loc }) {
  let parent = retrieveLoc(rootObj, loc.slice(0, -1))
  for (let key in parent) {
    if (parent[key].constructor === Object) {
      Object.assign(parent[key], obj, parent[key])
    }
  }
  delete parent[loc[loc.length-1]]
}
