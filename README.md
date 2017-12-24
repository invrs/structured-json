# Structured JSON

Framework for complex configuration structures that are easy to read, write, and document.

Supports references, mixins, and conditions using a pure JSON syntax.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Resources](#resources)
- [Records](#records)
- [References](#references)
- [Compile](#compile)
- [Mixins](#mixins)
- [Default mixins](#default-mixins)
- [Specify conditions](#specify-conditions)
- [Condition usage](#condition-usage)
- [All together now](#all-together-now)
  - [Split up your JSON](#split-up-your-json)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Resources

The top level contains resources:

```json
{
  "aws-account": {},
  "aws-bucket": {}
}
```

## Records

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
      "image-bucket": "${aws-bucket.image}"
    }
  },
  "aws-bucket": {
    "image": {
      "name": "company-images"
    }
  }
}
```

## Compile

Install:

```bash
npm install -g structured-json
```

Compile from the CLI:

```bash
structured-json config.json > build.json
```

Compile from JS:

```js
import json from "structured-json"

const config = json.build(`${__dirname}/config.json`)

console.log(config, null, 2)
```

## Mixins

A mixin defines an object to be used solely for referencing.

Here we define a `$website` mixin:

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "${aws-bucket.image}"
    }
  },
  "aws-bucket": {
    "$website": {
      "index": "index.html"
    },
    "image": {
      "name": "company-images",
      "index": "${website.index}"
    }
  }
}
```

## Default mixins

Add `grant` information to all buckets by default:

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "${aws-bucket.image}"
    }
  },
  "aws-bucket": {
    "$": {
      "grant": "id=xxx"
    },
    "image": {
      "name": "company-image"
    }
  }
}
```

## Specify conditions

Specify conditions from the CLI:

```bash
structured-json --staging config.json > staging.json
```

Or from JS:

```js
import json from "structured-json"

const conditions = {
  staging: true,
  production: false
}

const config = json.build(`${__dirname}/config.json`, { conditions })

console.log(config, null, 2)
```

## Condition usage

Mixins that match a condition merge into the parent object:

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "${aws-bucket.image}"
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

Save config JSON:

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "${aws-bucket.image}"
    }
  },
  "aws-bucket": {
    "$": {
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
      "index": "${website.index}"
    }
  }
}
```

Compile config JSON:

```bash
structured-json --production config.json > production.json
```

View compiled JSON:

```json
{
  "aws-account": {
    "east": {
      "image-bucket": {
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

### Split up your JSON

Split your JSON into separate files, and the compiler will use the filename as the key:

```bash
# ls
# aws-account.json    aws-bucket.json

structured-json . > build.json
```

Nested directories create nested objects.
