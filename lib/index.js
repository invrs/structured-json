import { gatherDefaults } from "./defaults"
import { rightLoc } from "./locators"
import { matchOps, matchMixinKey, matchMixins } from "./matchers"
import { mergeDefaultMatch } from "./mergers"
import { gatherMixins } from "./mixins"
import { deleteOp, dynamicOp, mergeOp, replaceOp } from "./operations"
import { traverse, traverseFromEnd } from "./traversers"

export function build(...objects) {
  let json = JSON.stringify(Object.assign({}, ...objects))
  let base = JSON.parse(json)
  let orig = JSON.parse(json)
  let ops = []

  let oop = [
    defineHiddenProps,
    resolveMixins,
    operateOnBoth,
    deleteDefaults,
    deleteMixins,
    mergeDefaults,
    markDynamics,
    operateOnBase,
  ]

  for (let fn of oop) {
    fn({ base, obj: orig, orig, ops, json })
  }

  return base
}

export function defineHiddenProps({ base, ops, orig, json }) {
  Object.defineProperty(base, "_ops", {
    value: ops,
  })
  Object.defineProperty(base, "_original", {
    value: orig,
  })
}

export function deleteMixins(args) {
  return traverse(args, deleteMixin)
}

export function deleteMixin({ ops, obj, loc, next }) {
  for (let key in obj) {
    if (matchMixinKey(key)) {
      ops.push({
        op: "delete",
        loc: rightLoc({ loc, key }),
      })
    }
    next(key)
  }
}

export function resolveMixins(args) {
  return traverse({ ...args, mixins: {} }, resolveMixin)
}

export function resolveMixin({ loc, ops, obj, next, mixins }) {
  gatherMixins({ loc, obj, mixins })

  for (let key in obj) {
    let keyMatch = matchOps(key)
    let valueMatch = matchOps(obj[key])

    if (keyMatch) {
      for (let { refs } of keyMatch) {
        resolveMixinOp({ key, ops, loc, refs, mixins })
      }
    }
    if (valueMatch) {
      for (let { refs } of valueMatch) {
        resolveMixinOp({ key, ops, value: true, loc, refs, mixins })
      }
    }
    next(key)
  }
}

export function resolveMixinOp({ key, ops, value, loc, refs, mixins }) {
  for (let ref of refs) {
    for (let mixin of matchMixins(ref)) {
      let to = mixins[mixin]

      if (mixin != to) {
        ops.push({
          op: `replaceIn${value ? "Value" : "Key"}`,
          loc: rightLoc({ loc, key }),
          from: mixin,
          to
        })
      }
    }
  }
}

export function mergeDefaults(args) {
  return traverseFromEnd({ ...args, matches: {} }, mergeDefault)
}

export function mergeDefault(args) {
  let { obj, matches } = args

  gatherDefaults({ obj, matches })

  for (let key in obj) {
    mergeDefaultMatch({ ...args, key })
  }
}

export function deleteDefaults(args) {
  return traverse(args, deleteDefault)
}

export function deleteDefault({ ops, obj, loc, next }) {
  for (let key in obj) {
    if (matchOps(key)) {
      ops.push({
        op: "delete", loc: rightLoc({ loc, key })
      })
    }
    next(key)
  }
}

export function markDynamics(args) {
  return traverse(args, markDynamic)
}

export function markDynamic({ ops, loc, obj, next }) {
  for (let key in obj) {
    let matches = matchOps(obj[key])
    if (matches) {
      ops.push({
        op: "isDynamic",
        loc: rightLoc({ loc, key }),
        matches
      })
    }
    next(key)
  }
}

export function operate({ base, orig, ops }) {
  let operation
  let operations = {
    delete:         [ deleteOp ],
    isDynamic:      [ dynamicOp ],
    mergeOver:      [ mergeOp,   { over: true } ],
    mergeUnder:     [ mergeOp,   { under: true } ],
    replaceInKey:   [ replaceOp, { inKey: true } ],
    replaceInValue: [ replaceOp, { inValue: true } ]
  }

  while (operation = ops.shift()) {
    let { op, ...data } = operation
    let [ fn, extra ] = operations[op]
    fn({ base: (base || orig), orig, ...data, ...extra })
  }
}

export function operateOnBase({ base, orig, ops }) {
  operate({ base, orig, ops })
}

export function operateOnBoth({ base, orig, ops }) {
  operate({ base, orig, ops: ops.concat([]) })
  operate({ orig, ops })
}
