# Structured JSON

Operators that make complex JSON structures easy to read and write.

| Action                                | Operator     | Key/Value |
| ------------------------------------- | ------------ | --------- |
| [Assign Value](#assign)               | `<=`         | Value     |
| [Assign Defaults](#defaults)          | `<<`, `>>`   | Key       |
| [Merge](#merge)                       | `<<`, `>>`   | Value     |
| [Mixin](#mixin)                       | `$`          | Key       |
| [Conditional Defaults](#conditionals) | `<<?`, `>>?` | Key       |

## Install

```bash
npm install structured-json
```

## Import

```js
import { build, update } from "structured-json"
```

## Assign

```js
let { stores, products } = build({
  stores: {
    grocery: {
      products: "<= products",
    },
  },
  products: {
    milk: {
      store: "<= stores.grocery",
    },
  },
})

stores.grocery.products // { milk }
products.milk.store // { products }
```

Assignment supports circular references, but it is up to you to be careful about infinite enumeration.

## Merge

```js
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

products
// { eggs: {},
//   milk: {},
//   kale: {},
//   tofu: {} }
```

## Defaults

When used in a key, the merge operator defines a default object for its siblings (`>>`) or its parent (`<<`):

```js
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

organicProducts
// { eggs: { organic },
//   milk: { organic } }

veganProducts
// { kale: { vegan },
//   tofu: { vegan } }
```

Define defaults for sibling child objects with successive merge operators (`">> >>":`).

## Mixin

A mixin is a variable meant only for referencing, and does not show up in enumeration.

```js
let { products } = build({
  products: {
    $green: {
      color: "green",
    },
    $white: {
      color: "white",
    },
    milk: { "<<": "$white" },
    kale: { "<<": "$green" },
    tofu: { "<<": "$white" },
  },
})

products
// { milk: { color: "white" },
//   kale: { color: "green" },
//   tofu: { color: "white" } }
```

## Conditionals

```js
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

products // { kale: { local: false } }
```
