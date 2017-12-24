# Structured JSON

Framework for complex configuration structures that are easy to read, write, and document.

Supports advanced features like interpolation, references, mixins, and conditions using a simple pure JSON syntax.

## Resources

Top level objects describe a resource object:

```json
{
  "aws-account": {}
}
```

## Records

Resources contain record objects:

```json
{
  "aws-account": {
    "us-east-1": {}
  }
}
```

## References

Records can reference other records:

```json
{
  "aws-account": {
    "us-east-1": {
      "bucket": "${aws-bucket/us-east-1}"
    }
  },
  "aws-bucket": {
    "us-east-1": {
      "name": "mycompany-east"
    }
  }
}
```

## Compiler

Install the library:

```bash
npm install -g structured-json
```

Compile from the CLI:

```bash
structured-json config.json > build.json
```

Compile from JS:

```bash
import json from "structured-json"

const config = json.build(`${__dirname}/config.json`)

console.log(config, null, 2)
```

## Mixins

Here we use a mixin to add grant information to the bucket:

```json
{
  "aws-account": {
    "us-east-1": {
      "bucket": "${aws-bucket.us-east-1}"
    }
  },
  "aws-bucket": {
    "$grant-us-west-1": {
      "id": "xxx"
    },
    "us-east-1": {
      "name": "mycompany-east",
      "grant": "id=${grant-us-west-1.id}"
    }
  }
}
```

## Default mixins

We can also add the grant information to all buckets by default:

```json
{
  "aws-account": {
    "us-east-1": {
      "bucket": "${aws-bucket.us-east-1}"
    }
  },
  "aws-bucket": {
    "$": {
      "grant": "id=xxx"
    },
    "us-east-1": {
      "name": "mycompany-east"
    }
  }
}
```

## Specify conditions

Specify conditions from the CLI:

```bash
structured-json -c staging=1 -c production=0 config.json > staging.json
```

Or in JS:

```bash
import json from "structured-json"

const conditions = {
  staging: true,
  production: false
}

const config = json.build(`${__dirname}/config.json`, { conditions })

console.log(config, null, 2)
```

## Condition usage

Matching mixins merge into the parent object:

```json
{
  "aws-account": {
    "us-east-1": {
      "bucket": "${aws-bucket.us-east-1}"
    }
  },
  "aws-bucket": {
    "us-east-1": {
      "$staging": {
        "name": "mycompany-east-stag"
      },
      "$production": {
        "name": "mycompany-east-prod"
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
    "us-east-1": {
      "bucket": "${aws-bucket.us-east-1}"
    }
  },
  "aws-bucket": {
    "$": {
      "grant": "id=xxx"
    },
    "us-east-1": {
      "$staging": {
        "name": "mycompany-east-stag"
      },
      "$production": {
        "name": "mycompany-east-prod"
      }
    }
  }
}
```

Compile config JSON:

```bash
structured-json -c staging=1 -c production=0 config.json > staging.json
```

View compiled JSON:

```json
{
  "aws-account": {
    "us-east-1": {
      "bucket": {
        "grant": "id=xxx",
        "name": "mycompany-east-stag"
      }
    }
  },
  "aws-bucket": {
    "us-east-1": {
      "grant": "id=xxx",
      "name": "mycompany-east-stag"
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
