import { build } from "../lib"

test("assign circular", () => {
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
  
  expect(stores.grocery.products).toHaveProperty("milk")
  expect(products.milk.store).toHaveProperty("products")
  expect(products.milk.store.products).toHaveProperty("milk")
})
