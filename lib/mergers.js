import { checkConditions } from "./defaults"
import {
  leftLocValue,
  retrieveLoc,
  rightLoc,
  rightLocValue,
} from "./locators"
import { matchMixinKey, matchOps } from "./matchers"
import { traverse } from "./traversers"

export function mergeDefaultMatch(args) {
  let { key, ops } = args

  let match = matchOps(key)
  if (!match) {
    return
  }

  let { obj, loc, base, orig } = args
  let { condition, depth, direction, refs } = match[0]

  if (!condition || checkConditions({ refs, base: orig })) {
    let params = rightLocValue({ base, loc, key })
    let source = rightLoc({ loc, key })

    mergeDirection({
      ...args,
      ...params,
      depth,
      direction,
      source,
    })

    ops.push({ op: "delete", loc: source })
  }
}

export function mergeDirection(args) {
  let { loc, base, direction } = args

  if (direction == ">") {
    let params = leftLocValue({ base, loc })
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

export function mergeRight({
  loc,
  ops,
  key,
  depth,
  next,
  obj,
  source,
}) {
  for (let key in obj) {
    next(key)
  }

  if (
    depth == 0 &&
    (!key || (!matchOps(key) && !matchMixinKey(key)))
  ) {
    ops.push({ op: "mergeUnder", dest: loc, source })
  }
}
