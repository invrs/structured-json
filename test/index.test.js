import {
  build,
  deleteDynamicKeys,
  markDynamicValues,
  mergeDefaults,
  resolveMixins,
} from "../lib"

function testObj(obj) {
  return { base: obj, orig: obj, ops: [] }
}

test("deleteDynamicKeys", () => {
  let params = testObj({
    "<<": {},
    $mixin1: {},
    test: {
      $mixin2: {},
    },
  })
  expect(deleteDynamicKeys(params)).toEqual([
    { op: "delete", loc: ["test", "$mixin2"] },
    { op: "delete", loc: ["<<"] },
    { op: "delete", loc: ["$mixin1"] },
  ])
})

test("resolveMixins", () => {
  let params = testObj({
    $mixin1: {},
    $mixin2: {},
    test: {
      $mixin2: {},
      testChild: "<= $mixin1 << $mixin2",
      "<<? $mixin2": "$mixin1",
    },
  })
  expect(resolveMixins(params)).toEqual([
    {
      op: "replaceValue",
      replace: "$mixin2",
      replaceWith: "test.$mixin2",
      loc: ["test", "testChild"],
    },
    {
      op: "replaceKey",
      replace: "$mixin2",
      replaceWith: "test.$mixin2",
      loc: ["test", "<<? $mixin2"],
    },
  ])
})

test("mergeDefaults", () => {
  let params = testObj({
    condition: true,
    "<<": { test: {} },
    ">>": { test3: {} },
    ">> >>": { test4: {} },
    test2: {
      "<<? condition": { conditional: {} },
      "<<? condition condition2": { conditional2: {} },
    },
  })
  expect(mergeDefaults(params)).toEqual([
    {
      dest: ["test2"],
      op: "mergeOver",
      source: ["test2", "<<? condition"],
    },
    {
      loc: ["test2", "<<? condition"],
      op: "delete",
    },
    {
      dest: [],
      op: "mergeOver",
      source: ["<<"],
    },
    {
      loc: ["<<"],
      op: "delete",
    },
    {
      dest: ["test2"],
      op: "mergeUnder",
      source: [">>"],
    },
    {
      loc: [">>"],
      op: "delete",
    },
    {
      dest: ["<<", "test"],
      op: "mergeUnder",
      source: [">> >>"],
    },
    {
      dest: [">>", "test3"],
      op: "mergeUnder",
      source: [">> >>"],
    },
    {
      dest: [">> >>", "test4"],
      op: "mergeUnder",
      source: [">> >>"],
    },
    {
      loc: [">> >>"],
      op: "delete",
    },
  ])
})

test("mergeDefaults", () => {
  let params = testObj({
    test: "1",
    $mixin: {},
    "<<": { test2: "2" },
    test3: {
      test4: "<= $mixin",
    },
  })
  expect(markDynamicValues(params)).toEqual([
    {
      op: "isDynamic",
      loc: ["test3", "test4"],
      matches: [
        {
          condition: false,
          depth: 0.5,
          direction: "<",
          refs: ["$mixin"],
        },
      ],
    },
  ])
})
