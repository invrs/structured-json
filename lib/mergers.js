import { checkConditions } from "./defaults"
import { leftLocValue, retrieveLoc, rightLoc, rightLocValue } from "./locators"
import { matchOps } from "./matchers"
import { traverse } from "./traversers"

export function mergeDefaultMatch(args) {
  let { key, matches } = args

  let match = matches[key]
  if (!match) { return }

  let { obj, loc, orig } = args
  let { condition, depth, direction, refs } = match

  if (!condition || checkConditions({ refs, orig })) {
    let params = rightLocValue({ orig, loc, key })

    delete args.matches

    mergeDirection({
      ...args, ...params,
      depth, direction, source: rightLoc({ loc, key })
    })
  }
}

export function mergeOps({ key, orig, obj, ops }) {
  let output = {}

  for (let { depth, direction, refs: [ ref ] } of ops) {
    let value = retrieveLoc(orig, ref)
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
  let { loc, orig, direction } = args

  if (direction == ">") {
    let params = leftLocValue({ orig, loc })
    return traverse({ ...args, ...params }, mergeRight)
  }

  if (direction == "<") {
    return traverse({ ...args, left: true }, mergeLeft)
  }
}

export function mergeLeft({ loc, ops, depth, source }) {
  if (depth == 0) {
    ops.push({ op: "mergeOver", dest: loc, source })
  }
}

export function mergeRight({ loc, ops, key, depth, next, obj, source }) {
  for (let key in obj) {
    next(key)
  }

  if (depth == 0 && (!key || !matchOps(key))) {
    ops.push({ op: "mergeUnder", dest: loc, source })
  }
}
