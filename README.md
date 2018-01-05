# Structured JSON

Framework for complex configuration structures that are easy to read, write, and document.

Supports references, mixins, and conditions using a pure JSON syntax.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Basic structure](#basic-structure)
  - [Resources](#resources)
  - [Records](#records)
- [References](#references)
- [Build](#build)
  - [Install](#install)
  - [Use Library](#use-library)
- [Mixins](#mixins)
  - [Defaults](#defaults)
- [Merging](#merging)
- [Conditions](#conditions)
  - [Build](#build-1)
  - [Using a condition](#using-a-condition)
- [All together now](#all-together-now)
  - [Full example](#full-example)
  - [Build with condition](#build-with-condition)
  - [Output](#output)
- [Compile multiple files](#compile-multiple-files)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Basic structure

### Resources

The top level contains resources:

```json
{
  "aws-account": {},
  "aws-bucket": {}
}
```

### Records

Each resource contains records:

```json
{
  "aws-account": {
    "east": {}
  },
  "aws-bucket": {
    "image": {}
  }
}
```

## References

Records can reference other records:

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "$aws-bucket.image"
    }
  },
  "aws-bucket": {
    "image": {
      "name": "company-images"
    }
  }
}
```

## Build

### Install

```bash
npm install structured-json
```

### Use Library

```js
import { readFileSync } from "fs"
import json from "structured-json"

const path = `${__dirname}/config.json`
const config = JSON.parse(readFileSync(path))
const build = json.build(config)

console.log(JSON.stringify(build, null, 2))
```

The `build` function optionally accepts multiple objects.

## Mixins

A mixin defines an object to be used solely for referencing.

Mixins have a `$` at the front of their name. Here we define a `$website` mixin:

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "$aws-bucket.image"
    }
  },
  "aws-bucket": {
    "$website": {
      "index": "index.html"
    },
    "image": {
      "name": "company-images",
      "index": "$website.index"
    }
  }
}
```

### Defaults

The `$default` mixin defines default values.

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "$aws-bucket.image"
    }
  },
  "aws-bucket": {
    "$default": {
      "grant": "id=xxx"
    },
    "image": {
      "name": "company-image"
    }
  }
}
```

## Merging

Use the `<<` operator to merge values:

```json
{
  "aws-account": {
    "$east-bucket": {
      "accelerate": true,
      "error": "error.html"
    },
    "east": {
      "image-bucket": "$east-bucket << $aws-bucket.image"
    }
  },
  "aws-bucket": {
    "image": {
      "name": "company-images"
    }
  }
}
```

## Conditions

Let's add a `staging` condition to the compilation.

### Build

```js
const build = json.build(config, { conditions: { staging: true } })
```

### Using a condition

Mixins that match a condition merge into the parent object:

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "$aws-bucket.image"
    }
  },
  "aws-bucket": {
    "image": {
      "$staging": {
        "name": "company-images-stag"
      },
      "$production": {
        "name": "company-images-prod"
      }
    }
  }
}
```

## All together now

### Full example

```json
{
  "aws-account": {
    "$default": {
      "image-bucket": {
        "accelerate": true,
        "error": "error.html"
      }
    },
    "east": {
      "image-bucket": "<< $aws-bucket.image"
    }
  },
  "aws-bucket": {
    "$default": {
      "grant": "id=xxx"
    },
    "$website": {
      "index": "index.html"
    },
    "image": {
      "$staging": {
        "name": "company-images-stag"
      },
      "$production": {
        "name": "company-images-prod"
      },
      "index": "$website.index"
    }
  }
}
```

### Build with condition

```js
import { readFileSync } from "fs"
import json from "structured-json"

const path = `${__dirname}/config.json`
const config = JSON.parse(readFileSync(path))
const build = json.build(config, { conditions: { production: true } })

console.log(JSON.stringify(build, null, 2))
```

### Output

```json
{
  "aws-account": {
    "east": {
      "image-bucket": {
        "accelerate": true,
        "error": "error.html",
        "grant": "id=xxx",
        "name": "company-images-prod",
        "index": "index.html"
      }
    }
  },
  "aws-bucket": {
    "company": {
      "grant": "id=xxx",
      "name": "company-images-prod",
      "index": "index.html"
    }
  }
}
```

## Compile multiple files

Concat all `.json` files in a directory:

```bash
structured-json . > build.json
```

Use `-r` to search recursively.
