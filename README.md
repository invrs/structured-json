# Structured JSON

Framework for complex configuration structures that are easy to read, write, and document.

Supports references, mixins, and conditions using a pure JSON syntax.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Basic structure](#basic-structure)
  - [Resources](#resources)
  - [Records](#records)
- [References](#references)
- [Install](#install)
- [Build](#build)
- [Mixins](#mixins)
  - [Default mixins](#default-mixins)
  - [Conditional mixins](#conditional-mixins)
    - [Build with condition](#build-with-condition)
    - [Use condition](#use-condition)
- [Merging](#merging)
- [All together now](#all-together-now)
  - [Full example](#full-example)
  - [Build with condition](#build-with-condition-1)
  - [Output](#output)

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

Record properties can reference other records:

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

## Install

```bash
npm install structured-json
```

## Build

```js
import { readFileSync } from "fs"
import json from "structured-json"

const path = `${__dirname}/config.json`
const config = JSON.parse(readFileSync(path))
const build = json.build(config)

console.log(JSON.stringify(build, null, 2))
```

The `build` function accepts one or more objects.

## Mixins

A mixin defines an object used solely for referencing.

Mixin names begin with a `$`. Here we define a `$website` mixin:

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

### Default mixins

The `$default` mixin defines default record properties:

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

### Conditional mixins

#### Build with condition

```js
const conditions = { staging: true }
const build = json.build(config, { conditions })
```

#### Use condition

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

## Merging

The `<<` operator merges objects:

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
  },
  "conditions": {
    "production": true
  }
}
```
