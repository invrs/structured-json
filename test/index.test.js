import { readFileSync } from "fs"
import {
  build,
  defineHiddenProps,
  deleteMixins,
  markDynamics,
  mergeDefaults,
  resolveMixins
} from "../lib"

const fixture = JSON.parse(
  readFileSync(`${__dirname}/fixture.json`, "utf8")
)

function testObj(obj) {
  let params = { base: obj, orig: obj, ops: [] }
  defineHiddenProps({ ...params, json: JSON.stringify(obj) })
  return params
}

test("defineHiddenProps", () => {
  let { base } = testObj({ "test": {} })
  expect(base._ops).toEqual([])
  expect(base._original).toEqual({ "test": {} })
})

test("deleteMixins", () => {
  let params = testObj({
    "$mixin1": {},
    "test": {
      "$mixin2": {}
    }
  })
  deleteMixins(params)
  expect(params.base._ops).toEqual([
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
  resolveMixins(params)
  expect(params.base._ops).toEqual([
    { "op": "replaceInValue",
      "from": "$mixin2",
      "to": "test.$mixin2",
      "loc": ["test", "testChild"]
    },
    { "op": "replaceInKey",
      "from": "$mixin2",
      "to": "test.$mixin2",
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
  mergeDefaults(params)
  expect(params.base._ops).toEqual([
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
  markDynamics(params)
  expect(params.base._ops).toEqual([
    { op: 'isDynamic', loc: [ 'test3', 'test4' ] }
  ])
})

test("build", () => {
  let base = build(fixture, { staging: true })
  console.log(JSON.stringify(base, null, 2))
})
