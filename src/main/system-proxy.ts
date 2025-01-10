import { execSync } from 'child_process'
import log from 'electron-log/main'
import config from './server/config'

export function enableSystemProxy(port: number = config.port): void {
  try {
    // Enable system proxy for macOS
    execSync(`networksetup -setwebproxy "Wi-Fi" 127.0.0.1 ${port}`)
    execSync(`networksetup -setsecurewebproxy "Wi-Fi" 127.0.0.1 ${port}`)
    log.info('System proxy enabled')
  } catch (error) {
    log.error('Failed to enable system proxy:', error)
    throw error
  }
}

export function disableSystemProxy(): void {
  try {
    // Disable system proxy for macOS
    execSync('networksetup -setwebproxystate "Wi-Fi" off')
    execSync('networksetup -setsecurewebproxystate "Wi-Fi" off')
    log.info('System proxy disabled')
  } catch (error) {
    log.error('Failed to disable system proxy:', error)
    throw error
  }
}

export function isSystemProxyEnabled(): boolean {
  try {
    // Check if system proxy is enabled for macOS
    const httpProxy = execSync('networksetup -getwebproxy "Wi-Fi"').toString()
    const httpsProxy = execSync('networksetup -getsecurewebproxy "Wi-Fi"').toString()
    return httpProxy.includes('Enabled: Yes') && httpsProxy.includes('Enabled: Yes')
  } catch (error) {
    log.error('Failed to check system proxy status:', error)
    return false
  }
}
