import { readFileSync } from "fs"
import { DepGraph } from "dependency-graph"

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
    extraDeps({ deps })
    for (let loc of deps.overallOrder()) {
      let { obj, key } = getValue({ json, loc })
      if (matchValue({ json: obj, key })) {
        let refs = gatherRefs({ json: obj, key })
        obj[key] = refs.reduce((memo, ref) => {
          let val = getValue({ json, loc: ref.name })
          if (val.obj[val.key].constructor === Object) {
            return Object.assign(memo, val.obj[val.key])
          } else {
            return val.obj[val.key]
          }
        }, {})
      }
    }
  }
}

export function getValue({ json, loc }) {
  let keys = loc.split(/\./)
  return keys.reduce((memo, key, index) => {
    if (!memo[key]) {
      key = key.replace(/^\$/, "")
    }
    if (!memo[key]) {
      throw new Error(`reference not found: ${key}`)
    }
    if (keys.length == index + 1) {
      return { obj: memo, key }
    } else {
      return memo[key]
    }
  }, json)
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
        .map((ref, i) => {
          let { name, op } = ref
          let [ firstKey ] = matchFirstKey({ name })
          let mixin = mixins[firstKey]
          let parent
          if (i == 0 && op) {
            parent = `${parentLoc({ loc })}$default.${key}`
          }
          return `${parent || ""}${op || ""}${mixin || ""}${name}`
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

export function extraDeps({ deps }) {
  let nodes = Object.keys(deps.nodes)
  for (let node of nodes) {
    dependOnParent({ deps, node: node.split(/\./) })
  }
}

export function dependOnParent({ deps, node }) {
  let dep = node.slice(0, -1)
  if (dep.length) {
    deps.addNode(dep.join("."))
    deps.addDependency(dep.join("."), node.join("."))
    dependOnParent({ deps, node: dep })
  }
}

export function parentLoc({ loc }) {
  return loc.replace(/[^.]+\.$/, "")
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
