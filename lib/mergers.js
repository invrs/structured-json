import { leftLocValue } from "./locators"
import { matchOps } from "./matchers"
import { traverse } from "./traversers"

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
