import { checkConditions, mergeDirection } from "./defaults"
import { retrieveLoc } from "./locators"
import { matchDefaultKey, matchMixinKey, matchMixinValue } from "./matchers"
import { gatherMixinLocs, replaceMixinValues } from "./mixins"

export function build(...objects) {
  let json = JSON.stringify(Object.assign({}, ...objects))
  let rootObj = JSON.parse(json)

  defineHiddenProps({ rootObj, json })
  deleteMixins({ rootObj })
  resolveMixins({ rootObj })
  mergeDefaults({ rootObj })
  assignAccessors({ rootObj })

  return rootObj
}

export function update(rootObj, updates) {

}

export function defineHiddenProps({ rootObj, json }) {
  Object.defineProperty(rootObj, "_ops", {
    writable: true,
    value: [],
  })
  Object.defineProperty(rootObj, "_original", {
    value: JSON.parse(json)
  })
}

export function iterator(fn, { rootObj, loc=[] }) {
  let params = { rootObj, loc }
  return {
    run: ({ key, obj, ...data }) => {
      return fn({
        ...data, ...params,
        obj, key, value: obj[key]
      })
    },
    recurse: (fn, { key, obj, ...data }) => {
      if (obj[key] && obj[key].constructor === Object) {
        return fn({
          ...data, ...params,
          obj: obj[key],
          loc: loc.concat([ key ])
        })
      }
    }
  }
}

export function resolveMixins({ rootObj, obj=rootObj, loc, mixins={} }) {
  let { run, recurse } =
    iterator(resolveMixin, { rootObj, loc })

  for (let key in obj) {
    run({ key, obj, mixins })
    recurse(resolveMixins, { key, obj, mixins })
  }
}

export function resolveMixin({ rootObj, obj, loc, key, value, mixins }) {
  gatherMixinLocs({ rootObj, obj, loc, mixins })

  let matches = matchMixinValue(key, value)
  if (!matches) { return }

  for (let mixin of matches) {
    rootObj._ops = rootObj._ops.concat([{
      op: "resolve",
      loc: loc.concat([ key ]),
      from: mixin,
      to: mixins[mixin]
    }])
  }
}

export function deleteMixins({ rootObj, obj=rootObj, loc }) {
  let { run, recurse } =
    iterator(deleteMixin, { rootObj, loc })

  for (let key in obj) {
    run({ key, obj })
    recurse(deleteMixins, { key, obj })
  }
}

export function deleteMixin({ key, rootObj, loc }) {
  if (!matchMixinKey(key)) { return }

  rootObj._ops = rootObj._ops.concat([{
    op: "delete",
    loc: loc.concat([ key ])
  }])
}

export function mergeDefaults({ rootObj, obj=rootObj, loc=[], matches={} }) {
  let { run, recurse } =
    iterator(mergeDefault, { rootObj, loc })

  for (let key in obj) {
    run({ key, obj, matches })
    recurse(mergeDefaults, { key, obj, matches })
  }
  
  for (let key in matches) {
    let { conditions, depth, direction, value } = matches[key]

    if (checkConditions({ conditions, rootObj })) {
      mergeDirection({
        depth,
        direction,
        rootObj,
        obj: value,
        loc: loc.concat([ key ])
      })
    }
  }
}

export function mergeDefault({ rootObj, key, obj, matches, value }) {
  let match = matchDefaultKey(key)

  if (match) {
    matches[key] = Object.assign(match, { value })
    delete obj[key]
  }
}

export function assignAccessors({ path, value }) {

}
