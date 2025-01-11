import Launcher from '@httptoolkit/browser-launcher'
import log from 'electron-log'
import os from 'os'
import { spawn } from 'child_process'

function createLauncher(): Promise<typeof Launcher.Launch> {
  return new Promise((resolve, reject) => {
    Launcher('', (err, launch) => {
      if (err) reject(err)
      else resolve(launch)
    })
  })
}

export async function getAvailableBrowsers(): Promise<Launcher.Browser[]> {
  try {
    return new Promise((resolve) => {
      Launcher.detect(resolve)
    })
  } catch (error) {
    log.error('[BrowserLauncher] Failed to detect browsers:', error)
    return []
  }
}

export async function startBrowser(browserType: string, proxyPort: number = 8998): Promise<void> {
  try {
    const launch = await createLauncher()
    return new Promise((resolve, reject) => {
      launch(
        '',
        {
          browser: browserType,
          proxy: `http://127.0.0.1:${proxyPort}`,
          options: [
            '---incognito',
            '--disable-web-security',
            '--disable-extensions',
            '--aggressive-cache-discard',
            '--test-type',
            '--enable-aggressive-domstorage-flushing',
            '--disable-application-cache',
            '--media-cache-size=1',
            '--disk-cache-size=1',
            '--install-autogenerated-theme=23,94,242'
          ]
        },
        (err, instance) => {
          if (err) reject(err)
          else {
            instance.process.on('exit', (code) => {
              log.info(`[BrowserLauncher] Browser process stopped with code ${code}`)
            })
            resolve()
          }
        }
      )
    })
  } catch (error) {
    log.error('[BrowserLauncher] Failed to launch browser:', error)
    throw error
  }
}

export async function launchTerminal(port: number): Promise<void> {
  const platform = os.platform()
  const proxySettings = `export HTTP_PROXY=http://127.0.0.1:${port}
export HTTPS_PROXY=http://127.0.0.1:${port}
export http_proxy=http://127.0.0.1:${port}
export https_proxy=http://127.0.0.1:${port}`

  try {
    switch (platform) {
      case 'darwin': {
        const script = `
tell application "Terminal"
    do script "export HTTP_PROXY=http://127.0.0.1:${port}; export HTTPS_PROXY=http://127.0.0.1:${port}; export http_proxy=http://127.0.0.1:${port}; export https_proxy=http://127.0.0.1:${port}"
    activate
end tell`
        spawn('osascript', ['-e', script])
        break
      }
      case 'win32': {
        const script = `@echo off\r\nset HTTP_PROXY=http://127.0.0.1:${port}\r\nset HTTPS_PROXY=http://127.0.0.1:${port}\r\nset http_proxy=http://127.0.0.1:${port}\r\nset https_proxy=http://127.0.0.1:${port}\r\ncmd.exe`
        spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', script])
        break
      }
      case 'linux': {
        // Try common terminal emulators
        const terminals = ['gnome-terminal', 'konsole', 'xterm']
        const script = `bash -c '${proxySettings}; exec bash'`

        for (const terminal of terminals) {
          try {
            if (terminal === 'gnome-terminal') {
              spawn(terminal, ['--', 'bash', '-c', script])
            } else if (terminal === 'konsole') {
              spawn(terminal, ['-e', script])
            } else {
              spawn(terminal, ['-e', 'bash', '-c', script])
            }
            break
          } catch (e) {
            continue
          }
        }
        break
      }
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  } catch (error) {
    log.error('Failed to launch terminal:', error)
    throw error
  }
}
