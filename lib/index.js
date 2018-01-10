import { checkConditions, gatherDefaults } from "./defaults"
import { rightLoc, rightLocValue } from "./locators"
import { matchMixinKey, matchMixinValue } from "./matchers"
import { mergeDirection } from "./mergers"
import { gatherMixins } from "./mixins"
import { traverse, traverseEnd } from "./traversers"

export function build(...objects) {
  let json = JSON.stringify(Object.assign({}, ...objects))
  let rootObj = JSON.parse(json)
  let mixins = {}

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

export function deleteMixins(args) {
  return traverse(args, deleteMixin)
}

export function deleteMixin({ rootObj, obj, loc, next }) {
  for (let key in obj) {
    if (matchMixinKey(key)) {
      rootObj._ops = rootObj._ops.concat([{
        op: "delete", loc: rightLoc({ loc, key })
      }])
    }
    next(key)
  }
}

export function resolveMixins(args) {
  return traverse({ ...args, mixins: {} }, resolveMixin)
}

export function resolveMixin({ rootObj, loc, obj, next, mixins }) {
  gatherMixins({ loc, obj, mixins })

  for (let key in obj) {
    let matches = matchMixinValue(key, obj[key])
    if (matches) {
      for (let mixin of matches) {
        rootObj._ops = rootObj._ops.concat([{
          op: "resolve",
          loc: rightLoc({ loc, key }),
          from: mixin,
          to: mixins[mixin]
        }])
      }
    }
    next(key)
  }
}

export function mergeDefaults(args) {
  return traverseEnd({ ...args, matches: {} }, mergeDefault)
}

export function mergeDefault(args) {
  let { rootObj, loc, obj, matches } = args

  gatherDefaults({ obj, matches })
  
  for (let key in obj) {
    if (!matches[key]) {
      continue
    }

    let { conditions, depth, direction } = matches[key]

    let source = obj[key]
    delete obj[key]

    if (!checkConditions({ conditions, rootObj })) {
      return
    }

    let params = rightLocValue({ rootObj, loc, key })
    delete args.matches

    mergeDirection({
      ...args, ...params,
      depth, direction, source
    })
  }
}

export function assignAccessors({ path, value }) {

}
