import { build, mergeRefs, readJson } from "./index"

test('mergeRefs', () => {
  let json = { "abc": "def", "ghi": "$abc" }
  expect(mergeRefs({ json, key: "ghi" })).toEqual([ "def" ])

  json = {
    "abc": { "def": { "ghi": "jkl" } },
    "mno": "$abc.def.ghi"
  }
  expect(mergeRefs({ json, key: "mno" })).toEqual([ "jkl" ])

  json = {
    "$default": { "abc": "def" },
    "ghi": "$default.abc"
  }
  expect(mergeRefs({ json, key: "ghi" })).toEqual([ "def" ])

  json = {
    "$default": { "abc": { "def": "ghi" } },
    "abc": "<< $jkl",
    "jkl": { "mno": "pqr" }
  }
  expect(mergeRefs({ json, key: "abc" }))
    .toEqual([ { "def": "ghi" }, { "mno": "pqr" } ])
})
