import { defineHiddenProps, mergeDefaults, resolveMixins, deleteMixins } from "../lib"

function testObj(obj) {
  defineHiddenProps({ rootObj: obj, json: JSON.stringify(obj) })
  return obj
}

test("defineHiddenProps", () => {
  let obj = testObj({ "test": {} })
  expect(obj._ops).toEqual([])
  expect(obj._original).toEqual({ "test": {} })
})

test("deleteMixins", () => {
  let obj = testObj({
    "$mixin1": {},
    "test": {
      "$mixin2": {}
    }
  })
  deleteMixins({ rootObj: obj })
  expect(obj._ops).toEqual([
    { op: 'delete', loc: [ '$mixin1' ] },
    { op: 'delete', loc: [ 'test', '$mixin2' ] }
  ])
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
  expect(obj._ops).toEqual([
    { op: 'resolve',
      loc: [ 'test', 'testChild' ],
      from: '$mixin1',
      to: '$mixin1' },
    { op: 'resolve',
      loc: [ 'test', 'testChild' ],
      from: '$mixin2',
      to: 'test.$mixin2' }
  ])
})

test("mergeDefaults", () => {
  let obj = testObj({
    "condition": true,
    "<<": { "test": {} },
    ">>": { "test3": {} },
    ">> >>": { "test4": {} },
    "test2": {
      "<<? condition": { "conditional": {} },
      "<<? condition condition2": { "conditional2": {} }
    }
  })
  mergeDefaults({ rootObj: obj })
  expect(obj).toEqual({
    condition: true,
    test2: { test3: { test4: {} } },
    test: { test3: { test4: {} } },
    conditional: {}
  })
})
