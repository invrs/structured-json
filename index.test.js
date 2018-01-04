import { build, mergeRefs } from "./index"

test('build', () => {
  const json = build(`${__dirname}/fixture.json`)
  expect(json).toEqual({
    "aws-account": {
      "east": {
        "image-bucket": {
          "accelerate": true,
          "error": "error.html",
          "index": "index.html",
          "grant": "id=xxx",
          "hello": true
        }
      }
    },
    "aws-bucket": {
      "image": {
        "index": "index.html",
        "grant": "id=xxx"
      }
    }
  })
})
