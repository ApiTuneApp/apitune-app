export enum EditBodyType {
  prepend,
  overwrite,
  append,
  replaceByRegex,
  replace
}

interface SimpleEditBodyOption {
  /**
   * prepend    前边添加
   * overwrite  整体替换
   * append     后边追加
   */
  type: EditBodyType.prepend | EditBodyType.overwrite | EditBodyType.append
  // 追加的内容或者替换成的内容
  content: string | Buffer
}

/**
 * 全文正则表达式替换
 */
interface ReplaceByRegexBodyOption {
  type: EditBodyType.replaceByRegex
  // 正则表达式
  pattern: string
  // 正则表达式模式标示： "i" 忽略大小写， "g" 全局替换， "ig" 两者都有
  patternFlags?: string
  // 追加的内容或者替换成的内容
  content: string
}
/**
 * 全文字符串替换
 */
interface ReplaceBodyOption {
  type: EditBodyType.replace
  // 要替换的串
  pattern: string
  // 追加的内容或者替换成的内容
  content: string
}

export type EditBodyOption = SimpleEditBodyOption | ReplaceBodyOption | ReplaceByRegexBodyOption

/**
 * 本文件被编辑后 需要执行 npm run jsonscheme
 *
 * 本文件是描述Api层面的规则interface
 *
 * 代理服务器运行时的规则interface 在 parse-rule 文件内
 */

export interface GlobFilter {
  type: 'glob'
  pattern: string
}

export interface RegexFilter {
  type: 'regex'
  pattern: string
  patternFlags?: string
}

export type Filter = GlobFilter | RegexFilter

export interface Header {
  key: string
  value: string
}

export interface ResponseFile {
  // 文件表中ID
  fileId: number
  // type: string
}

export enum HttpsControl {
  // decode https content and apply rules
  decode = 'decode',
  // won't decode https and won't log reqest
  ignore = 'ignore',
  // won't decode https but request will be logged
  tunnel = 'tunnel'
}

export interface Rule {
  // 判断是否命中当前规则的列表，只要命中任意一个就可以
  includes: Filter[]
  // 需要排除掉哪些 （先命中，后排除）
  excludes?: Filter[]
  // 要添加哪些请求header，相同的会被覆盖
  requestHeaders?: Header[]
  // 修改请求表单
  requestBody?: EditBodyOption
  /**
   * 将请求重定向到哪个url
   *   如果原来的请求url为 a.com/b?c=d
   *   rewrite 值为 b.com/c
   *   那么会请求 b.com/c/b?c=d
   * 也就是要替换原来的域名部分
   */
  rewrite?: string
  // 不发送网络请求，直接返回文件
  responseFile?: ResponseFile
  // 返回的状态码
  responseStatus?: number
  // 要添加哪些结果header，相同的会被覆盖
  responseHeaders?: Header[]
  // 修改返回结果
  responseBody?: EditBodyOption
  // 限速： 1秒 ?KB
  speedLimit?: number
  // 同时设置请求响应延迟 单位毫秒（优先级低）
  delay?: number
  // 请求延迟 单位毫秒
  requestDelay?: number
  // 响应延迟 单位毫秒
  responseDelay?: number
  // 使用jq编辑 请求JSON
  reqBodyJq?: string
  // 使用jq编辑 结果JSON
  resBodyJq?: string
  // https 流量处理方法， ignore, decode, tunnel
  httpsControl?: HttpsControl
}
