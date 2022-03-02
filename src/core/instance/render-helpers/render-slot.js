/* @flow */

import { extend, warn, isObject } from 'core/util/index'

/**
 * Runtime helper for rendering <slot>
 *
 * 子组件 _t 调用这个方法，就可以将父组件里面定义的 slot 插槽渲染到子组件中
 */
export function renderSlot (
  name: string,
  fallback: ?Array<VNode>, // 插槽子节点
  props: ?Object,
  bindObject: ?Object
): ?Array<VNode> {
  const scopedSlotFn = this.$scopedSlots[name] // 将插槽节点以 key 的方式保存在 vm.$scopedSlots 中,这里可以根据 key 拿到插槽节点
  if (scopedSlotFn) { // scoped slot
    props = props || {}
    if (bindObject) {
      if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
        warn(
          'slot v-bind without argument expects an Object',
          this
        )
      }
      // 将相关数据对象（bindObject），并合并到 props 中
      props = extend(extend({}, bindObject), props)
    }
    // 作为参数传入到渲染插槽函数中，这里比较巧妙，在模板编译中定义的 fn，源码位置 src/compiler/codegen/index.js genScopedSlots
    return scopedSlotFn(props) || fallback
  } else {
    const slotNodes = this.$slots[name]
    // warn duplicate slot usage
    if (slotNodes && process.env.NODE_ENV !== 'production') {
      slotNodes._rendered && warn(
        `Duplicate presence of slot "${name}" found in the same render tree ` +
        `- this will likely cause render errors.`,
        this
      )
      slotNodes._rendered = true
    }
    return slotNodes || fallback
  }
}

