<script>
 /* eslint-disable */
import keyUtils from './util/keyCode'
const { KeyCodeHelper, SHORT_KEY_NAMES, keydownThrottle } = keyUtils
let instanceCollection = new WeakMap() // 所有节点对象和对应的右键菜单组件关系映射
let instanceEl = new Set() // 所有有右键组件的EL， 用来查找对应的vm
const icons = ['el-icon-delete', 'el-icon-edit', 'el-icon-share', 'el-icon-delete', 'el-icon-circle-plus-outline']
const getRandomIcon = () => icons[Math.floor(Math.random() * icons.length)]
const genRandomMenu = (perfix, count = 0) => {
  count += 1
  const arr = []
  for (let i = 0; i < 10; i++) {
    const itemPerfix = `${perfix}-${i}`
    arr.push({
      name: itemPerfix,
      value: itemPerfix,
      icon: getRandomIcon(),
      fn: function () {
        alert(itemPerfix + ' Click')
      },
      children: count >= 3 ? null : genRandomMenu(itemPerfix, count)
    })
  }
  return arr
}
const compWrap = {
  name: 'VueContextMenu',
  components: { VueContextMenu: compWrap},
  props: {
    menuInfo: {
      default: () => (
        [
          {
            name: 'menu1,带children',
            value: 'menu1',
            keys: ['Control', 'a', 'a'],
            disabled: true,
            fn: function () {
              alert('触发fn执行')
              console.log('menu1 Click')
            },
            title: '这是menu1,带children',
            icon: 'el-icon-upload',
            children: [
              {
                name: 'menu1-1',
                value: 'menu1-1',
                fn: function () {
                  alert('menu1-1 Click')
                },
                render (h) {
                  return h('span', '1-1自定义渲染')
                },
                children: [
                  ...genRandomMenu('menu1-1')
                ]
              },
              ...genRandomMenu('menu1')
            ]
          },
          {
            name: '异步渲染',
            value: 'menu2',
            title: '异步渲染常用于动态向服务端请求本次菜单节点的数据',
            load: function (item) {
              console.log(item, 'menu2 load')
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve(genRandomMenu('async'))
                }, 1000)
              })
            },
            fn: function (item) {
              alert('click 异步渲染')
              console.log(item)
            }
          },
          {
            value: 'menu3',
            title: '支持渲染jsx语法的render函数',
            keys: ['r', 'e'],
            fn () {
              alert('click menu3')
            },
            render (h) {
              return h('span', { style: { color: 'red', border: 'solid 1px red' } }, '自定义渲染')
            }
          },
          {
            value: 'menu4',
            name: '动态添加子节点',
            disabled: true,
            title: '动态添加子节点可用于权限菜单或者复杂业务下操作， 用来过滤或者重新添加菜单子节点',
            load: function (item) {
              console.log(item, 'load ')
              return genRandomMenu('filter')
            },
            fn: function (item) {
              console.log(item.name, item)
            }
          },
          {
            value: 'menu4',
            name: '自定义图标',
            icon: function (h) {
              return h('span', { style: { color: 'red', border: 'solid 1px red' } }, '1')
            }
          },
          ...genRandomMenu('parent')
        ]
      ),
      type: Array
    },
    target: {
      default: undefined,
      type: HTMLElement | String
    }
  },
  register: {
    install (_Vue) { // 随便一个函数传入调用，否则eslint报错
      function init ({ target, menuInfo, clickFn = String, contextMenuClick = String }) { // 适配指令， js调用初始化方法
        let _target = null
        if (target.constructor === String) {
          _target = document.querySelector(target)
        } else if (target.constructor.toString().includes('Element')) {
          _target = target
        }
        if (!_target) {
            throw new Error('the key "target" is unexpected type, please use string or htmlElement')
        }
        if (instanceCollection.get(_target)) return // 保证每个dom实例仅对应一个vm组件实例
        const parent = document.createElement('div')
        const div = document.createElement('div')
        parent.appendChild(div)
        let vm = new _Vue({
          el: div,
          render () {
            return <VueContextMenu menuInfo = {menuInfo} target = {target} ref="contextMenu" on-clickFn={clickFn} on-contextMenuClick={contextMenuClick}/>
          },
          methods: {
            forceUpdate () {
              this.$refs.contextMenu.forceUpdate()
            },
            addKeysFunc: this.$refs.contextMenu.addKeysFunc,
            removeKeysFunc: this.$refs.contextMenu.removeKeysFunc
          }
        })
        document.body.appendChild(parent)
        instanceCollection.set(_target, vm)
        instanceEl.add(_target)
        return {
          vm,
          addKeysFunc: vm.addKeysFunc,
          removeKeysFunc: vm.removeKeysFunc,
          forceUpdate () {
            vm.forceUpdate()
          },
          destroy () {
            parent.innerHTML = ''
            vm.$destroy()
            vm = null
            document.body.removeChild(parent)
          },
          destroyAll () { // 慎用， 会清楚该组件所有通过指令和$contextMenu注册的右键菜单
            instanceEl.forEach(i => {
              const vm = instanceCollection.get(i)
              vm && vm.$destroy()
            })
            instanceCollection = new WeakMap()
            instanceEl = new Set()
          }
        }
      }
      _Vue.directive('context-menu', {
        inserted: function (el, { value: { menuInfo, clickFn, contextMenuClick } }) {
          init({ target: el, menuInfo, clickFn, contextMenuClick })
        }
      })
      _Vue.prototype.$contextMenu = function ({ target = document.body, menuInfo, clickFn, contextMenuClick }) {
        return init({ target, menuInfo, clickFn, contextMenuClick })
      }
    }
  },
  data: function () {
    return {
      menuVDOM: null,
      position: {
        x: 0,
        y: 0
      },
      menuItemHeight: 0,
      loaddingStatus: {},
      loadedNode: new WeakMap()
    }
  },
  mounted () {
    this.hideContextMenuFn = () => {
      this.menuVDOM = null
    }
    document.body.addEventListener('click', this.hideContextMenuFn)
    if (this.target) {
      this.target.setAttribute('tabindex', 0)
      this.target.addEventListener('contextmenu', this.contextMenuClick)
      this.target.addEventListener('keydown', this.keydownExecFunction)
    }
    this.keycodeHelper = new KeyCodeHelper()
    this.registerKeycodeFn(this.menuInfo)
  },
  destroyed () {
    document.body.removeEventListener('click', this.hideContextMenuFn)
    if (this.target) {
      this.target.removeEventListener('keydown', this.keydownExecFunction)
      this.target.removeEventListener('contextmenu', this.contextMenuClick)
    }
  },
  methods: {
    registerKeycodeFn (menus, isDisabled) { // 注册快捷键
      for (let i = 0; i < menus.length; i++) {
        const item = menus[i]
        const itemdis = (item.disabled || isDisabled)
        const fn = () => {
          item.fn && item.fn(item)
          this.$emit('clickFn', item.value, item)
        }
        !itemdis && item.keys && this.keycodeHelper.registerKeyCodeFunction(new Array(...item.keys), fn, item)
        item.children && item.children.length && this.registerKeycodeFn(item.children, item.disabled || itemdis)
      }
    },
    addKeysFunc(keys, cb) {
      return this.keycodeHelper.registerKeyCodeFunction(new Array(...keys), cb, {})
    },
    removeKeysFunc (keys) {
      return this.keycodeHelper.removeKeyCodeFunc(keys)
    },
    async keydownExecFunction (e) { // 300ms 适配多key组合快捷键（一般都是组合快捷键场景）,ctrl+ a + b，原生无法使用多key的情况
      if (!this.menuVDOM) return
      const { key } = e
      const keys = await keydownThrottle(key, (currentKeys) => {
        this.menuVDOM && this.keycodeHelper.execKeycodeFunction(currentKeys)
      })
      // eslint-disable-next-line
      console.log(keys)
    },
    treeNodeClickWrap (e, cb, item) {
      if(item.disabled) return
      e && e.stopPropagation()
      this.$emit('clickFn', item.value, item)
      cb && cb(item)
    },
    isAsyncRenderLoaddingIcon (item) {
      if ( this.loaddingStatus[item.value]) {
        return <svg  class="menu-icon icon-loadding" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
        <path d="M512 20.053333a32 32 0 0 0-32 32v236.8a32 32 0 1 0 64 0V52.053333A32 32 0 0 0 512 20.053333zM310.186667 97.706667A32 32 0 0 0 256 128l118.186667 204.8A32 32 0 0 0 426.666667 302.506667zM98.133333 309.76l180.053334 103.68a32 32 0 1 0 32-55.466667L128 256a32 32 0 1 0-32 55.466667zM264.106667 512a32 32 0 0 0-32-32H52.053333a32 32 0 0 0 0 64h180.053334a32 32 0 0 0 32-32zM272.64 649.813333a32 32 0 0 0-42.666667-11.52l-132.266666 75.946667A32 32 0 1 0 128 768l130.986667-75.946667a32 32 0 0 0 13.653333-42.24zM360.106667 775.68a32 32 0 0 0-42.666667 11.52L256 896a32 32 0 1 0 55.466667 32l60.16-108.8a32 32 0 0 0-11.52-43.52zM512 845.226667a32 32 0 0 0-32 32v95.146666a32 32 0 0 0 64 0v-95.146666a32 32 0 0 0-32-32zM734.293333 832.853333a32 32 0 0 0-55.466666 32l35.413333 61.013334A32 32 0 0 0 768 896zM971.946667 480h-236.373334a32 32 0 0 0 0 64h236.373334a32 32 0 0 0 0-64zM705.28 432.213333a32 32 0 0 0 15.786667-4.266666l204.8-118.186667A32 32 0 0 0 896 256l-204.8 118.186667a32 32 0 0 0 16.213333 59.733333zM758.186667 85.333333a32 32 0 0 0-42.666667 11.946667L597.333333 302.933333a32 32 0 1 0 55.466667 32L768 128a32 32 0 0 0-9.813333-42.666667z" fill="#bfbfbf"></path></svg>
      } else if (item.load || (item.children && item.children.length)) {
        return  <svg class="menu-icon" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path fill="#bfbfbf" d="M432.276 240.938l-57.431 57.431 213.92 213.92-213.92 213.92 57.431 57.431 271.351-271.351z"></path></svg>

      }
    },
    renderIcon (item) {
      return typeof item.icon === 'function' ? item.icon(this.$createElement, item) : <i class={`menu-icon ${item.icon}`}></i>
    },
    async loadLazyChildren (e, cb, item) {
      e.stopPropagation()
      if (this.loadedNode.has(item)) return // 仅加载一次异步数据，下次检测到异步数据加载后已有children直接跳过
      if (!cb) return
      const res = cb(item)
      if (!res) return
      if (res instanceof Promise) { // 异步菜单渲染
        this.loaddingStatus[item.value] = true
        this.menuVDOM = this.genRenderMenuDom(this.menuInfo) // 先重新渲染菜单节点, 适配异步节点添加加载动画
      }
      this.loadedNode.set(item, true) // 动态加载的节点已经加载，做一个标记
      const children = await res
      if (children && children.length) { // fn方法有返回子节点的情况下
        item.children = children
        this.loaddingStatus[item.value] = false
        this.menuVDOM = this.genRenderMenuDom(this.menuInfo) // 重新渲染菜单节点
      }
    },
    renderKeysText (item) {
      if (item.keys) {
        return <span class="keys-text">({ item.keys.map(i => SHORT_KEY_NAMES[i] || i.toUpperCase()).join(' + ') })</span>
      }
    },
    genRenderMenuDom (menus, parent, isDisabled) {
      if (!menus.length) {
        return null
      }
      const wrapStyleWrap = { position: 'fixed', left: this.position.x + 'px', top: this.position.y + 'px', zIndex: 9999 }
      const wrapStyleSub = { position: 'absolute', left: '100%', top: '0' }
      return <ul class="menu-wrap" style={parent ? wrapStyleSub : wrapStyleWrap}
        onMouseleave={() => (!parent && setTimeout(() => {
          this.menuVDOM = null
        }, 200))}
      >
        {
          menus.map((item) => <li title={item.title} onClick={(e) => !(item.disabled || isDisabled) && this.treeNodeClickWrap(e, item.fn, item)}
            onMouseenter={(e) => this.loadLazyChildren(e, item.load, item) }
            class={{disable: item.disabled || isDisabled }}
          >
            {this.renderIcon(item)}
            {item.render ? item.render(this.$createElement, item) : item.name}
            { this.renderKeysText(item) }
            {this.isAsyncRenderLoaddingIcon(item)}
            {item.children && item.children.length && this.genRenderMenuDom(item.children, item, item.disabled || parent && parent.disabled || isDisabled)}
          </li>)
        }
      </ul>
    },
    contextMenuClick (e) {
      this.$emit('contextMenuClick', e)
      e.stopPropagation()// 防止多个组件嵌套重复弹出菜单
      e.preventDefault()
      this.menuVDOM = null
      const { clientX, clientY } = e
      this.position.x = clientX
      this.position.y = clientY
      this.menuVDOM = this.genRenderMenuDom(this.menuInfo)
    },
    forceUpdate () {
      this.menuVDOM = this.genRenderMenuDom(this.menuInfo)
    }
  },
  render () {
    return this.target ? this.menuVDOM : <span onContextmenu={this.contextMenuClick} onKeydown={ this.keydownExecFunction } tabindex='0'>
      {this.menuVDOM}
      {this.$slots.default }</span>
  }
}
export default compWrap
</script>
<style lang="scss" scoped>
@keyframes identifier {
  form{
    transform: rotate(0deg);
  }
  to{
    transform: rotate(360deg);
  }
}
.menu-wrap{
  min-width: 100px;
  background: white;
  border-radius: 2px;
  padding-left: 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px 0;
  >li{
    list-style: none;
    line-height: 32px;
    padding: 0 22px 0 16px;
    margin: 0;
    font-size: 13px;
    list-style: none;
    // padding-left: 10px;
    // padding-right: 20px;
    height: 32px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    color: #333;
    &.disable{
      cursor: not-allowed;
      color: gray;
      &:hover{
        background: none;
      }
    }
    .keys-text{
      transform: scale(0.7);
      transform-origin: center;
      display: inline-block;
      font-size: 12px;
      color: rgb(156, 154, 154);
    }
    >.menu-icon {
      position: absolute;
      right: 0;
      top: calc( 50% - 8px );
      &.icon-loadding{
        animation: identifier linear 2s infinite;
      }
      >path{
        transform: scale(0.2);
      }
    }
    &:hover>.menu-wrap, &:active>.menu-wrap{
      display: inline-block;
    }
    &>.menu-wrap {
      display: none;
    }
    &:hover{
      background: #ecf5ff;
    }
    >i{
      margin-right: 8px;
      vertical-align: middle;
    }
  }
}
</style>
