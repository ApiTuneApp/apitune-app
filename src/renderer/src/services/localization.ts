import LocalizedStrings from 'react-localization'

export const strings = new LocalizedStrings({
  en: {
    backHome: 'Back Homepage',
    settings: 'Settings',
    caInstalled: 'ApiTune CA Certificate Installed',
    caNotTrust: 'ApiTune CA Certificate Not Trusted',
    trustCa: 'Trust ApiTune CA',
    requireRoot: 'Require root privileges',
    exportCa: 'Export CA File',
    update: 'Update',
    ca: 'CA',
    proxyPort: 'Proxy Port',
    themes: 'Themes',
    language: 'Language'
  },
  zh: {
    backHome: '返回首页',
    settings: '设置',
    caInstalled: 'ApiTune CA 证书已安装',
    caNotTrust: 'ApiTune CA 证书未受信任',
    trustCa: '信任 ApiTune CA',
    requireRoot: '需要 root 权限',
    exportCa: '导出 CA 文件',
    update: '更新',
    ca: '证书',
    proxyPort: '代理端口',
    themes: '主题',
    language: '语言'
  }
})
