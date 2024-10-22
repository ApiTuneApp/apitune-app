import path from 'path'
import { is } from '@electron-toolkit/utils'

export default {
  name: 'ApiTune',
  port: 8998,
  proxyHeader: 'x-forwarded-from-apitune',
  // proxy request target server timeout
  serverRequestTimeout: 20000,

  // https server not active recycle time
  httpsServerExpire: 500000,

  sslDir: !is.dev ? path.join(process.resourcesPath, '.ssl') : path.resolve(__dirname, '../.ssl'),

  // displayable body limit, currently 10MB
  MaxBodyLogSize: 10e60,

  RuleDefaultStorageKey: 'rules.default',
  SettingDefaultStorageKey: 'settings.default'
}
