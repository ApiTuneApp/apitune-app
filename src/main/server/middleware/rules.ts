import { Context, Next } from 'koa'
import { EditBodyType } from '../contracts'
import { responseBody } from '../rule-utils'

export default async function RulesMiddleware(ctx: Context, next: Next) {
  // send request, get data
  await next()

  // mock res data
  // responseBody(ctx, {
  //   type: EditBodyType.overwrite,
  //   content: Buffer.from(
  //     JSON.stringify({
  //       data: 'mock data'
  //     })
  //   )
  // })
}
