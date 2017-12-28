import { build, mergeRefs } from "./index"

test('build', () => {
  const json = build(`${__dirname}/fixture.json`)
  console.log(JSON.stringify(json, null, 2))
})
