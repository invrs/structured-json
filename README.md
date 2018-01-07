# Structured JSON

Framework for JSON structures that are easy to read, write, and document.

Action                               | Operator     | Key/Value
------------------------------------ | ------------ | ---------
[Assign Value](#assign)              | `<=`         | Value
[Assign Defaults](#defaults)         | `<<`, `>>`   | Key
[Merge](#merge)                      | `<<`, `>>`   | Value
[Mixin](#mixin)                      | `$`          | Key
[Conditional Defaults](#conditional) | `<<?`, `>>?` | Key

## Install

```bash
npm install structured-json
```

## Import

```js
import { build } from "structured-json"
```

## Assign

```js
let { stores, products } = build({
  "stores": {
    "grocery": {
      "products": "<= foodProducts"
    }
  },
  "foodProducts": {
    "milk": {
      "store": "<= stores.grocery"
    }
  }
})

stores.grocery.products // { milk }
products.milk.store     // { products }
```

Assignment supports circular references, but is up to you to be careful about infinite enumeration.

## Merge

```js
let { products } = build({
  "organicProducts": {
    "eggs": {},
    "milk": {}
  },
  "veganProducts": {
    "kale": {},
    "tofu": {}
  },
  "products": "<= organicProducts << veganProducts"
})

products // { eggs: {},
         //   milk: {},
         //   kale: {},
         //   tofu: {} }
```

## Defaults

```js
let { organicProducts, veganProducts } = build({
  "organicProducts": {
    ">>": { "organic": true },
    "eggs": {},
    "milk": {}
  },
  "veganProducts": {
    ">>": { "vegan": true },
    "kale": {},
    "tofu": {}
  }
})

organicProducts // { eggs: { organic },
                //   milk: { organic } }
veganProducts   // { kale: { vegan },
                //   tofu: { vegan } }
```

Here the merge operator defines a default object for its siblings.

Add +1 to the depth by adding successive merge operators (`">> >>":`).

## Mixin

```js
let { products } = build({
  "$green": {
    color: "green"
  },
  "$white": {
    color: "white"
  },
  "products": {
    "milk": { "<<": "$white" },
    "kale": { "<<": "$green" },
    "tofu": { "<<": "$white" }
  }
})

products // { milk: { color },
         //   kale: { color },
         //   tofu: { color } }
```
