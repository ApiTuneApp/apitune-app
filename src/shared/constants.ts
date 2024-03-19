import { Rules } from './contract'

export const RuleList = [
  Rules.Redirect,
  Rules.SpeedLimit,
  Rules.RequestHeader,
  Rules.RequestBody,
  Rules.RequestBodyJq,
  Rules.RequestFunction,
  Rules.ResponseBody,
  Rules.ResponseBodyJq,
  Rules.ResponseHeader,
  Rules.ResponseStatus,
  Rules.ResponseDelay,
  Rules.ResponseFile,
  Rules.ResponseFunction,
  Rules.Break
]

export const RequestRules = [
  Rules.Redirect,
  Rules.SpeedLimit,
  Rules.RequestHeader,
  Rules.RequestBody,
  Rules.RequestBodyJq,
  Rules.RequestFunction
]

export const ResponseRules = [
  Rules.ResponseBody,
  Rules.ResponseBodyJq,
  Rules.ResponseHeader,
  Rules.ResponseStatus,
  Rules.ResponseDelay,
  Rules.ResponseFile,
  Rules.ResponseFunction,
  Rules.Break
]

export const HTTP_REQUEST_HEADER = [
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Datetime',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Cookie',
  'Content-Disposition',
  'Content-Length',
  'Content-MD5',
  'Content-Type',
  'Date',
  'Expect',
  'From',
  'Host',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'TE',
  'User-Agent',
  'Upgrade',
  'Via',
  'Warning',
  'X-Requested-With',
  'DNT',
  'X-Forwarded-For',
  'X-Forwarded-Host',
  'X-Forwarded-Proto',
  'Front-End-Https',
  'X-Http-Method-Override',
  'X-ATT-DeviceId',
  'X-Wap-Profile',
  'Proxy-Connection',
  'X-UIDH',
  'X-Csrf-Token'
]
export const HTTP_RESPONSE_HEADER = [
  'Access-Control-Allow-Origin',
  'Connection',
  'Content-Encoding',
  'Content-Type',
  'Date',
  'Etag',
  'Keep-Alive',
  'Last-Modified',
  'Server',
  'Set-Cookie',
  'Transfer-Encoding',
  'Vary',
  'X-Backend-Server',
  'X-Cache-Info',
  'X-kuma-revision',
  'x-frame-options'
]
