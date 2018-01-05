import { readFileSync } from "fs"
import { DepGraph } from "dependency-graph"

import { buildDeps, extraDeps } from "./deps"
import { matchKey } from "./match"
import { gatherMixins } from "./mixins"
import { assignRefs, resolveRefs } from "./refs"

export function build(path, options = {}) {
  const json = JSON.parse(readFileSync(path, "utf8"))

  condition({ json, options })
  defaults({ json })
  refs({ json })
  clean({ json })
  
  return json
}

/** Merges matching condition mixins with parent object. */
export function condition({ json, options={} }) {
  for (let key in json) {
    if (json[key].constructor === Object) {
      if (options[key.replace(/^\$/, "")]) {
        Object.assign(json, json[key])
      }
      condition({ json: json[key], options })
    }
  }
}

/** Merges default mixin with sibling objects. */
export function defaults({ json }) {
  let defs = json["$default"]

  for (let key in json) {
    if (json[key].constructor === Object) {
      if (defs) {
        json[key] = Object.assign(
          {}, json[key], defs, json[key]
        )
      }
      defaults({ json: json[key] })
    }
  }
}

/** Resolves and assigns references. */
export function refs({ json, ref, deps=new DepGraph(), mixins={} }) {
  gatherMixins({ json, mixins, ref })
  resolveRefs({ json, mixins, ref })
  buildDeps({ json, deps, ref })

  for (let key in json) {
    if (json[key].constructor === Object) {
      refs({
        deps,
        json: json[key],
        ref: `${ref || "$"}${key}.`,
        mixins: Object.assign({}, mixins)
      })
    }
  }

  if (!ref) {
    extraDeps({ deps })
    assignRefs({ deps, json })
  }
}

/** Removes mixins from final object. */
export function clean({ json }) {
  for (let key in json) {
    if (matchKey({ json, key })) {
      delete json[key]
    } else if (json[key].constructor === Object) {
      clean({ json: json[key] })
    }
  }
}
