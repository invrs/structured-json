# Structured JSON

Framework for complex configuration structures that are easy to read, write, and document.

Supports references, mixins, and conditions using a pure JSON syntax.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Basic structure](#basic-structure)
  - [Resources](#resources)
  - [Records](#records)
- [References](#references)
- [Compile](#compile)
  - [Install](#install)
  - [From the CLI](#from-the-cli)
  - [From JS](#from-js)
- [Mixins](#mixins)
  - [Defaults](#defaults)
- [Conditions](#conditions)
  - [From the CLI](#from-the-cli-1)
  - [From JS](#from-js-1)
  - [JSON syntax](#json-syntax)
- [All together now](#all-together-now)
  - [Full example](#full-example)
  - [Compile](#compile-1)
  - [The result](#the-result)
- [Separate JSON files](#separate-json-files)

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

### Install

```bash
npm install -g structured-json
```

### From the CLI

```bash
structured-json config.json > build.json
```

### From JS

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

### Defaults

The `$default` mixin defines default values.

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "${aws-bucket.image}"
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

## Conditions

### From the CLI

```bash
structured-json --staging config.json > staging.json
```

### From JS

```js
import json from "structured-json"

const config = json.build(`${__dirname}/config.json`, { staging: true })

console.log(config, null, 2)
```

### JSON syntax

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

### Full example

```json
{
  "aws-account": {
    "east": {
      "image-bucket": "${aws-bucket.image}"
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
      "index": "${website.index}"
    }
  }
}
```

### Compile

```bash
structured-json --production config.json > production.json
```

### The result

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

## Separate JSON files

Split your JSON into separate files, and the compiler will use the filename as the key:

```bash
# ls
# aws-account.json    aws-bucket.json

structured-json . > build.json
```

Nested directories create nested objects.
