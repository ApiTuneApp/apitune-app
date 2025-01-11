import { execSync } from 'child_process'
import log from 'electron-log/main'
import config from './server/config'
import os from 'os'

type Platform = 'darwin' | 'win32' | 'linux'

function getPlatform(): Platform {
  const platform = os.platform()
  if (platform !== 'darwin' && platform !== 'win32' && platform !== 'linux') {
    throw new Error(`Unsupported platform: ${platform}`)
  }
  return platform
}

export function enableSystemProxy(port: number = config.port): void {
  try {
    const platform = getPlatform()

    switch (platform) {
      case 'darwin':
        // Enable system proxy for macOS
        execSync(`networksetup -setwebproxy "Wi-Fi" 127.0.0.1 ${port}`)
        execSync(`networksetup -setsecurewebproxy "Wi-Fi" 127.0.0.1 ${port}`)
        break
      case 'win32': {
        try {
          // Set WinINet proxy
          execSync(
            `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d "127.0.0.1:${port}" /f`
          )
          execSync(
            `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f`
          )
        } catch (err) {
          throw new Error(
            'Failed to set Windows proxy. Please ensure you have administrator privileges.'
          )
        }
        break
      }
      case 'linux':
        // Enable system proxy for Linux (GNOME)
        execSync(`gsettings set org.gnome.system.proxy mode 'manual'`)
        execSync(`gsettings set org.gnome.system.proxy.http host '127.0.0.1'`)
        execSync(`gsettings set org.gnome.system.proxy.http port ${port}`)
        execSync(`gsettings set org.gnome.system.proxy.https host '127.0.0.1'`)
        execSync(`gsettings set org.gnome.system.proxy.https port ${port}`)
        break
    }
    log.info(`System proxy enabled on ${platform}`)
  } catch (error) {
    log.error('Failed to enable system proxy:', error)
    throw error
  }
}

export function disableSystemProxy(): void {
  try {
    const platform = getPlatform()

    switch (platform) {
      case 'darwin':
        // Disable system proxy for macOS
        execSync('networksetup -setwebproxystate "Wi-Fi" off')
        execSync('networksetup -setsecurewebproxystate "Wi-Fi" off')
        break
      case 'win32': {
        try {
          // Disable WinINet proxy
          execSync(
            `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f`
          )
        } catch (err) {
          throw new Error('Failed to disable Windows proxy. Please run as administrator.')
        }
        break
      }
      case 'linux':
        // Disable system proxy for Linux (GNOME)
        execSync('gsettings set org.gnome.system.proxy mode "none"')
        break
    }
    log.info(`System proxy disabled on ${platform}`)
  } catch (error) {
    log.error('Failed to disable system proxy:', error)
    throw error
  }
}

export function isSystemProxyEnabled(): boolean {
  try {
    const platform = getPlatform()

    switch (platform) {
      case 'darwin': {
        // Check if system proxy is enabled for macOS
        const httpProxy = execSync('networksetup -getwebproxy "Wi-Fi"').toString()
        const httpsProxy = execSync('networksetup -getsecurewebproxy "Wi-Fi"').toString()
        return httpProxy.includes('Enabled: Yes') && httpsProxy.includes('Enabled: Yes')
      }
      case 'win32': {
        // Check if system proxy is enabled for Windows
        const proxyInfo = execSync('netsh winhttp show proxy').toString()
        return proxyInfo.includes('127.0.0.1')
      }
      case 'linux': {
        // Check if system proxy is enabled for Linux (GNOME)
        const proxyMode = execSync('gsettings get org.gnome.system.proxy mode').toString().trim()
        return proxyMode === "'manual'"
      }
      default:
        return false
    }
  } catch (error) {
    log.error('Failed to check system proxy status:', error)
    return false
  }
}
