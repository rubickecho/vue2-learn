/* @flow */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
export function resolveSlots (
  children: ?Array<VNode>,
  context: ?Component // 父组件实例
): { [key: string]: Array<VNode> } {
  const slots = {}
  if (!children) {
    return slots
  }
  const defaultSlot = []
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.functionalContext === context) &&
      data && data.slot != null
    ) {
      const name = child.data.slot
      // 以插槽具名key 存储插槽节点，允许重名，所以有下面这段逻辑
      const slot = (slots[name] || (slots[name] = []))

      // 然后将插槽 vnode 放入插槽数组中
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children) // 所有的子节点都 push 进去
      } else {
        slot.push(child)
      }
    } else { // 如果不是具名，则放入到默认插槽中
      defaultSlot.push(child)
    }
  }
  // ignore whitespace
  if (!defaultSlot.every(isWhitespace)) {
    slots.default = defaultSlot
  }
  return slots
}

function isWhitespace (node: VNode): boolean {
  return node.isComment || node.text === ' '
}

export function resolveScopedSlots (
  fns: ScopedSlotsData, // see flow/vnode
  res?: Object
): { [key: string]: Function } {
  res = res || {}
  for (let i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn // 在 renderSlot 是组装好的 props 后，就会作为参数传入到该函数fn并执行
    }
  }
  return res
}

/**
 * function genScopedSlots (
  slots: { [key: string]: ASTElement },
  state: CodegenState
): string {
  return `scopedSlots:_u([${
    Object.keys(slots).map(key => {
      return genScopedSlot(key, slots[key], state)
    }).join(',')
  }])`
}

function genScopedSlot (
  key: string,
  el: ASTElement,
  state: CodegenState
): string {
  if (el.for && !el.forProcessed) {
    return genForScopedSlot(key, el, state)
  }
  const fn = `function(${String(el.slotScope)}){` +
    `return ${el.tag === 'template'
      ? el.if
        ? `${el.if}?${genChildren(el, state) || 'undefined'}:undefined`
        : genChildren(el, state) || 'undefined'
      : genElement(el, state)
  }}`
  return `{key:${key},fn:${fn}}`
}
 */
