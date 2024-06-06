import CertManager from 'node-easy-cert'
import os from 'node:os'

import config from './config'
import { execScriptSync } from './helper'

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
  public commanName: string = 'ApiTuneCA'

  constructor(options: any) {
    this.mgr = new CertManager(options)
  }

  genRootCa(cb: CertManager.GenerateCallback): void {
    const rootOptions = {
      commonName: this.commanName,
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

  genRootCaFilePath(): string {
    return this.mgr.getRootCAFilePath()
  }

  isCertificateInstalled(): boolean {
    let status = false
    let command
    switch (os.platform()) {
      case 'darwin':
        command = `security find-certificate -c ${this.commanName} $HOME/Library/Keychains/login.keychain`
        break
      case 'win32':
        command = `certutil -user -verifystore Root ${this.commanName}`
        break
      default:
        console.log(`${os.platform()} is not supported for systemwide proxy`)
        return false
    }

    try {
      status = !!execScriptSync(command)
      console.log('Found CA already installed')
    } catch (err) {
      console.error(err)
      console.log('CA not found')
    }
    // console.log(status);
    return status
  }

  installRootCA(): any {
    const rootCAPath = this.mgr.getRootDirPath() + '/rootCA.crt'
    let result
    if (os.platform() === 'win32') {
      // Windows
      result = execScriptSync(`certutil -addstore -f "Root" "${rootCAPath}"`)
    } else {
      const command = `osascript -e \
      'do shell script \
      "security add-trusted-cert \
      -r trustRoot \
      -k $HOME/Library/Keychains/login.keychain \\"${rootCAPath}\\"\
      " with prompt "ApiTune wants to store SSL certificate to keychain."'`
      console.log('command', command)
      result = execScriptSync(command)
    }
    return result
  }
}

const crtMgr = new ExtendedCertManager(options)

export default crtMgr
