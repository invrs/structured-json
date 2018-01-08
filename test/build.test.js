import { defineHiddenProps, resolveMixins, deleteMixins } from "../lib"

function testObj(obj) {
  defineHiddenProps({ rootObj: obj, json: JSON.stringify(obj) })
  return obj
}

test("defineHiddenProps", () => {
  let obj = testObj({})
  expect(obj._original).toEqual({})
  expect(obj._updates).toEqual([])
})

test("resolveMixins", () => {
  let obj = testObj({
    "$mixin1": {},
    "$mixin2": {},
    "test": {
      "$mixin2": {},
      "testChild": "<= $mixin1 << $mixin2"
    }
  })
  resolveMixins({ rootObj: obj })
  expect(obj).toEqual({
    "$mixin1": {},
    "$mixin2": {},
    "test": {
      "$mixin2": {},
      "testChild": "<= $mixin1 << test.$mixin2"
    }
  })
})

test("deleteMixins", () => {
  let obj = testObj({
    "$mixin1": {},
    "test": {
      "$mixin2": {}
    }
  })
  deleteMixins({ rootObj: obj })
  expect(obj).toEqual({ "test": {} })
})
