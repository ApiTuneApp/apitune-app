import path from 'path'

export default {
  name: 'ApiTune',
  port: 8998,
  proxyHeader: 'x-forwarded-from-apitune',
  // proxy请求对方服务器超时时间
  serverRequestTimeout: 20000,

  // https server 不活跃之后回收时长
  httpsServerExpire: 500000,

  // 密钥目录
  sslDir: path.resolve(__dirname, '../.ssl'),
  // jq 可执行文件路径
  jqPath: path.resolve(__dirname, './bin/jq-osx-amd64'),
  // CA 目录
  caDir: path.resolve(__dirname, '../src/ca'),
  // 可展示的body限制 目前10MB
  // MaxBodyLogSize: 10e6
  MaxBodyLogSize: 10e60,

  RuleDefaultStorageKey: 'rules.default',
  SettingDefaultStorageKey: 'settings.default'
}
