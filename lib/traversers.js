import { isObject } from "./helpers"
import { leftLocValue, rightLocValue } from "./locators"

export function traverse(args, fn) {
  let { loc=[], left, rootObj, obj=rootObj } = args
  let depth = getDepth(args)
  let params, next

  args = { ...args, loc, obj }

  if (obj == false || !isObject(obj)) {
    return
  }

  if (!left) {
    next = (key) => {
      let params = rightLocValue({ rootObj, loc, key })
      return traverse({ ...args, ...params, ...depth }, fn)
    }
  }

  fn({ ...args, next })
  
  if (left) {
    params = leftLocValue({ rootObj, loc })
    traverse({ ...args, ...params, ...depth }, fn)
  }
}

export function traverseEnd(args, fn) {
  traverse(args, (args) => {
    let { next, obj } = args
    for (let key in obj) {
      next(key)
    }
    delete args.next
    fn(args)
  })
}

export function getDepth(args) {
  if (args.depth != undefined) {
    return { depth: args.depth - 1 }
  }
}
