import { mergeDefaultsLeft, mergeDefaultsRight } from "./defaults"
import { retrieveLoc } from "./locators"
import { matchDefaultKey, matchMixinKey } from "./matchers"
import { gatherMixinLocs, replaceMixinValues } from "./mixins"

export function build(...objects) {
  let json = JSON.stringify(Object.assign({}, ...objects))
  let rootObj = JSON.parse(json)

  defineHiddenProps({ rootObj, json })
  deleteMixins({ rootObj })
  resolveMixins({ rootObj })
  mergeDefaults({ rootObj })
  assignAccessors({ rootObj })

  return rootObj
}

export function update(rootObj, updates) {

}

export function defineHiddenProps({ rootObj, json }) {
  Object.defineProperty(rootObj, "_original", { value: JSON.parse(json) })
  Object.defineProperty(rootObj, "_updates", { value: [] })
}

export function resolveMixins({ rootObj, obj=rootObj, loc=[], mixins={} }) {
  gatherMixinLocs({ rootObj, obj, loc, mixins })

  for (let key in obj) {
    if (obj[key].constructor === String) {
      obj[key] = replaceMixinValues(obj[key], match => mixins[match])
    } else if (obj[key].constructor === Object) {
      resolveMixins({
        rootObj,
        obj: obj[key],
        loc: loc.concat([ key ]),
        mixins
      })
    }
  }
}

export function deleteMixins({ rootObj, obj=rootObj }) {
  for (let key in obj) {
    if (matchMixinKey(key)) {
      delete obj[key]
    } else if (obj[key].constructor === Object) {
      deleteMixins({ rootObj, obj: obj[key] })
    }
  }
}

export function mergeDefaults({ rootObj, obj=rootObj, loc=[] }) {
  for (let key in obj) {
    let match = matchDefaultKey(key)
    if (match) {
      let { conditions, direction } = match
      let mergeFn
      let pass = true
      
      if (conditions) {
        pass = !conditions.find(condition =>
          !retrieveLoc(rootObj._original, condition)
        )
      }
      
      if (pass) {
        mergeFn = direction == "<<" ?
          mergeDefaultsLeft :
          mergeDefaultsRight

        mergeFn({
          rootObj,
          obj: obj[key],
          loc: loc.concat([ key ])
        })
      }
    } else if (obj[key].constructor === Object) {
      mergeDefaults({
        rootObj,
        obj: obj[key],
        loc: loc.concat([ key ])
      })
    }
  }
}

export function assignAccessors({ path, value }) {

}
