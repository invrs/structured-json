import { build } from "../lib"

test('build', () => {
  const json = build(`${__dirname}/fixture.json`, { production: true })
  expect(json).toEqual({
    "aws-account": {
      "east": {
        "image-bucket": {
          "accelerate": true,
          "error": "error.html",
          "index": "index.html",
          "grant": "id=xxx",
          "hello": true,
          "name": "company-images-prod"
        }
      }
    },
    "aws-bucket": {
      "image": {
        "index": "index.html",
        "grant": "id=xxx",
        "name": "company-images-prod"
      }
    }
  })
})
