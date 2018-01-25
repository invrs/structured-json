import { build } from "../lib"

test("defaults", () => {
  let { organicProducts, veganProducts } = build({
    organicProducts: {
      ">>": { organic: true },
      eggs: {},
      milk: {},
    },
    veganProducts: {
      ">>": { vegan: true },
      kale: {},
      tofu: {},
    },
  })
  expect(organicProducts).toEqual({
    eggs: { organic: true },
    milk: { organic: true },
  })
  expect(veganProducts).toEqual({
    kale: { vegan: true },
    tofu: { vegan: true },
  })
})
