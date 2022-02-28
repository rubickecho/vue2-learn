/* @flow */

import { isDef, isUndef } from 'shared/util'
import { updateListeners } from 'core/vdom/helpers/index'
import { withMacroTask, isIE, supportsPassive } from 'core/util/index'
import { RANGE_TOKEN, CHECKBOX_RADIO_TOKEN } from 'web/compiler/directives/model'

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    const event = isIE ? 'change' : 'input'
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || [])
    delete on[RANGE_TOKEN]
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || [])
    delete on[CHECKBOX_RADIO_TOKEN]
  }
}

let target: HTMLElement

function createOnceHandler (handler, event, capture) {
  const _target = target // save current target element in closure
  return function onceHandler () {
    const res = handler.apply(null, arguments)
    // 执行后，判断返回的结果如果不为null，则移除该事件
    // 为什么会这样判断呢？那不是强制要求要有返回值，感觉不是很友好
    // issue: https://github.com/vuejs/vue/issues/4846
    if (res !== null) {
      remove(event, onceHandler, capture, _target)
    }
  }
}

function add (
  event: string,
  handler: Function,
  once: boolean,
  capture: boolean,
  passive: boolean
) {
  // 宏任务包装事件
  handler = withMacroTask(handler)
  // 如果有 once 属性，即执行一次就销毁
  if (once) handler = createOnceHandler(handler, event, capture)

  // 创建事件监听器
  target.addEventListener(
    event,
    handler, // 其实 handler 是 withMacroTask 包装过的
    supportsPassive
      ? { capture, passive }
      : capture
  )
}

function remove (
  event: string,
  handler: Function,
  capture: boolean,
  _target?: HTMLElement
) {
  (_target || target).removeEventListener(
    event,
    handler._withTask || handler, // 因为是被 withMacroTask 包装过的，所以在移除时，应该移除包装后的事件
    capture
  )
}

function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  // 判断新旧 vnode 是否有事件
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  // 获取新 vnode 事件
  const on = vnode.data.on || {}

  // 获取旧 vnode 事件
  const oldOn = oldVnode.data.on || {}

  // 获取当前节点对应的 DOM 元素
  target = vnode.elm

  // 处理特殊情况下事件
  normalizeEvents(on)

  // 根据对比结果，判断是否需要更新事件，新增事件
  updateListeners(on, oldOn, add, remove, vnode.context)
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}
