import { retrieveLoc } from "./locators"
import { matchMixinKey } from "./matchers"
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

export function mergeDefaults({ rootObj, obj=rootObj }) {

}

export function assignAccessors({ path, value }) {

}
