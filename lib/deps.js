import { matchValue } from "./match"
import { gatherRefs } from "./refs"

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
