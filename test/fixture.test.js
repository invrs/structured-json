import { readFileSync } from "fs"
import { build } from "../lib"

const fixture = JSON.parse(
  readFileSync(`${__dirname}/fixture.json`, "utf8")
)

test("build", () => {
  let base = build(fixture, { staging: true })
  expect(base).toEqual({
    "aws-account": {
      "east": {
        "image-bucket": {
          "hello": false,
          "world": true
        },
        "basic-bucket": {
          "hello": true,
          "world": true
        }
      },
      "west": {
        "image-bucket": {
          "accelerate": true,
          "error": "error.html"
        }
      }
    },
    "aws-bucket": {
      "image": {
        "index2": "index.html",
        "index3": "index.html",
        "hello": false,
        "name": "company-images-stag",
        "test": true,
        "grant": "id=xxx"
      }
    },
    "staging": true
  })
})
