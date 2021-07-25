
const SHORT_KEY_NAMES = {
  Control: 'Ctrl'
}
let timer
let currentKeys = []
class KeyCodeHelper {
  constructor () {
    this.keyCodeMapper = {}
    this.keyCodeArgsMapper = {}
  }

  registerKeyCodeFunction = (keycodes = [], cb, item) => {
    keycodes = keycodes.sort()
    const key = keycodes.join('+')
    this.keyCodeMapper[key] = cb
    this.keyCodeArgsMapper[key] = item
    return this
  }
  removeKeyCodeFunc = (keys) => {
    keycodes = keycodes.sort()
    const key = keycodes.join('+')
    Reflect.deleteProperty(this.keyCodeArgsMapper, key)
    return Reflect.deleteProperty(this.keyCodeMapper, key)
  }
  clearnFn = () => {
    this.keyCodeMapper = {}
    this.keyCodeArgsMapper = {}
  }

  execKeycodeFunction= (keycodes) => {
    keycodes = keycodes.sort()
    const key = keycodes.join('+')
    const fn = this.keyCodeMapper[key]
    const fnArgs = this.keyCodeArgsMapper[key]
    fn && fn(fnArgs)
  }
}
function keydownThrottle (key, fn) {
  currentKeys.push(key)
  fn(currentKeys)
  return new Promise(resolve => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (currentKeys.length) {
        resolve([...currentKeys])
      } else {
        resolve(undefined)
      }
      currentKeys = []
    }, 300)
  })
}
export default {
  KeyCodeHelper,
  SHORT_KEY_NAMES,
  keydownThrottle
}
