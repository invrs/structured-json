import { isObject } from "./helpers"
import { leftLocValue, rightLocValue } from "./locators"

export function traverse(args, fn) {
  let { depth, loc=[], left, orig, obj=orig } = args
  let next

  args = { ...args, loc, obj }

  if (depth != undefined && depth < 0) { return }
  if (obj == false || !isObject(obj)) { return }

  if (!left) {
    next = (key) => {
      let params = rightLocValue({ orig, loc, key })
      traverse({ ...args, ...params, depth: depth - 1 }, fn)
    }
  }

  fn({ ...args, next })
  
  if (left) {
    let params = leftLocValue({ orig, loc })
    traverse({ ...args, ...params, depth: depth - 1 }, fn)
  }
}

export function traverseFromEnd(args, fn) {
  traverse(args, (args) => {
    let { next, obj } = args
    for (let key in obj) {
      next(key)
    }
    delete args.next
    fn(args)
  })
}
