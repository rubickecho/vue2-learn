/* @flow */

import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

export function parseText (
  text: string,
  delimiters?: [string, string]
): string | void {
  // 正则判断文本是否包含变量，即写法是否为{{xxx}}
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE

  // 如果是纯文本，自己返回
  if (!tagRE.test(text)) {
    return
  }
  const tokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index
  // 处理一段文本多个变量时，将每次处理的结果放入tokens，然后再拼接成一个字符串
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)))
    }
    // tag token
    const exp = parseFilters(match[1].trim())
    tokens.push(`_s(${exp})`)
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }
  return tokens.join('+')
}
