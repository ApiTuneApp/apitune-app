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

class ExtendedCertManager {
  public mgr: CertManager

  constructor(options: any) {
    this.mgr = new CertManager(options)
  }

  genRootCa(cb: CertManager.GenerateCallback): void {
    const rootOptions = {
      commonName: 'ApiTuneCA',
      overwrite: false
    }

    this.mgr.generateRootCA(rootOptions, cb)
  }

  ifRootCATrusted(callback?: (error: Error | null, trusted: boolean) => void): boolean {
    try {
      // @ts-ignore We should get result from callback, but it's not implemented in node-easy-cert
      this.mgr.ifRootCATrusted(callback)
    } catch (error) {
      console.error('Failed to check if Root CA is trusted:', error)
    }
    return false
  }

  isRootCAExists(): boolean {
    try {
      return this.mgr.isRootCAFileExists()
    } catch (error) {
      console.error('Failed to check if Root CA is trusted:', error)
    }
    return false
  }

  getRootDirPath(): string {
    return this.mgr.getRootDirPath()
  }
}

const crtMgr = new ExtendedCertManager(options)

export default crtMgr
