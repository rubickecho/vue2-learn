/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 获取默认安装的插件列表
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))

    // 检查默认安装的插件列表是否有重复
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters Convert an Array-like object to a real Array.
    const args = toArray(arguments, 1)

    // 方法将一个或多个元素添加到数组的开头，并返回该数组的新长度(该方法修改原有数组)。
    // function(Vue, options) {}
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}

// examples

// MyPlugin.install = function (Vue, options) {
//   // 1. 添加全局方法或 property
//   Vue.myGlobalMethod = function () {
//     // 逻辑...
//   }

//   // 2. 添加全局资源
//   Vue.directive('my-directive', {
//     bind (el, binding, vnode, oldVnode) {
//       // 逻辑...
//     }
//     ...
//   })

//   // 3. 注入组件选项
//   Vue.mixin({
//     created: function () {
//       // 逻辑...
//     }
//     ...
//   })

//   // 4. 添加实例方法
//   Vue.prototype.$myMethod = function (methodOptions) {
//     // 逻辑...
//   }
// }
