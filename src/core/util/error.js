/* @flow */

import config from '../config'
import { warn } from './debug'
import { inBrowser } from './env'

/**
 * 自底向上查找，知道根节点
 * 如果一个组件继承的链路或其父级从属链路中存在多个errorCaptured钩子函数，则它们将会被相同的错误逐个唤起
 */
export function handleError (err: Error, vm: any, info: string) {
  if (vm) {
    let cur = vm
    while ((cur = cur.$parent)) {
      // 当这个组建的父级组件定义了一个或多个 errorCaptured 钩子函数，则调用这些钩子函数
      const hooks = cur.$options.errorCaptured
      if (hooks) {
        for (let i = 0; i < hooks.length; i++) {
          try {
            // 如果执行函数结果返回 false，则不再继续向上传递
            const capture = hooks[i].call(cur, err, vm, info) === false

            // 如果为 tue，则停止冒泡向上抛出错误
            if (capture) return
          } catch (e) {
            globalHandleError(e, cur, 'errorCaptured hook')
          }
        }
      }
    }
  }
  globalHandleError(err, vm, info)
}

// 收集所有的错误处理函数
function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      logError(e, null, 'config.errorHandler')
    }
  }
  // 不管什么情况，都将错误信息打印到控制台
  logError(err, vm, info)
}

function logError (err, vm, info) {
  if (process.env.NODE_ENV !== 'production') {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if (inBrowser && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}
