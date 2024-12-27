export enum EditBodyType {
  prepend,
  overwrite,
  append,
  replaceByRegex,
  replace
}

interface SimpleEditBodyOption {
  /**
   * prepend    add to the front
   * overwrite  replace the whole
   * append     add to the back
   */
  type: EditBodyType.prepend | EditBodyType.overwrite | EditBodyType.append
  // content to add or replace
  content: string | Buffer
}

/**
 * Replace the whole content by regex
 */
interface ReplaceByRegexBodyOption {
  type: EditBodyType.replaceByRegex
  // regex pattern
  pattern: string
  // regex pattern flags: "i" ignore case, "g" global replace, "ig" both
  patternFlags?: string
  // content to add or replace
  content: string
}
/**
 * Replace the whole content by string
 */
interface ReplaceBodyOption {
  type: EditBodyType.replace
  // string to replace
  pattern: string
  // content to add or replace
  content: string
}

export type EditBodyOption = SimpleEditBodyOption | ReplaceBodyOption | ReplaceByRegexBodyOption

/**
 * This file is edited after npm run jsonschema
 *
 * This file is the interface of the rule description in Api
 *
 * The rule interface of the proxy server is in the parse-rule file
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
  // list of filters to determine if the current rule is hit, as long as any one is hit
  includes: Filter[]
  // exclude which filters (first hit, then exclude)
  excludes?: Filter[]
  // add which request headers, same will be overwritten
  requestHeaders?: Header[]
  // modify request body
  requestBody?: EditBodyOption
  /**
   * redirect to which url
   *    if the original request url is a.com/b?c=d
   *    rewrite value is b.com/c
   *    then the request will be b.com/c/b?c=d
   *    that is, replace the original domain part
   */
  rewrite?: string
  // don't send network request, directly return file
  responseFile?: ResponseFile
  // return status code
  responseStatus?: number
  // add which response headers, same will be overwritten
  responseHeaders?: Header[]
  // modify response body
  responseBody?: EditBodyOption
  // speed limit: 1 second ?KB
  speedLimit?: number
  // set request and response delay at the same time, unit: ms (low priority)
  delay?: number
  // request delay, unit: ms
  requestDelay?: number
  // response delay, unit: ms
  responseDelay?: number
  // https traffic processing method, ignore, decode, tunnel
  httpsControl?: HttpsControl
}
