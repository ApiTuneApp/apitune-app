import { CertErrors } from 'node-easy-cert'
// const Ca = require('./ca/index.js');
// import config from './config'
import crtMgr from './cert-manager'

interface Cert {
  cert: string | Buffer
  key: string | Buffer
}

// const caPromise = promisify(Ca.create, Ca)(config.sslDir, config.caDir)
interface ServerCertMap {
  [x: string]: any
}
const serverCertMap: ServerCertMap = {}

// export async function getCert(hostname: string): Promise<Cert> {
//   let cert = serverCertMap[hostname]
//   if (cert) {
//     return cert
//   }
//   const ca = await caPromise

//   try {
//     // 获取之前生成的密钥
//     const fileRes = await promisify(ca.readServerCertificateKeys, ca)('*.' + hostname)
//     return fileRes
//   } catch (e) {
//     // 之前没有生成过
//   }
//   return new Promise((resolve) => {
//     // 生成新的key
//     ca.generateServerCertificateKeys(['*.' + hostname, hostname], (cert: string, key: string) => {
//       resolve({
//         cert,
//         key,
//       })
//     })
//   })
// }

export async function getCert(hostname: string): Promise<Cert> {
  return new Promise((resolve, reject) => {
    const cert = serverCertMap[hostname]
    if (cert) {
      resolve(cert)
    }
    crtMgr.getCertificate(
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
