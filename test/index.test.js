import { defineHiddenProps, mergeDefaults, resolveMixins, deleteMixins } from "../lib"

function testObj(obj) {
  defineHiddenProps({ rootObj: obj, json: JSON.stringify(obj) })
  return obj
}

test("defineHiddenProps", () => {
  let obj = testObj({ "test": {} })
  expect(obj._original).toEqual({ "test": {} })
  expect(obj._updates).toEqual([])
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

test("mergeDefaults", () => {
  let obj = testObj({
    "condition": true,
    "<<": { "test": {} },
    ">>": { "test3": {} },
    "test2": {
      "<<? condition": { "conditional": {} },
      "<<? condition condition2": { "conditional2": {} }
    }
  })
  mergeDefaults({ rootObj: obj })
  console.log(obj)
})
