import { checkConditions } from "./defaults"
import { leftLocValue, retrieveLoc, rightLoc, rightLocValue } from "./locators"
import { matchOps } from "./matchers"
import { traverse } from "./traversers"

export function mergeDefaultMatch(args) {
  let { key, matches } = args

  let match = matches[key]
  if (!match) { return }

  let { rootObj, obj, loc } = args
  let { condition, depth, direction, refs } = match

  if (!condition || checkConditions({ refs, rootObj })) {
    let params = rightLocValue({ rootObj, loc, key })
    let ops = matchOps(params.obj)

    delete args.matches

    if (ops) {
      obj[key] = mergeOps({ ...args, ...params, ops })
      console.log(rootObj)
    }

    mergeDirection({
      ...args, ...params,
      depth, direction, source: rightLoc({ loc, key })
    })

    if (ops) {
      console.log(rootObj._original)
    }
  }
}

export function mergeOps({ rootObj, key, obj, ops }) {
  let output = {}

  for (let { depth, direction, refs: [ ref ] } of ops) {
    let value = retrieveLoc(rootObj._original, ref)
    if (depth == 0.5) {
      output = value
    } else if (direction == ">") {
      throw new Error(">> in values not supported (yet)")
    } else {
      Object.assign(output, value)
    }
  }

  return output
}

export function mergeDirection(args) {
  let { rootObj, loc, direction } = args

  if (direction == ">") {
    let params = leftLocValue({ rootObj, loc })
    return traverse({ ...args, ...params }, mergeRight)
  }

  if (direction == "<") {
    return traverse({ ...args, left: true }, mergeLeft)
  }
}

export function mergeLeft({ rootObj, loc, depth, source }) {
  if (depth == 0) {
    rootObj._ops = rootObj._ops.concat([
      { op: "mergeOver", dest: loc, source }
    ])
  }
}

export function mergeRight({ rootObj, loc, key, depth, next, obj, source }) {
  for (let key in obj) {
    next(key)
  }

  if (depth == 0 && (!key || !matchOps(key))) {
    rootObj._ops = rootObj._ops.concat([
      { op: "mergeUnder", dest: loc, source }
    ])
  }
}
