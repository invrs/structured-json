import {
  build,
  deleteDynamics,
  markDynamics,
  mergeDefaults,
  resolveMixins
} from "../lib"

function testObj(obj) {
  return { base: obj, orig: obj, ops: [] }
}

test("deleteDynamics", () => {
  let params = testObj({
    "<<": {},
    "$mixin1": {},
    "test": {
      "$mixin2": {}
    }
  })
  expect(deleteDynamics(params)).toEqual([
    { op: 'delete', loc: [ '<<' ] },
    { op: 'delete', loc: [ '$mixin1' ] },
    { op: 'delete', loc: [ 'test', '$mixin2' ] }
  ])
})

test("resolveMixins", () => {
  let params = testObj({
    "$mixin1": {},
    "$mixin2": {},
    "test": {
      "$mixin2": {},
      "testChild": "<= $mixin1 << $mixin2",
      "<<? $mixin2": "$mixin1"
    }
  })
  expect(resolveMixins(params)).toEqual([
    { "op": "replaceValue",
      "replace": "$mixin2",
      "replaceWith": "test.$mixin2",
      "loc": ["test", "testChild"]
    },
    { "op": "replaceKey",
      "replace": "$mixin2",
      "replaceWith": "test.$mixin2",
      "loc": ["test", "<<? $mixin2"]
    }
  ])
})

test("mergeDefaults", () => {
  let params = testObj({
    "condition": true,
    "<<": { "test": {} },
    ">>": { "test3": {} },
    ">> >>": { "test4": {} },
    "test2": {
      "<<? condition": { "conditional": {} },
      "<<? condition condition2": { "conditional2": {} }
    }
  })
  expect(mergeDefaults(params)).toEqual([
    { op: 'mergeOver',
      dest: [ 'test2' ],
      source: [ 'test2', '<<? condition' ] },
    { op: 'mergeOver',
      dest: [],
      source: [ '<<' ] },
    { op: 'mergeUnder',
      dest: [ 'test2' ],
      source: [ '>>' ] },
    { op: 'mergeUnder',
      dest: [ '<<', 'test' ],
      source: [ '>> >>' ] },
    { op: 'mergeUnder',
      dest: [ '>>', 'test3' ],
      source: [ '>> >>' ] },
    { op: 'mergeUnder',
      dest: [ '>> >>', 'test4' ],
      source: [ '>> >>' ] }
  ])
})

test("mergeDefaults", () => {
  let params = testObj({
    "test": "1",
    "$mixin": {},
    "<<": { "test2": "2" },
    "test3": {
      "test4": "<= $mixin"
    }
  })
  expect(markDynamics(params)).toEqual([
    { op: 'isDynamic',
      loc: [ 'test3', 'test4' ],
      "matches": [
        { "condition": false,
          "depth": 0.5,
          "direction": "<",
          "refs": ["$mixin"]
        }
      ]
    }
  ])
})
