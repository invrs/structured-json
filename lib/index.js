import { checkConditions, gatherDefaults } from "./defaults"
import { rightLoc, rightLocValue } from "./locators"
import { matchDynamicKey, matchDynamicValue, matchMixinKey } from "./matchers"
import { mergeDirection } from "./mergers"
import { gatherMixins } from "./mixins"
import { deleteOp, dynamicOp, mergeOp, replaceOp } from "./operations"
import { traverse, traverseFromEnd } from "./traversers"

export function build(...objects) {
  let json = JSON.stringify(Object.assign({}, ...objects))
  let rootObj = JSON.parse(json)

  defineHiddenProps({ rootObj, json })

  let oop = [
    resolveMixins,
    operate,
    deleteMixins,
    mergeDefaults,
    deleteDefaults,
    markDynamics,
    operate
  ]

  for (let fn of oop) {
    fn({ rootObj, obj: rootObj._original })
  }

  return rootObj
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
    let keyMatch = matchDynamicKey(key)
    let valueMatch = matchDynamicValue(key, obj[key])

    if (keyMatch) {
      for (let mixin of keyMatch) {
        resolveMixinOp({ rootObj, key, loc, mixin, mixins })
      }
    }
    if (valueMatch) {
      for (let mixin of valueMatch) {
        resolveMixinOp({ rootObj, key, value: true, loc, mixin, mixins })
      }
    }
    next(key)
  }
}

export function resolveMixinOp({ rootObj, key, value, loc, mixin, mixins }) {
  let from = mixin
  let to = mixins[mixin]

  if (from != to) {
    rootObj._ops = rootObj._ops.concat([{
      op: `replaceIn${value ? "Value" : "Key"}`,
      loc: rightLoc({ loc, key }),
      from: mixin,
      to: mixins[mixin]
    }])
  }
}

export function mergeDefaults(args) {
  return traverseFromEnd({ ...args, matches: {} }, mergeDefault)
}

export function mergeDefault(args) {
  let { rootObj, loc, obj, matches } = args

  gatherDefaults({ obj, matches })
  
  for (let key in obj) {
    if (!matches[key]) {
      continue
    }

    let { conditions, depth, direction } = matches[key]

    if (!checkConditions({ conditions, rootObj })) {
      continue
    }

    let params = rightLocValue({ rootObj, loc, key })
    delete args.matches

    mergeDirection({
      ...args, ...params,
      depth, direction, source: rightLoc({ loc, key })
    })
  }
}

export function deleteDefaults(args) {
  return traverse(args, deleteDefault)
}

export function deleteDefault({ rootObj, obj, loc, next }) {
  for (let key in obj) {
    if (matchDynamicKey(key)) {
      rootObj._ops = rootObj._ops.concat([{
        op: "delete", loc: rightLoc({ loc, key })
      }])
    }
    next(key)
  }
}

export function markDynamics(args) {
  return traverse(args, markDynamic)
}

export function markDynamic({ rootObj, loc, obj, next }) {
  for (let key in obj) {
    if (matchDynamicValue(key, obj[key])) {
      rootObj._ops = rootObj._ops.concat([{
        op: "isDynamic",
        loc: rightLoc({ loc, key })
      }])
    }
    next(key)
  }
}

export function operate({ rootObj }) {
  let { _original: original, _ops: ops } = rootObj

  let operations = {
    delete:         [ deleteOp ],
    isDynamic:      [ dynamicOp ],
    mergeOver:      [ mergeOp,   { over: true } ],
    mergeUnder:     [ mergeOp,   { under: true } ],
    replaceInKey:   [ replaceOp, { inKey: true } ],
    replaceInValue: [ replaceOp, { inValue: true } ]
  }

  for (let operation of ops) {
    let { op, executed, ...data } = operation
    if (!executed) {
      let [ fn, extra ] = operations[op]
      fn({ rootObj, ...data, ...extra })
      operation.executed = true
    }
  }
}
