import { leftLocValue } from "./locators"
import { matchDefaultKey } from "./matchers"
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

export function mergeLeft({ loc, depth, obj, source }) {
  if (depth != 0) { return }
  Object.assign(obj, source)

}

export function mergeRight({ key, depth, next, obj, source }) {
  for (let key in obj) {
    next(key)
  }
  if (depth != 0 || (key && matchDefaultKey(key))) {
    return
  }
  Object.assign(obj, source, obj)
}
