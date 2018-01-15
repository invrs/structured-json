import { matchOps } from "./matchers"
import { retrieveLoc } from "./locators"

export function checkConditions({ refs, base, orig }) {
  let pass = true
  
  if (refs) {
    pass = !refs.find(ref =>
      !retrieveLoc((base || orig), ref)
    )
  }

  return pass
}

export function gatherDefaults({ obj, matches }) {
  for (let key in obj) {
    let match = matchOps(key)
    
    if (match) {
      matches[key] = match[0]
    }
  }
}
