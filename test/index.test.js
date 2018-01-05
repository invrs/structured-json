import { readFileSync } from "fs"
import { build } from "../lib"

const fixture = JSON.parse(
  readFileSync(`${__dirname}/fixture.json`, "utf8")
)

test('build', () => {
  const conditions = { production: true }
  const json = build(fixture, { conditions })
  
  expect(json).toEqual({
    "conditions": {
      "production": true,
    },
    "aws-account": {
      "east": {
        "image-bucket": {
          "accelerate": true,
          "error": "error.html",
          "index": "index.html",
          "grant": "id=xxx",
          "hello": true,
          "world": true,
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
