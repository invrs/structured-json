import { build } from "../lib"

test("mixins", () => {
  let { products } = build({
    products: {
      $green: {
        color: "green",
      },
      $white: {
        color: "white",
      },
      milk: { "<<": "<= $white" },
      kale: { "<<": "<= $green" },
      tofu: { "<<": "<= $white" },
    },
  })

  expect(products).toEqual({
    milk: { color: "white" },
    kale: { color: "green" },
    tofu: { color: "white" },
  })
})
