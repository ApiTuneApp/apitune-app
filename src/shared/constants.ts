import { RuleType } from './contract'

export const RuleList = [
  RuleType.Rewrite,
  RuleType.RequestSpeedLimit,
  RuleType.RequestHeader,
  RuleType.RequestBody,
  RuleType.RequestBodyJq,
  RuleType.RequestFunction,
  RuleType.ResponseBody,
  RuleType.ResponseBodyJq,
  RuleType.ResponseHeader,
  RuleType.ResponseStatus,
  RuleType.ResponseDelay,
  RuleType.ResponseFile,
  RuleType.ResponseFunction,
  RuleType.Break
]

export const RequestRules = [
  RuleType.Rewrite,
  RuleType.RequestSpeedLimit,
  RuleType.RequestHeader,
  RuleType.RequestBody,
  RuleType.RequestBodyJq,
  RuleType.RequestFunction
]

export const ResponseRules = [
  RuleType.ResponseBody,
  RuleType.ResponseBodyJq,
  RuleType.ResponseHeader,
  RuleType.ResponseStatus,
  RuleType.ResponseDelay,
  RuleType.ResponseFile,
  RuleType.ResponseFunction,
  RuleType.Break
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
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Headers',
  'Access-Control-Allow-Credentials',
  'Access-Control-Max-Age',
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

export const HTTP_STATUS_CODE = [
  {
    value: 100,
    label: 'Continue'
  },
  {
    value: 101,
    label: 'Switching Protocols'
  },
  {
    value: 200,
    label: 'OK'
  },
  {
    value: 201,
    label: 'Created'
  },
  {
    value: 202,
    label: 'Accepted'
  },
  {
    value: 203,
    label: 'Non-Authoritative Information'
  },
  {
    value: 204,
    label: 'No Content'
  },
  {
    value: 205,
    label: 'Reset Content'
  },
  {
    value: 206,
    label: 'Partial Content'
  },
  {
    value: 300,
    label: 'Multiple Choices'
  },
  {
    value: 301,
    label: 'Moved Permanently'
  },
  {
    value: 302,
    label: 'Found'
  },
  {
    value: 303,
    label: 'See Other'
  },
  {
    value: 304,
    label: 'Not Modified'
  },
  {
    value: 305,
    label: 'Use Proxy'
  },
  {
    value: 307,
    label: 'Temporary Redirect'
  },
  {
    value: 400,
    label: 'Bad Request'
  },
  {
    value: 401,
    label: 'Unauthorized'
  },
  {
    value: 402,
    label: 'Payment Required'
  },
  {
    value: 403,
    label: 'Forbidden'
  },
  {
    value: 404,
    label: 'Not Found'
  },
  {
    value: 405,
    label: 'Method Not Allowed'
  },
  {
    value: 406,
    label: 'Not Acceptable'
  },
  {
    value: 407,
    label: 'Proxy Authentication Required'
  },
  {
    value: 408,
    label: 'Request Timeout'
  },
  {
    value: 409,
    label: 'Conflict'
  },
  {
    value: 410,
    label: 'Gone'
  },
  {
    value: 411,
    label: 'Length Required'
  },
  {
    value: 412,
    label: 'Precondition Failed'
  },
  {
    value: 413,
    label: 'Payload Too Large'
  },
  {
    value: 414,
    label: 'URI Too Long'
  },
  {
    value: 415,
    label: 'Unsupported Media Type'
  },
  {
    value: 416,
    label: 'Range Not Satisfiable'
  },
  {
    value: 417,
    label: 'Expectation Failed'
  },
  {
    value: 426,
    label: 'Upgrade Required'
  },
  {
    value: 428,
    label: 'Precondition Required'
  },
  {
    value: 429,
    label: 'Too Many Requests'
  },
  {
    value: 431,
    label: 'Request Header Fields Too Large'
  },
  {
    value: 500,
    label: 'Internal Server Error'
  },
  {
    value: 501,
    label: 'Not Implemented'
  },
  {
    value: 502,
    label: 'Bad Gateway'
  },
  {
    value: 503,
    label: 'Service Unavailable'
  },
  {
    value: 504,
    label: 'Gateway Timeout'
  },
  {
    value: 505,
    label: 'HTTP Version Not Supported'
  },
  {
    value: 511,
    label: 'Network Authentication Required'
  }
]

export const ReqMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH', 'CONNECT']

export const RequestRuleKeys: RuleType[] = [
  RuleType.Rewrite,
  RuleType.RequestHeader,
  RuleType.RequestBody,
  RuleType.RequestBodyJq,
  RuleType.RequestFunction
]

export const ResponseRuleKeys: RuleType[] = [
  RuleType.ResponseStatus,
  RuleType.ResponseHeader,
  RuleType.ResponseFunction,
  RuleType.ResponseBody,
  RuleType.ResponseBodyJq,
  RuleType.ResponseDelay,
  RuleType.RequestSpeedLimit
]

export const MAX_FREE_RULES = 3
export const MAX_FREE_LOGS = 3
export const MAX_FREE_TESTS = 3
