import { isObject } from "./helpers"
import { leftLocValue, rightLocValue } from "./locators"

export function traverse(args, fn) {
  let { depth, loc=[], left, base, obj=base } = args
  let next

  args = { ...args, loc, obj }

  if (depth != undefined && depth < 0) { return }
  if (obj == false || !isObject(obj)) { return }

  if (!left) {
    next = (key) => {
      let params = rightLocValue({ base, loc, key })
      traverse({ ...args, ...params, depth: depth - 1 }, fn)
    }
  }

  let output = fn({ ...args, next })
  
  if (left) {
    let params = leftLocValue({ base, loc })
    traverse({ ...args, ...params, depth: depth - 1 }, fn)
  }

  return output
}

export function traverseFromEnd(args, fn) {
  return traverse(args, (args) => {
    let { next, obj } = args
    for (let key in obj) {
      next(key)
    }
    delete args.next
    return fn(args)
  })
}
