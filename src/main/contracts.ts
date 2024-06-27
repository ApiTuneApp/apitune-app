import { ParameterizedContext } from 'koa'
import { Log, RuleData } from '../shared/contract'
import { IncomingHttpHeaders } from 'node:http'

export interface IAppState {
  matchedRules: string[]
  matchedRuleDetails: RuleData[]
  requestOptions: {
    method: string
    url: URL
    headers: IncomingHttpHeaders
  }
  requestBody: any
  responseHeaders: { [key: string]: string | string[] }
  responseBody: any
  remoteIp?: string | undefined
  remotePort?: number | undefined
  originInfo?: any
  log: Log
}

export interface IAppContext extends ParameterizedContext<IAppState> {}
