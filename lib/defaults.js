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
