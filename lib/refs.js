import { matchFirstKey, matchValue } from "./match"

export function assignRefs({ deps, json }) {
  for (let loc of deps.overallOrder()) {
    let { obj, key } = getValue({ json, loc })
    if (matchValue({ json: obj, key })) {
      let refs = gatherRefs({ json: obj, key })
      obj[key] = refs.reduce((memo, ref) => {
        let { value } = getValue({ json, loc: ref.name })
        if (value.constructor === Object) {
          return Object.assign(memo, value)
        } else {
          return value
        }
      }, {})
    }
  }
}

export function gatherRefs({ json, key }) {
  let regex = /(<<)?\s*(\$[\w\.\-\$]+)/g
  let match, refs = []
  
  while (match = regex.exec(json[key])) {
    refs.push({ op: match[1], name: match[2] })
  }

  return refs
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

export function parentLoc({ loc }) {
  return loc.replace(/[^.]+\.$/, "")
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
      return { obj: memo, key, value: memo[key] }
    } else {
      return memo[key]
    }
  }, json)
}
