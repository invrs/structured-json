import { retrieveLoc, rightLoc } from "./locators"
import { matchOps, matchMixinKey } from "./matchers"
import { mergeDefaultMatch } from "./mergers"
import { gatherMixins, resolveMixinOp } from "./mixins"
import { operateOnBase, operateOnBoth } from "./operations"
import { traverse, traverseFromEnd } from "./traversers"

export function build(...objects) {
  let json = JSON.stringify(Object.assign({}, ...objects))
  let base = JSON.parse(json)
  let orig = JSON.parse(json)
  let ops = []

  let oop = [
    resolveMixins,
    operateOnBoth,

    resolveDefaults,
    operateOnBoth,
    
    deleteDynamics,
    mergeDefaults,
    operateOnBase,

    markDynamics,
    operateOnBase,
  ]

  for (let fn of oop) {
    fn({ base, obj: orig, orig, ops, json })
  }

  return base
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
        resolveMixinOp({ key, ops, loc, refs, mixins, isValue: true })
      }
    }

    next(key)
  }

  return ops
}

export function resolveDefaults(args) {
  return traverse(args, resolveDefault)
}

export function resolveDefault({ loc, ops, obj, orig, next }) {
  for (let key in obj) {
    let match = matchOps(obj[key])

    if (match && matchOps(key)) {
      let { refs: [ ref ] } = match[0]
      ops.push({
        op: `replaceValue`,
        loc: rightLoc({ loc, key }),
        replaceWith: retrieveLoc(orig, ref)
      })
    }

    next(key)
  }

  return ops
}

export function deleteDynamics(args) {
  return traverse(args, deleteDynamic)
}

export function deleteDynamic({ ops, obj, loc, next }) {
  for (let key in obj) {
    if (matchMixinKey(key) || matchOps(key)) {
      ops.push({
        op: "delete",
        loc: rightLoc({ loc, key }),
      })
    }

    next(key)
  }

  return ops
}

export function mergeDefaults(args) {
  return traverseFromEnd(args, mergeDefault)
}

export function mergeDefault(args) {
  let { obj, ops } = args

  for (let key in obj) {
    mergeDefaultMatch({ ...args, key })
  }

  return ops
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

  return ops
}
