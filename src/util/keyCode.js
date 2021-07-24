
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
function keydownThrottle (key) {
  return new Promise(resolve => {
    currentKeys.push(key)
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