import { matchFirstRef, matchValue } from "./match"

export function assignRefs({ deps, json }) {
  for (let ref of deps.overallOrder()) {
    let { obj, key } = getValue({ json, ref })
    if (matchValue(obj[key])) {
      let refs = gatherRefs({ json: obj, ref: key })
      obj[key] = refs.reduce((memo, { ref }) => {
        let { value } = getValue({ json, ref })
        if (value.constructor === Object) {
          return Object.assign(memo, value)
        } else {
          return value
        }
      }, {})
    }
  }
}

export function gatherRefs({ json, ref }) {
  let regex = /(<<)?\s*(\$[\w\.\-\$]+)/g
  let match, refs = []
  
  while (match = regex.exec(json[ref])) {
    refs.push({ op: match[1], ref: match[2] })
  }

  return refs
}

export function resolveRefs({ json, ref, mixins={} }) {
  for (let key in json) {
    if (matchValue(json[key])) {
      json[key] = gatherRefs({ json, ref: key })
        .map(({ ref: r, op }, i) => {
          let [ firstKey ] = matchFirstRef({ ref: r })
          let mixin = mixins[firstKey]
          let parent
          if (i == 0 && op) {
            parent = `${parentLoc({ ref })}$default.${key}`
          }
          return `${parent || ""}${op || ""}${mixin || ""}${r}`
        })
        .join("")
    }
  }
}

export function parentLoc({ ref }) {
  return ref.replace(/[^.]+\.$/, "")
}

export function getValue({ json, ref }) {
  let keys = ref.split(/\./)
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
