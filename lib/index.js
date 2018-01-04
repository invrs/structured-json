import { readFileSync } from "fs"
import { DepGraph } from "dependency-graph"

import * as dep from "./dep"
import * as mat from "./mat"
import * as mix from "./mix"
import * as ref from "./ref"

export function build(path, options = {}) {
  const json = readJson(path)

  condition({ json, options })
  defaults({ json, options })
  reference({ json, options })
  clean({ json, options })
  
  return json
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

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

export function defaults({ json, options={} }) {
  let defs = json["$default"]

  for (let key in json) {
    if (json[key].constructor === Object) {
      if (defs) {
        json[key] = Object.assign(
          {}, json[key], defs, json[key]
        )
      }
      defaults({ json: json[key], options })
    }
  }
}

export function clean({ json }) {
  for (let key in json) {
    if (mat.key({ json, key })) {
      delete json[key]
    } else if (json[key].constructor === Object) {
      clean({ json: json[key] })
    }
  }
}
