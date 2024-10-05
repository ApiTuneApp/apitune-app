import { CertErrors } from 'node-easy-cert'
import crtMgr from '../server/cert-manager'
import { execScriptSync } from '../server/helper'

const command = process.argv[2]

console.log('Run command', command)

if (command === 'genRootCa') {
  crtMgr.genRootCa((error: Error | CertErrors | null, keyPath: string, crtPath: string) => {
    if (error) {
      console.error(error)
    } else {
      console.log(keyPath, crtPath)
    }
  })
} else if (command === 'status') {
  const isRootCAFileExists = crtMgr.isRootCAExists()
  const ifRootCATrusted = crtMgr.ifRootCATrusted()
  const rootDirPath = crtMgr.getRootDirPath()
  const rootCAPath = crtMgr.genRootCaFilePath()
  const isCertificateInstalled = crtMgr.isCertificateInstalled()

  console.log('Root CA file exists:', isRootCAFileExists)
  console.log('Root CA is trusted:', ifRootCATrusted)
  console.log('Root CA is installed:', isCertificateInstalled)
  console.log('Root directory path:', rootDirPath)
  console.log('Root CA file path:', rootCAPath)
} else if (command === 'trust') {
  const isRootCAFileExists = crtMgr.isRootCAExists()
  const ifRootCATrusted = crtMgr.ifRootCATrusted()
  if (!isRootCAFileExists) {
    console.error('Root CA file does not exist')
    process.exit(1)
  } else if (ifRootCATrusted) {
    console.error('Root CA is already trusted')
    process.exit(1)
  } else {
    console.log('About to trust the root CA, this may requires your password')
    const result = execScriptSync(
      `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${crtMgr.getRootDirPath()}/rootCA.crt`
    )
    if (result.status === 0) {
      console.log('Root CA is trusted')
    } else {
      console.error('Failed to trust the root CA')
      process.exit(1)
    }
  }
} else {
  console.log('Unknown command', command)
}
