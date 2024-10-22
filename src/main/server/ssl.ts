import { CertErrors } from 'node-easy-cert'
import crtMgr from './cert-manager'

interface Cert {
  cert: string | Buffer
  key: string | Buffer
}

interface ServerCertMap {
  [x: string]: any
}
const serverCertMap: ServerCertMap = {}

export async function getCert(hostname: string): Promise<Cert> {
  return new Promise((resolve, reject) => {
    const cert = serverCertMap[hostname]
    if (cert) {
      resolve(cert)
    }
    crtMgr.mgr.getCertificate(
      hostname,
      (error: Error | CertErrors | null, keyContent: string, certContent: string) => {
        if (error) {
          reject(error)
        } else {
          const cert = {
            cert: certContent,
            key: keyContent
          }
          serverCertMap[hostname] = cert
          resolve(cert)
        }
      }
    )
  })
}
