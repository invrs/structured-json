import { build } from "../lib"

let { stores, products } = build({
  "stores": {
    "grocery": {
      "products": "<= products"
    }
  },
  "products": {
    "milk": {
      "store": "<= stores.grocery"
    }
  }
})

test("assign circular", () => {
  expect(stores.grocery.products).toHaveProperty("milk")
  expect(products.milk.store).toHaveProperty("products")
  expect(products.milk.store.products).toHaveProperty("milk")
})
