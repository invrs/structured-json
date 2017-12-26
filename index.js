import { readFileSync } from "fs"

export function build(path, options = {}) {
  const json = readJson(path)

  condition({ json, options })
  reference({ json, options })
  defaults({ json, options })
  
  return json
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

export function condition({ json, options }) {
  for (let key in json) {
    if (json[key] && options[key]) {
      Object.assign(json, json[key])
      delete json[key]
    } else if (json[key].constructor === Object) {
      condition({ json: json[key], options })
    }
  }
}

export function reference({ json, ctx=json }) {
  for (let key in ctx) {
    let match = ctx[key].match(/^(\$|<<)/)
    if (match) {
      ctx[key] = mergeRefs({ json, ctx, key })
    }
    if (ctx[key].constructor === Object) {
      reference({ json, ctx: ctx[key] })
    }
  }
}

export function mergeRefs({ json, ctx=json, key }) {
  if (json[key].match(/^<</)) {
    json[key] = `$default.${key} ${json[key]}`
  }

  let refs = gatherRefs({ json, ctx, key })

  if (refs.length == 1) {
    return refs[0]
  } else {
    return Object.assign(...refs)
  }
}

function gatherRefs({ json, ctx=json, key }) {
  let regex = /(<<\s*)?\$([\w\.\-]+)/g
  let match, refs = []
  
  while (match = regex.exec(json[key])) {
    let reducer = (memo, key, index) =>
      contextOrRoot({ json: memo, ctx, key, index })
    let keys = match[2].split(/\./)
    let obj = keys.reduce(reducer, json)
    refs.push(obj)
  }

  return refs
}

function contextOrRoot({ json, ctx, key, index }) {
  let mixin = `$${key}`
  let c = ctx[mixin] || ctx[key]
  let j = json[mixin] || json[key]
  return index == 0 ? c || j : j
}
