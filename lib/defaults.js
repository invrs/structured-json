import { retrieveLoc } from "./locators"

export function checkConditions({ refs, base }) {
  let pass = true

  if (refs) {
    pass = !refs.find(ref => !retrieveLoc(base, ref))
  }

  return pass
}
