import { build } from "../lib"

test("merge", () => {
  let { products } = build({
    organicProducts: {
      eggs: {},
      milk: {},
    },
    veganProducts: {
      kale: {},
      tofu: {},
    },
    products: "<= organicProducts << veganProducts",
  })

  expect(products).toHaveProperty("kale")
  expect(products).toHaveProperty("tofu")
  expect(products).toHaveProperty("eggs")
  expect(products).toHaveProperty("milk")
})
