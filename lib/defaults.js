import { matchDefaultKey } from "./matchers"
import { retrieveLoc } from "./locators"

export function checkConditions({ conditions, rootObj }) {
  let pass = true
  
  if (conditions) {
    pass = !conditions.find(condition =>
      !retrieveLoc(rootObj, condition)
    )
  }

  return pass
}

export function gatherDefaults({ obj, matches }) {
  for (let key in obj) {
    let match = matchDefaultKey(key)
    
    if (match) {
      matches[key] = match
    }
  }
}
