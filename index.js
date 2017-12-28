import { readFileSync } from "fs"
import { DepGraph } from "dependency-graph"

export function build(path, options = {}) {
  const json = readJson(path)

  condition({ json, options })
  reference({ json, options })
  // defaults({ json, options })
  // reference({ json, options })
  // clean({ json, options })
  
  return json
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

export function condition({ json, options={} }) {
  for (let key in json) {
    let mixin = `$${key}`
    if (json[mixin] && options[key]) {
      Object.assign(json, json[mixin])
    }
    if (json[key].constructor === Object) {
      condition({ json: json[key], options })
    }
  }
}

export function reference({ json, loc, deps=new DepGraph(), mixins={} }) {
  gatherMixins({ json, mixins, loc })
  resolveRefs({ json, mixins, loc })
  buildDeps({ json, deps, loc })

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
    let nodes = Object.keys(deps.nodes)
    for (let node of nodes) {
      for (let dep of deps.dependenciesOf(node)) {
        for (let n of nodes) {
          let esc = dep.replace(/([\.\$])/, "\\$1")
          let regex = new RegExp(`^${esc}\\.`)
          if (n.match(regex)) {
            deps.addDependency(node, n)
          }
        }
      }
    }
    console.log(deps.overallOrder())
  }
}

export function gatherMixins({ json, loc, mixins }) {
  for (let key in json) {
    let match
    if (match = matchKey({ json, key })) {
      mixins[match[1]] = loc
    }
  }
}

export function resolveRefs({ json, loc, mixins={} }) {
  for (let key in json) {
    if (matchValue({ json, key })) {
      json[key] = gatherRefs({ json, key })
        .map(ref => {
          let { name, op } = ref
          let [ firstKey ] = matchFirstKey({ name })
          let mixin = mixins[firstKey]
          return `${op || ""}${mixin || ""}${name}`
        })
        .join("")
    }
  }
}

export function buildDeps({ json, deps, loc }) {
  for (let key in json) {
    if (matchValue({ json, key })) {
      let refs = gatherRefs({ json, key })
      let dependant = `${loc || "$"}${key}`

      deps.addNode(dependant)
      
      for (let { name } of refs) {
        deps.addNode(name)
        deps.addDependency(dependant, name)
      }
    }
  }
}

export function matchFirstKey({ name }) {
  return name.match(/^[^.]+/)
}

export function matchKey({ json, key }) {
  return key.match(/^(\$.+)/)
}

export function matchValue({ json, key }) {
  if (json[key].constructor === String)
    return json[key].match(/^(\$|<<)/)
}

export function gatherRefs({ json, key }) {
  let regex = /(<<)?\s*(\$[\w\.\-\$]+)/g
  let match, refs = []
  
  while (match = regex.exec(json[key])) {
    refs.push({ op: match[1], name: match[2] })
  }

  return refs
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
    if (matchKey({ json, key })) {
      delete json[key]
    } else if (json[key].constructor === Object) {
      clean({ json: json[key] })
    }
  }
}
