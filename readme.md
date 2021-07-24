
### 右键菜单组件


用来在一些需要右键弹出菜单层的情况下，为菜单按钮传递单击事件或者统一处理菜单事件，支持异步加载子菜单节点列表或者根据业务动态过滤子菜单（权限）等功能, 以及自定义组合快捷键触发


::: demo
```vue
<template>
  <vl-context-menu>
    <h2 style="background: gray">默认效果展示， 鼠标右击此处试试弹出菜单</h2>
  </vl-context-menu>
</template>
<script>
</script>
```
:::

### 基础用法
目前支持三种常用的插件用法，以适配不同的业务场景

#### 1.使用slot默认包裹在组件内的元素在鼠标右键单击时触发菜单展示
```vue
  <template>
    <vl-context-menu>
      <h1>鼠标右击我会展示对应右键菜单</h1>
    </vl-context-menu>
  </template>
```
#### 2.使用vue指令v-context-menu
##### 注册
``` js
  import Vue from 'vue'
  import { VlContextMenu } from 'ssa-components-next'
  Vue.use(VlContextMenu.register) // 注册右键菜单指令和方法
```
##### 使用  
``` vue
     <template>
        <h1 v-context-menu="{ menuInfo: [{name: '菜单1', value: 'menu1'}] }">鼠标右击我会展示对应右键菜单</h1>
    </template>
```
#### 3.使用$contextMenu方法，用于元素不存在template中时或者全局右键菜单
##### 注册方法同第二种一致
``` vue 
<template>
    <h1 ref="contextMenu">鼠标右击我会展示对应右键菜单</h1>
</template>
<script>
  export default {
    data () {
      return {
      }
    },
    mounted () {
      const el = this.$refs.contextMenu
      const { vm, destroy, destoryAll, forceUpdate, triggerMenu } = this.$contextMenu({ clickFn: (val, item) => { console.log(val) }, target: el, menuInfo: [{name: '菜单1', value: 'menu1'}] })
      // vm : 实例， destory： 手动销毁当前组件方法， destoryAll： 销毁所有通过指令和$contextMenu注册的右键菜单, triggerMenu: 手动显示隐藏,forceUpdate: 需要重新渲染菜单
    }
  }
</script>
```
## 注册方式演示
::: demo
```vue
<template>
  <div>
    <vl-context-menu>
      <h2 style="background: gray">渲染子元素</h2>
    </vl-context-menu>
    <h2 style="background: gray" ref="contextMenu">通过$contextMenu绑定的右键菜单</h2>
    <h2 style="background: gray" v-context-menu="{ menuInfo }">指令注册的右键菜单</h2>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        menuInfo: [{
          name: '菜单1',
          value: 'menu1'
        },
        {
          name: '菜单2',
          value: 'menu2'
        }]
      }
    },
    mounted () {
      const el = this.$refs.contextMenu
      const { vm, destroy, destoryAll, forceUpdate, triggerMenu } = this.$contextMenu({ target: el, menuInfo: this.menuInfo })
    },
    methods: {
      clickFn(val, item) {
        console.log(val, item)
      }
    }
  }
</script>
```
:::

## 多级菜单
多级菜单使用节点对象下children的格式进行递归渲染， 务必在每个节点对象赋值不重复的value和name展示属性（自定义节点渲染可忽略）
::: demo
``` vue
<template>
  <vl-context-menu :menuInfo="menuInfo">
    <h2>效果展示， 鼠标右击此处试试弹出菜单</h2>
  </vl-context-menu>
</template>

<script>
 export default {
   data() {
     return {
       menuInfo: [
         {
           name: '主菜单1',
           value: '1',
           fn: function (item) {
             alert(item.name + 'click')
           },
           icon: 'el-icon-edit',
           children: [
             {
              name: '子菜单1',
              value: '1-1',
              fn: function (item) {
                alert(item.name + 'click')
              },
              children: [
                {
                  name: '子菜单1-1',
                  value: '1-1-1',
                  fn: function (item) {
                    alert(item.name + 'click')
                  },
                }
              ]
             },
             {
              name: '子菜单2',
              value: '1-2',
              fn: function (item) {
                alert(item.name + 'click')
              }
             }
           ]
         },
         {
          name: '主菜单2',
          value: '2',
          fn: function (item) {
            alert(item.name + 'click')
          }
         }
       ]
     }
   }
 }
</script>
```
:::

## 图标，菜单元素自定义渲染
当每个菜单节点传递了render渲染函数属性时，默认会优先使用render函数去渲染元素， 而不是节点的name属性， 菜单节点icon属性字符串默认渲染到菜单的i标签的class内，也可以传一个函数使用jsx渲染.
<br>
<br>
`注： 在一些情况下不是所有的项目都装了jsx转换插件， 所以第一个函数传递createElement函数， 可使用原生jsx渲染语法进行自定义渲染createElement('div', { props }, children)，函数的第二个参数才是当前菜单项的对象属性`
::: demo
``` vue
<template>
  <vl-context-menu :menuInfo="menuInfo" @clickFn="() => {}">
    <h2>效果展示， 鼠标右击此处试试弹出菜单</h2>
  </vl-context-menu>
</template>

<script>
 export default {
   data() {
     return {
       menuInfo: [
         {
           name: '主菜单1',
           value: '1',
           fn: function (item) {
             alert(item.name + 'click')
           },
           icon: 'el-icon-edit',
           render(h, item) {
             return h('span', { style: { border: 'solid 1px red', color: 'red' } }, `${item.name}自定义渲染`)
           },
           children: [
             {
              name: '子菜单1',
              value: '1-1',
              fn: function (item) {
                alert(item.name + 'click')
              },
              children: [
                {
                  name: '子菜单1-1',
                  value: '1-1-1',
                  fn: function (item) {
                    alert(item.name + 'click')
                  },
                }
              ]
             },
             {
              name: '子菜单2',
              value: '1-2',
              fn: function (item) {
                alert(item.name + 'click')
              }
             }
           ]
         },
         {
          name: '自定义图标',
          value: '2',
          icon(h, item) {
            return h('span', { style: { border: 'solid 1px red' } }, '口') 
          },
          fn: function (item) {
            alert(item.name + 'click')
          }
         }
       ]
     }
   }
 }
</script>
```
:::
## 权限 | 异步菜单
#### 权限菜单
在一些复杂业务中，可能不是所有情况下菜单的配置都是一致的，往往需要根据用户当前的权限或者一些其他业务做动态的过滤，每一个节点提供load方法，该方法必须返回节点的children属性， load方法执行后的children权重大于子节点自身的children属性，默认优先load方法返回的子节点数组，所以你可以在load方法内对自己的子节点做一些像是过滤或者添加节点等操作
#### 异步菜单
当节点被用户激活时，和权限菜单用法一致，load方法返回promise即可，在返回的promise中resolve该菜单节点的children属性，组件内部会处理加载动画和刷新视图，适用于向服务端请求子菜单数据, load方法默认执行一次， 只有当函数报错时会重新执行。
::: demo
``` vue
<template>
  <vl-context-menu :menuInfo="menuInfo" @clickFn="() => {}">
    <h2>效果展示， 鼠标右击此处试试弹出菜单</h2>
  </vl-context-menu>
</template>

<script>
 export default {
   data() {
     return {
       authType: 'SYSTEM',
       menuInfo: [
         {
           name: '权限菜单',
           value: 'filter',
           auth: ['USER', 'SYSTEM', 'AGENT'],
           load: (item) =>  {
             const { children } = item
             return children.filter(i => i.auth.includes(this.authType))
           },
           children: [
             {
               name: '用户菜单',
               value: 'user',
               auth: ['USER']
             },
             {
               name: '系统管理员',
               value: 'SYSTEM',
               auth: ['SYSTEM']
             },
             {
               name: '删库',
               value: 'SYSTEM1',
               auth: ['SYSTEM']
             },
             {
               name: '跑路',
               value: 'SYSTEM2',
               auth: ['SYSTEM']
             },
             {
               name: '代理商',
               value: 'AGENT',
               auth: ['AGENT']
             }
           ]
         },
         {
           name: '异步菜单',
           value: 'async',
           load: (item) => {
             return new Promise((resolve) => {
               setTimeout(() => {
                 resolve([
                    {
                      name: '系统管理员',
                      value: 'SYSTEM',
                      auth: ['SYSTEM']
                    },
                    {
                      name: '删库',
                      value: 'SYSTEM1',
                      auth: ['SYSTEM']
                    },
                    {
                      name: '代理商',
                      value: 'AGENT',
                      auth: ['AGENT']
                    }
                 ])
               }, 2000)
             })
           }
         }
       ]
     }
   }
 }
</script>
```
:::

## 自定义快捷键
##### 触发机制 
当前绑定的dom对象为active状态并且菜单组件的状态为弹出时，会收集当前用户按下的快捷键组合
可组合任意快捷键作为当前菜单项快捷菜单项, 默认设定按键间隔为500ms， 即在500ms内按下的按键响应会被收集为快捷键按键，查找到有对应绑定的快捷键会自动执行该菜单项传递的fn函数，以及组件的clickFn事件。
##### 配置
当前组件绑定dom对象active时（即dom被单击或者右击时）且弹出菜单后，会收集用户的所有按键，可在控制台查看输出，然后使用控制台输出的key进行配置
##### 下面时一个demo小游戏，你需要在500ms内快速的按下按键
::: demo
``` vue
<template>
  <vl-context-menu :menuInfo="menuInfo" >
    <h2>手速测试，打开右键开始闯关</h2>
  </vl-context-menu>
</template>

<script>
 export default {
   data() {
     return {
       menuInfo: [
          {
            name: '开始闯关',
            value: '-1',
            keys: ['Control', 'z'],
            fn () {
              alert('start')
            }
          },
         {
           name: '手速测试器，第一关',
           value: '1',
           fn: function (item) {
             alert('这只是个入门abc')
           },
           keys: ['t', 'e', 's'],
           icon: 'el-icon-edit',
           children: [
             {
              name: '子菜单1',
              value: '1-1',
              keys: ['Control', 'a'],
              fn: function (item) {
                alert(item.name + 'click')
              },
             },
             {
              name: '子菜单2',
              value: '1-2',
              fn: function (item) {
                alert(item.name + 'click')
              }
             }
           ]
         },
         {
           name: '手速测试器第二关',
           value: '2',
           fn: function (item) {
             alert('恭喜你，通过第二关')
           },
           keys: ['a', 'b', 'c'],
         },
         {
           name: '手速测试器第3关',
           value: '3',
           fn: function (item) {
             alert('恭喜你，通过第三关')
           },
           keys: ['q', 'w', 'e', 'r'],
         },
         {
           name: '手速测试器第4关',
           value: '4',
           fn: function (item) {
             alert('恭喜你，通过第4关')
           },
           keys: ['q', 'g', 'b', 'u', 'p'],
         }
       ]
     }
   }
 }
</script>
```
:::

## 参数
###  事件(适用于组件)
| 事件名 | 描述 | 类型 | 默认值 | 其他|
| :------| :------ | :------: |:------: |:------: |
| clickFn |  菜单每一项单击事件  | func | undefined | 回调函数，传参当前点击项的value和当前项  |
| contextMenuClick |  菜单的右击回调事件  | func | undefined | 回调函数，传参当前点击项的Event对象  |

### 参数(适用于组件)
| 参数名 | 描述 | 类型 | 默认值 | 其他|
| :------| ------: | :------: |:------: |:------: |
| menuInfo |  菜单的主要信息展示  | Array | [] |  |


### 节点参数（menuInfo）
| 参数 | 描述 | 类型 | 默认值 | 其他|
| :------| :------ | :------: |:------: |:------: |
| [menuInfo].name | 当前菜单项展示的名称字符串 |  string  | '' |   |
| [menuInfo].icon | 当前菜单项图标 |  string/func   | '' |  render函数返回jsx, 函数参数$createElement和当前菜单项的渲染数据 |
| [menuInfo].value | 菜单的value属性 |  string  | '' |   |
| [menuInfo].load | 当前菜单项children的加载函数，返回children对象 |  func => promise()/children  | undefined | 函数必须返回children格式的对象或者promise |
| [menuInfo].fn | 节点单项的单击事件回调 |  func  | undefined |   |
| [menuInfo].keys | 节点事件触发的快捷键配置 |  array  | undefined | 于触发顺序无关， 默认收集500ms内按下的按键， 所以会延迟一会  |
| [menuInfo].title | 节点单项的title说明属性 |  string  | ‘’ |  鼠标划过时触发 |
| [menuInfo].children | 当前菜单项的子节点数组对象 |  array  | [] |   |

### $contextMenu函数调用参数
| 参数 | 描述 | 类型 | 默认值 | 其他|
| :------| :-------- | :----: |:------: |:------: |
| menuInfo | 节点数组 |  array  | [] |   |
| target | 需要绑定的右键菜单DOM |  string/htmlElement  | undefined |  stirng参数默认使用document.querySelector查询dom |
| clickFn |  菜单每一项单击事件  | func | undefined | 回调函数，传参当前点击项的value和当前项  |
| contextMenuClick |  菜单的右击回调事件  | func | undefined | 回调函数，传参当前点击项的Event对象  |

### $contextMenu函数返回参数
| 参数 | 描述 | 类型 | 
| :------| :-------- | :----: |
| vm | 当前vue组件实例 |  new Vue()  | 
| forceUpdate | 当组件参数menuInfo更新时，可调用该方法强制刷新菜单视图，而不是等到菜单消失后重新打开才更新 |  func |
| destroy |  手动销毁当前组件实例， 当绑定的节点不存在时可调用该方法手动解绑并销魂实例，可添加在生命周期的destory中  | func |
| destroyAll | 手动销魂所有通过指令和$contextMenu注册的菜单组件实例，慎用 |  func  | 
| triggerMenu | 手动显示隐藏切换函数， 传递一个boolean型进行显示隐藏 |  func  | 

### v-context-menu指令参数

| 参数 | 描述 | 类型 | 默认值 | 其他|
| :------| :-------- | :----: |:------: |:------: |
| menuInfo | 节点数组 |  array  | [] |   |
| clickFn |  菜单每一项单击事件  | func | undefined | 回调函数，传参当前点击项的value和当前项  |
| contextMenuClick |  菜单的右击回调事件  | func | undefined | 回调函数，传参当前点击项的Event对象  |


