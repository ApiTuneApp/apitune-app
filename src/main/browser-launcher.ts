import Launcher from '@httptoolkit/browser-launcher'
import log from 'electron-log'

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
          options: ['--disable-extensions']
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
