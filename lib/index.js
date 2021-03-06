import { retrieveLoc, rightLoc } from "./locators"
import { matchOps, matchMixinKey } from "./matchers"
import { mergeDefaultMatch } from "./mergers"
import { gatherMixins, resolveMixinOp } from "./mixins"
import { operateOnBase, operateOnBoth } from "./operations"
import { run, runUntilNoOps } from "./runners"
import { traverse, traverseFromEnd } from "./traversers"

export function build(...objects) {
  let json = JSON.stringify(Object.assign({}, ...objects))
  let base = JSON.parse(json)
  let orig = JSON.parse(json)
  let ops = []

  run({
    base,
    orig,
    ops,
    oop: [
      resolveMixins,
      operateOnBoth,

      resolveDefaults,
      operateOnBoth,
    ],
  })

  runUntilNoOps({
    base,
    orig,
    ops,
    oop: [mergeDefaults, operateOnBase],
  })

  run({
    base,
    orig,
    ops,
    oop: [
      deleteDynamicKeys,
      markDynamicValues,
      operateOnBase,
    ],
  })

  return base
}

export function resolveMixins(args) {
  return traverse({ ...args, mixins: {} }, resolveMixin)
}

export function resolveMixin({
  loc,
  ops,
  obj,
  next,
  mixins,
}) {
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
        resolveMixinOp({
          key,
          ops,
          loc,
          refs,
          mixins,
          isValue: true,
        })
      }
    }

    next(key)
  }

  return ops
}

export function resolveDefaults(args) {
  return traverse(args, resolveDefault)
}

export function resolveDefault({
  loc,
  ops,
  obj,
  orig,
  next,
}) {
  for (let key in obj) {
    let valueMatch = matchOps(obj[key])

    if (valueMatch && matchOps(key)) {
      let { refs: [ref] } = valueMatch[0]
      ops.push({
        op: `replaceValue`,
        loc: rightLoc({ loc, key }),
        replaceWith: retrieveLoc(orig, ref),
      })
    }

    next(key)
  }

  return ops
}

export function deleteDynamicKeys(args) {
  return traverseFromEnd(args, deleteDynamicKey)
}

export function deleteDynamicKey({ ops, obj, loc, next }) {
  for (let key in obj) {
    if (matchMixinKey(key) || matchOps(key)) {
      ops.push({
        op: "delete",
        loc: rightLoc({ loc, key }),
      })
    }
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

export function markDynamicValues(args) {
  return traverse(args, markDynamicValue)
}

export function markDynamicValue({ ops, loc, obj, next }) {
  for (let key in obj) {
    let matches = matchOps(obj[key])

    if (matches) {
      ops.push({
        op: "isDynamic",
        loc: rightLoc({ loc, key }),
        matches,
      })
    }

    next(key)
  }

  return ops
}
