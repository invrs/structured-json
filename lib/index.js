import { readFileSync } from "fs"
import { DepGraph } from "dependency-graph"

import * as dep from "./dep"
import * as mat from "./mat"
import * as mix from "./mix"
import * as ref from "./ref"

export function build(path, options = {}) {
  const json = JSON.parse(readFileSync(path, "utf8"))

  condition({ json, options })
  defaults({ json })
  reference({ json })
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
export function reference({ json, loc, deps=new DepGraph(), mixins={} }) {
  mix.gather({ json, mixins, loc })
  ref.resolve({ json, mixins, loc })
  dep.build({ json, deps, loc })

  for (let key in json) {
    if (json[key].constructor === Object) {
      reference({
        deps,
        json: json[key],
        loc: `${loc || "$"}${key}.`,
        mixins: Object.assign({}, mixins)
      })
    }
  }

  if (!loc) {
    dep.extra({ deps })
    ref.assign({ deps, json })
  }
}

/** Removes mixins from final object. */
export function clean({ json }) {
  for (let key in json) {
    if (mat.key({ json, key })) {
      delete json[key]
    } else if (json[key].constructor === Object) {
      clean({ json: json[key] })
    }
  }
}
