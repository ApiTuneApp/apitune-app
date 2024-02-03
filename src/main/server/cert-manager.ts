import CertManager from 'node-easy-cert'
import config from './config'

const options = {
  rootDirPath: config.sslDir,
  inMemory: false,
  defaultCertAttrs: [
    { name: 'countryName', value: 'CN' },
    { name: 'organizationName', value: config.name },
    { shortName: 'ST', value: 'SH' },
    { shortName: 'OU', value: `${config.name} SSL Proxy` }
  ]
}

class ExtendedCertManager extends CertManager {
  genRootCa(cb: CertManager.GenerateCallback): void {
    const rootOptions = {
      commonName: 'AnyProxy',
      overwrite: false
    }

    this.generateRootCA(rootOptions, cb)
  }

  ifRootCATrusted(callback?: (error: Error | null, trusted: boolean) => void): boolean {
    // @ts-ignore We should get result from callback, but it's not implemented in node-easy-cert
    super.ifRootCATrusted(callback)
    return false
  }
}

const crtMgr = new ExtendedCertManager(options)

export default crtMgr
