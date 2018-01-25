import { build } from "../lib"

test("conditionals", () => {
  let { products } = build({
    winter: true,
    products: {
      ">>? winter": {
        local: false,
      },
      ">>": {
        local: true,
      },
      kale: {},
    },
  })

  expect(products).toEqual({ kale: { local: false } })
})

test("conditional within a default", () => {
  let { products } = build({
    winter: true,
    products: {
      ">>": {
        "<<? winter": {
          local: false,
        },
      },
      kale: {},
    },
  })

  expect(products).toEqual({ kale: { local: false } })
})
