export function run({ base, orig, ops, oop }) {
  for (let fn of oop) {
    fn({ base, orig, ops })
  }
}

export function runUntilNoOps({ base, orig, ops, oop }) {
  let operate = oop.pop()
  let newLength
  do {
    run({ base, orig, ops, oop })
    newLength = ops.length
    operate({ base, orig, ops })
  } while (newLength != 0)
}
