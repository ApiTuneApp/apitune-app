import { app, BrowserWindow, clipboard, dialog, ipcMain, shell } from 'electron'
import Storage from 'electron-json-storage'
import log from 'electron-log/main'
import { autoUpdater, UpdateInfo } from 'electron-updater'
import { nativeTheme } from 'electron/main'
import fs from 'fs'
import ip from 'ip'
import path, { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
// import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer'

import { electronApp, is, optimizer } from '@electron-toolkit/utils'

import icon from '../../resources/icon.png?asset'
import {
  AddGroupOpts,
  ApiRules,
  CaEventType,
  EventResultStatus,
  RenderEvent,
  RuleData,
  RuleGroup,
  RuleStorage,
  ShareRule,
  Subscription,
  SyncInfo,
  Theme,
  UpdateSettingsParams
} from '../shared/contract'
import { findGroupOrRule, findParentGroup } from '../shared/utils'
import { getAuthCode, initCommunicator, openShare, updateProgress } from './communicator'
import crtMgr from './server/cert-manager'
import config from './server/config'
import { changeServerPort, initServer } from './server/init'
import {
  DefaultRuleData,
  DefaultSettingData,
  initRuntimeRules,
  initSettingData,
  LogTestResult,
  MemeoryLogStorage,
  PrintStorage,
  SubscriptionStorage,
  updateRuntimeRules,
  updateSettingData
} from './storage'
import { getAvailableBrowsers, startBrowser, launchTerminal } from './browser-launcher'
import { enableSystemProxy, disableSystemProxy, isSystemProxyEnabled } from './system-proxy'

const APP_SITE_URL = import.meta.env.VITE_SITE_URL

autoUpdater.logger = log
log.transports.file.level = 'info'

autoUpdater.forceDevUpdateConfig = true

autoUpdater.autoDownload = false

let progressDialog: Electron.MessageBoxReturnValue | null = null
let showProgress = true

// 3. add URL handling function
function handleUrl(url: string) {
  if (!url.startsWith('apitune://')) return

  const parsedUrl = new URL(url)
  const host = parsedUrl.host
  if (host === 'share') {
    const shareId = parsedUrl.searchParams.get('id')
    if (shareId) {
      openShare(shareId)
    }
  } else if (host === 'login') {
    const accessToken = parsedUrl.searchParams.get('access_token')
    const refreshToken = parsedUrl.searchParams.get('refresh_token')
    if (accessToken && refreshToken) {
      getAuthCode(accessToken, refreshToken)
    }
  }
}

autoUpdater.on('update-available', (releaseInfo: UpdateInfo) => {
  log.info('[AutoUpdater] update-available', releaseInfo)
  const local = app.getLocale()
  let title = 'Update Available'
  let message = 'A new version is available. Would you like to download it now?'
  let buttons = ['Download', 'Later']
  if (local && local.includes('zh')) {
    title = '发现新版本'
    message = '发现新版本，是否现在下载？'
    buttons = ['下载', '稍后']
  }
  dialog
    .showMessageBox({
      type: 'info',
      title,
      message,
      buttons
    })
    .then((buttonIndex) => {
      if (buttonIndex.response === 0) {
        autoUpdater.downloadUpdate()
      }
    })
  showProgress = true
})

autoUpdater.on('error', (error: Error) => {
  log.error('[AutoUpdater] error', error)
  progressDialog = null
  showProgress = true
})

autoUpdater.on('update-downloaded', () => {
  progressDialog = null
  showProgress = true

  const local = app.getLocale()
  let title = 'Update Ready'
  let message = 'Update has been downloaded. Install now?'
  let buttons = ['Install', 'Later']
  if (local && local.includes('zh')) {
    title = '更新就绪'
    message = '更新已下载完成，是否现在安装？'
    buttons = ['安装', '稍后']
  }
  dialog
    .showMessageBox({
      type: 'info',
      title,
      message,
      buttons
    })
    .then((buttonIndex) => {
      if (buttonIndex.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})

autoUpdater.on('download-progress', async (progressObj) => {
  if (!progressObj || !progressObj.percent) return
  const progress = Math.round(progressObj.percent)
  updateProgress(progress)
})

const init = async () => {
  await initSettingData()
  DefaultSettingData.systemWideProxy = isSystemProxyEnabled()
}
init()

// TODO: handle default port is in use
initServer(DefaultSettingData.port)

// 1. make sure the app is set as default protocol client
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('apitune', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('apitune')
}

// 2. add second-instance event handler
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // when the second instance is running, the main instance will receive this event
    const mainWindow = BrowserWindow.getAllWindows()[0]

    // handle protocol URL
    const url = commandLine.pop()
    if (url) {
      handleUrl(url)
    }

    // focus main window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // 4. handle URL when starting from command line
  app.on('ready', () => {
    // handle URL when starting from protocol on Windows
    const args = process.argv
    if (args.length > 1) {
      handleUrl(args[args.length - 1])
    }
  })

  // 5. keep the original open-url event handler (mainly for macOS)
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleUrl(url)
  })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
    // titleBarStyle: 'hidden'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  initCommunicator(mainWindow)
  initRuntimeRules()

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.apitune.app')

  autoUpdater.checkForUpdatesAndNotify()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('open-url', (event, url) => {
    event.preventDefault()
    const parsedUrl = new URL(url)
    const host = parsedUrl.host
    if (host === 'share') {
      const shareId = parsedUrl.searchParams.get('id')
      if (shareId) {
        openShare(shareId)
      }
    } else if (host === 'login') {
      const accessToken = parsedUrl.searchParams.get('access_token')
      const refreshToken = parsedUrl.searchParams.get('refresh_token')
      if (accessToken && refreshToken) {
        getAuthCode(accessToken, refreshToken)
      }
    }
  })

  ipcMain.handle(RenderEvent.AddRule, (event, rules: string, opts?: AddGroupOpts) => {
    return new Promise((resolve, reject) => {
      try {
        const ruleObj = JSON.parse(rules) as RuleData
        if (typeof ruleObj.enable === 'undefined') {
          ruleObj.enable = true
        }
        ruleObj.updateTime = new Date().getTime()
        // TODO: generate storage key with user name and workspace name
        const key = opts?.storageKey || config.RuleDefaultStorageKey
        let data = Storage.getSync(key) as RuleStorage
        if (data) {
          if (data.apiRules) {
            if (opts?.groupId) {
              const group = data.apiRules.find((g) => g.id === opts.groupId) as RuleGroup
              if (group) {
                group.ruleList.push(ruleObj)
              } else {
                reject({
                  status: EventResultStatus.Error,
                  error: 'Group not found'
                })
              }
            } else {
              data.apiRules.push(ruleObj)
            }
          } else {
            data.apiRules = [ruleObj]
          }
          ruleObj.id = uuidv4()
        } else {
          data = DefaultRuleData
        }
        Storage.set(key, data, (error) => {
          if (error) {
            log.error('[AddRule] Failed to storage rule:', error)
            reject({
              status: EventResultStatus.Error,
              error: error.message
            })
          } else {
            updateRuntimeRules(data.apiRules)
            resolve({
              status: EventResultStatus.Success,
              data: ruleObj
            })
          }
        })
      } catch (error) {
        log.error('[AddRule] Failed', error)
        reject({
          status: EventResultStatus.Error,
          error: error
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.UpdateRule, (event, id: string, rules: string) => {
    return new Promise((resolve, reject) => {
      try {
        const ruleObj = JSON.parse(rules) as RuleData
        const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
        ruleObj.updateTime = new Date().getTime()
        if (data) {
          if (data.apiRules) {
            const rule = findGroupOrRule(data.apiRules, id)
            if (rule) {
              Object.assign(rule, ruleObj)
              data.updatedAt = new Date().getTime()
              Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                if (error) {
                  log.error('[UpdateRule] Failed to storage rule:', error)
                  reject({
                    status: EventResultStatus.Error,
                    error: error.message
                  })
                } else {
                  updateRuntimeRules(data.apiRules)
                  resolve({
                    status: EventResultStatus.Success
                  })
                }
              })
            } else {
              reject({
                status: EventResultStatus.Error,
                error: 'Rule not found'
              })
            }
          } else {
            reject({
              status: EventResultStatus.Error,
              error: 'Rules not found'
            })
          }
        } else {
          reject({
            status: EventResultStatus.Error,
            error: 'User data not found'
          })
        }
      } catch (error) {
        log.error('[UpdateRule] Failed', error)
        reject({
          status: EventResultStatus.Error,
          error: error
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.EditRuleGroup, (event, ruleId: string, groupId?: string) => {
    return new Promise((resolve, reject) => {
      const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
      if (data) {
        const rule = findGroupOrRule(data.apiRules, ruleId) as RuleData
        const parentGroup = findParentGroup(data.apiRules, ruleId)
        if (!groupId) {
          // if groupId is not provided, we will remove the rule from its current group
          if (parentGroup) {
            if (rule) {
              parentGroup.ruleList = parentGroup.ruleList.filter((r) => r.id !== ruleId)
              // put the rule to the root
              data.apiRules.push(rule)
            }
          }
        } else {
          // if groupId is provided, we will move the rule to the new group
          const group = findGroupOrRule(data.apiRules, groupId) as RuleGroup
          if (parentGroup) {
            // remove rule from old group
            parentGroup.ruleList = parentGroup.ruleList.filter((r) => r.id !== ruleId)
          } else {
            // remove rule from root
            data.apiRules = data.apiRules.filter((r) => r.id !== ruleId)
          }
          if (group) {
            group.ruleList.push(rule)
          }
        }
        data.updatedAt = new Date().getTime()
        Storage.set(config.RuleDefaultStorageKey, data, (error) => {
          if (error) {
            log.error('[EditRuleGroup] Failed to storage rule', error)
          } else {
            updateRuntimeRules(data.apiRules)
            resolve({
              status: EventResultStatus.Success
            })
          }
        })
      } else {
        reject({
          status: EventResultStatus.Error,
          error: 'User data not found'
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.EnableRule, (event, id: string, enable: boolean) => {
    return new Promise((resolve, reject) => {
      try {
        const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
        if (data) {
          if (data.apiRules) {
            const rule = findGroupOrRule(data.apiRules, id)
            if (rule) {
              rule.enable = enable
              rule.updateTime = new Date().getTime()
              data.updatedAt = new Date().getTime()
              Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                if (error) {
                  log.error('[EnableRule] Failed to storage rule', error)
                  reject({
                    status: EventResultStatus.Error,
                    error: error.message
                  })
                } else {
                  updateRuntimeRules(data.apiRules)
                  resolve({
                    status: EventResultStatus.Success
                  })
                }
              })
            } else {
              reject({
                status: EventResultStatus.Error,
                error: 'Rule not found'
              })
            }
          } else {
            reject({
              status: EventResultStatus.Error,
              error: 'Rules not found'
            })
          }
        } else {
          reject({
            status: EventResultStatus.Error,
            error: 'User data not found'
          })
        }
      } catch (error) {
        log.error('[EnableRule] Failed', error)
        reject({
          status: EventResultStatus.Error,
          error: error
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.DuplicateRules, (event, rule: string) => {
    return new Promise((resolve, reject) => {
      try {
        const ruleObj = JSON.parse(rule) as ShareRule
        const ruleData = ruleObj.rule_data
        ruleData.updateTime = new Date().getTime()
        ruleData.shareFrom = ruleObj.id
        ruleData.id = uuidv4()
        ruleData.enable = false
        if (ruleData.kind === 'group') {
          // Regenerate all rule ids in the group
          ruleData.ruleList.forEach((r) => {
            r.id = uuidv4()
            r.enable = false
          })
        }
        const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
        if (data) {
          data.apiRules.push(ruleData)
          Storage.set(config.RuleDefaultStorageKey, data, (error) => {
            if (error) {
              log.error('[DuplicateRules] Failed to storage rule', error)
            } else {
              updateRuntimeRules(data.apiRules)
              resolve({
                status: EventResultStatus.Success,
                data: ruleData
              })
            }
          })
        } else {
          reject({
            status: EventResultStatus.Error,
            error: 'User data not found'
          })
        }
      } catch (error) {
        log.error('[DuplicateRules] Failed', error)
        reject({
          status: EventResultStatus.Error,
          error: error
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.UpdateRuleGroupName, (event, id: string, ruleName: string) => {
    return new Promise((resolve, reject) => {
      try {
        const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
        if (data) {
          if (data.apiRules) {
            const rule = data.apiRules.find((r) => r.id === id)
            if (rule) {
              rule.name = ruleName
              rule.updateTime = new Date().getTime()
              data.updatedAt = new Date().getTime()
              Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                if (error) {
                  log.error('[UpdateRuleGroupName] Failed to storage rule', error)
                  reject({
                    status: EventResultStatus.Error,
                    error: error.message
                  })
                } else {
                  updateRuntimeRules(data.apiRules)
                  resolve({
                    status: EventResultStatus.Success
                  })
                }
              })
            } else {
              reject({
                status: EventResultStatus.Error,
                error: 'Rule not found'
              })
            }
          } else {
            reject({
              status: EventResultStatus.Error,
              error: 'Rules not found'
            })
          }
        } else {
          reject({
            status: EventResultStatus.Error,
            error: 'User data not found'
          })
        }
      } catch (error) {
        log.error('[UpdateRuleGroupName] Failed', error)
        reject({
          status: EventResultStatus.Error,
          error: error
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.DeleteRule, (event, id: string) => {
    return new Promise((resolve, reject) => {
      try {
        const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
        if (data) {
          if (data.apiRules) {
            const curRule = findGroupOrRule(data.apiRules, id)
            if (curRule?.kind === 'group') {
              const index = data.apiRules.findIndex((r) => r.id === id)
              data.apiRules.splice(index, 1)
              data.updatedAt = new Date().getTime()
              Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                if (error) {
                  log.error('[DeleteRule][group] Failed to storage rule', error)
                  resolve({
                    status: EventResultStatus.Error,
                    error: error.message
                  })
                } else {
                  updateRuntimeRules(data.apiRules)
                  resolve({
                    status: EventResultStatus.Success
                  })
                }
              })
            } else if (curRule?.kind === 'rule') {
              const group = data.apiRules.find((g) => {
                if (g.kind === 'group') {
                  return g.ruleList.find((r) => r.id === id)
                }
                return false
              }) as RuleGroup
              if (group) {
                const index = group.ruleList.findIndex((r) => r.id === id)
                group.ruleList.splice(index, 1)
                data.updatedAt = new Date().getTime()
                Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                  if (error) {
                    log.error('[DeleteRule][rule] Failed to storage rule', error)
                    resolve({
                      status: EventResultStatus.Error,
                      error: error.message
                    })
                  } else {
                    updateRuntimeRules(data.apiRules)
                    resolve({
                      status: EventResultStatus.Success
                    })
                  }
                })
              } else {
                const index = data.apiRules.findIndex((r) => r.id === id)
                if (index !== -1) {
                  data.apiRules.splice(index, 1)
                  data.updatedAt = new Date().getTime()
                  Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                    if (error) {
                      log.error('[DeleteRule][rule] Failed to storage rule', error)
                      resolve({
                        status: EventResultStatus.Error,
                        error: error.message
                      })
                    } else {
                      updateRuntimeRules(data.apiRules)
                      resolve({
                        status: EventResultStatus.Success
                      })
                    }
                  })
                } else {
                  resolve({
                    status: EventResultStatus.Error,
                    error: 'Rule not found'
                  })
                }
              }
            } else {
              resolve({
                status: EventResultStatus.Error,
                error: 'Rule not found'
              })
            }
          } else {
            resolve({
              status: EventResultStatus.Error,
              error: 'Rules not found'
            })
          }
        } else {
          resolve({
            status: EventResultStatus.Error,
            error: 'User data not found'
          })
        }
      } catch (error) {
        log.error('[DeleteRule] Failed', error)
        resolve({
          status: EventResultStatus.Error,
          error: error
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.GetApiRules, (event) => {
    return new Promise((resolve, reject) => {
      try {
        Storage.get(config.RuleDefaultStorageKey, (error, data) => {
          if (data) {
            resolve(data.apiRules || [])
          } else {
            resolve([])
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  })

  ipcMain.handle(RenderEvent.GetRuleStorage, (event) => {
    return new Promise((resolve, reject) => {
      try {
        const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
        if (data) {
          resolve(data)
        } else {
          resolve([])
        }
      } catch (error) {
        reject(error)
      }
    })
  })

  ipcMain.on(RenderEvent.SetSyncInfo, (_, syncInfo) => {
    try {
      const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
      if (data) {
        data.syncInfo = syncInfo
        Storage.set(config.RuleDefaultStorageKey, data, (error) => {
          if (error) {
            log.error('[SetSyncInfo] Failed to storage rule', error)
          }
        })
      }
    } catch (error) {
      log.error('[SetSyncInfo] Failed', error)
    }
  })

  ipcMain.handle(RenderEvent.GetSettings, (event) => {
    return new Promise((resolve, reject) => {
      const local = app.getLocale() // en-US
      // const sysLocal = app.getSystemLocale() // en-CN
      // const lang = app.getPreferredSystemLanguages() [ 'en-CN', 'zh-Hans-CN' ]
      try {
        const data = Storage.getSync(config.SettingDefaultStorageKey)
        if (data) {
          // Should init theme to make prefers-color-scheme work
          if (data.theme !== 'system') {
            nativeTheme.themeSource = data.theme
          }
          if (!data.language) {
            if (local && local.includes('zh')) {
              data.language = 'zh'
            } else {
              data.language = 'en'
            }
          }
          resolve(data)
        } else {
          if (local && local.includes('zh')) {
            DefaultSettingData.language = 'zh'
          } else {
            DefaultSettingData.language = 'en'
          }
          resolve(DefaultSettingData)
        }
      } catch (error) {
        reject(error)
      }
    })
  })

  ipcMain.handle(RenderEvent.ChangePort, (event, port: number) => {
    return new Promise((resolve, reject) => {
      changeServerPort(
        port,
        () => {
          updateSettingData({
            port: port
          })
          resolve({
            status: EventResultStatus.Success
          })
        },
        (error) => {
          log.error('[ChangePort] Failed', error)
          reject({
            status: EventResultStatus.Error,
            error: error.message
          })
        }
      )
    })
  })

  ipcMain.handle(RenderEvent.ChangeTheme, (event, theme: Theme) => {
    return new Promise((resolve, reject) => {
      nativeTheme.themeSource = theme
      updateSettingData({
        theme: theme
      })
      resolve({
        status: EventResultStatus.Success
      })
    })
  })

  ipcMain.handle(RenderEvent.GetAppTheme, (event) => {
    return new Promise((resolve, reject) => {
      try {
        resolve(nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
      } catch (error) {
        resolve('light')
      }
    })
  })

  ipcMain.handle(RenderEvent.GetLanguage, (event) => {
    return new Promise((resolve, reject) => {
      try {
        const local = app.getLocale() // en-US
        if (local && local.includes('zh')) {
          resolve('zh')
        } else {
          resolve('en')
        }
      } catch (error) {
        resolve('en')
      }
    })
  })

  ipcMain.handle(RenderEvent.ChangeLanguage, (event, language: 'zh' | 'en') => {
    return new Promise((resolve, reject) => {
      updateSettingData({
        language
      })
      resolve({
        status: EventResultStatus.Success
      })
    })
  })

  ipcMain.handle(RenderEvent.GetIP, (event) => {
    return ip.address()
  })

  ipcMain.handle(RenderEvent.CA, (_event, type: CaEventType) => {
    if (type === 'status') {
      return new Promise((resolve, reject) => {
        // Usually root CA is generated when the app is first launched
        const isRootCAFileExists = crtMgr.isRootCAExists()
        const isRootCATrusted = crtMgr.ifRootCATrusted()
        const isCertificateInstalled = crtMgr.isCertificateInstalled()
        resolve({
          status: EventResultStatus.Success,
          data: {
            isRootCAFileExists,
            isRootCATrusted,
            isCertificateInstalled
          }
        })
      })
    } else if (type === 'genRoot') {
      return new Promise((resolve, reject) => {
        crtMgr.genRootCa((error, keyPath: string, crtPath: string) => {
          if (error) {
            resolve({
              status: EventResultStatus.Error,
              error: 'Failed to generate Root CA'
            })
          } else {
            resolve({
              status: EventResultStatus.Success,
              data: {
                keyPath,
                crtPath
              }
            })
          }
        })
      })
    } else if (type === 'trust') {
      const isRootCAFileExists = crtMgr.isRootCAExists()
      const ifRootCATrusted = crtMgr.ifRootCATrusted()
      return new Promise((resolve, reject) => {
        if (!isRootCAFileExists) {
          resolve({
            status: EventResultStatus.Error,
            error: 'Root CA not exists'
          })
        } else if (ifRootCATrusted) {
          resolve({
            status: EventResultStatus.Error,
            error: 'Root CA is already trusted'
          })
        } else {
          crtMgr.installRootCA().then((result) => {
            if (result.error) {
              log.error('[CA] Failed to trust Root CA:', result.error)
              resolve({
                status: EventResultStatus.Error,
                error: 'Failed to trust Root CA'
              })
            } else {
              resolve({
                status: EventResultStatus.Success
              })
            }
          })
        }
      })
    } else if (type === 'export') {
      const caPath = crtMgr.genRootCaFilePath()
      return new Promise((resolve) => {
        dialog
          .showSaveDialog({
            title: 'Export Root CA',
            defaultPath: caPath,
            filters: [{ name: 'CRT Files', extensions: ['crt'] }]
          })
          .then((result) => {
            if (result.canceled) {
              resolve({
                status: EventResultStatus.Error,
                error: 'Export canceled'
              })
            } else {
              if (result.filePath) {
                // Copy file to the selected path with fs
                const sourcePath = crtMgr.genRootCaFilePath()
                const destinationPath = result.filePath
                fs.copyFile(sourcePath, destinationPath, (error) => {
                  if (error) {
                    log.error('[CA] Failed to copy file:', error)
                    resolve({
                      status: EventResultStatus.Error,
                      error: 'Failed to copy file'
                    })
                  } else {
                    resolve({
                      status: EventResultStatus.Success
                    })
                  }
                })
              }
            }
          })
      })
    }
    return Promise.resolve()
  })

  ipcMain.handle(RenderEvent.GetTestResults, (event, logId: string) => {
    return new Promise((resolve) => {
      resolve(LogTestResult.data[logId])
    })
  })

  ipcMain.handle(RenderEvent.GetAllTestResults, (event) => {
    return new Promise((resolve) => {
      resolve(LogTestResult.data)
    })
  })

  ipcMain.handle(RenderEvent.GetProxyLogs, (event) => {
    return new Promise((resolve) => {
      resolve(MemeoryLogStorage.data)
    })
  })

  ipcMain.handle(RenderEvent.ClearTestResult, (event) => {
    return new Promise((resolve) => {
      LogTestResult.clearTestResult()
      resolve({
        status: EventResultStatus.Success
      })
    })
  })

  ipcMain.on(RenderEvent.OpenSignInPage, (_, codeChallenge) => {
    shell.openExternal(`${APP_SITE_URL}/login?source=app`)
  })

  ipcMain.on(RenderEvent.OpenExternal, (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle(RenderEvent.CleanRuleData, (event) => {
    return new Promise((resolve) => {
      const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
      // Only when there is sync info, we clean the rule data
      if (data && data.syncInfo) {
        data.syncInfo = undefined
        data.apiRules = []
        data.updatedAt = 0
        Storage.set(config.RuleDefaultStorageKey, data, (error) => {
          if (error) {
            log.error('[CleanRuleData] Failed to storage rule', error)
            resolve({
              status: EventResultStatus.Error,
              error: error.message
            })
          } else {
            updateRuntimeRules([])
            resolve({
              status: EventResultStatus.Success
            })
          }
        })
      } else {
        resolve({
          status: EventResultStatus.Error,
          error: 'User data not found'
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.InitServerRules, (event, rules: ApiRules, syncInfo: SyncInfo) => {
    return new Promise((resolve) => {
      const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
      if (data) {
        data.apiRules = rules
        data.updatedAt = new Date(syncInfo.syncDate).getTime()
        data.syncInfo = syncInfo
        Storage.set(config.RuleDefaultStorageKey, data, (error) => {
          if (error) {
            log.error('[InitServerRules] Failed to storage rule', error)
            resolve({
              status: EventResultStatus.Error,
              error: error.message
            })
          } else {
            updateRuntimeRules(rules)
            resolve({
              status: EventResultStatus.Success
            })
          }
        })
      } else {
        resolve({
          status: EventResultStatus.Error,
          error: 'User data not found'
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.GetPrintLogs, (event) => {
    return new Promise((resolve) => {
      resolve(PrintStorage.getAll())
    })
  })

  ipcMain.on(RenderEvent.ClearPrintLogs, (event) => {
    PrintStorage.clear()
  })

  ipcMain.handle(RenderEvent.CheckForUpdate, () => {
    return new Promise((resolve) => {
      autoUpdater.checkForUpdatesAndNotify().then((updateInfo) => {
        resolve({
          status: EventResultStatus.Success,
          data: updateInfo
        })
      })
    })
  })

  ipcMain.on(RenderEvent.CopyText, (event, text: string) => {
    clipboard.writeText(text)
  })

  ipcMain.on(RenderEvent.SetSubscription, (event, subscription: Subscription | null) => {
    try {
      SubscriptionStorage.set(subscription)
    } catch (error) {
      log.error('[SetSubscription] Failed to set subscription', error)
    }
  })

  ipcMain.handle(RenderEvent.SaveRules, (event, rules: ApiRules) => {
    return new Promise((resolve) => {
      const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
      if (data) {
        data.apiRules = rules
        data.updatedAt = new Date().getTime()
        Storage.set(config.RuleDefaultStorageKey, data, (error) => {
          if (error) {
            log.error('[SaveRules] Failed to save rules', error)
            resolve({
              status: EventResultStatus.Error,
              error: error.message
            })
          } else {
            updateRuntimeRules(rules)
            resolve({
              status: EventResultStatus.Success
            })
          }
        })
      } else {
        log.error('[SaveRules] User data not found')
        resolve({
          status: EventResultStatus.Error,
          error: 'User data not found'
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.UpdateHttpsDecryptDomains, (event, domains: string[]) => {
    return new Promise((resolve) => {
      updateSettingData(
        {
          httpsDecryptDomains: domains
        },
        () => {
          resolve({
            status: EventResultStatus.Success
          })
        },
        (error) => {
          log.error('[UpdateHttpsDecryptDomains] Failed to update HTTPS decrypt domains', error)
        }
      )
    })
  })

  ipcMain.handle(RenderEvent.UpdateSettings, async (_, params: UpdateSettingsParams) => {
    try {
      if (typeof params.systemWideProxy !== 'undefined') {
        if (params.systemWideProxy) {
          enableSystemProxy(DefaultSettingData.port)
        } else {
          disableSystemProxy()
        }
      }
      updateSettingData(params)
      return {
        status: EventResultStatus.Success
      }
    } catch (error: any) {
      log.error('[Settings] Failed to update settings:', error)
      return {
        status: EventResultStatus.Error,
        error: error?.message || 'Failed to update settings'
      }
    }
  })

  ipcMain.handle(RenderEvent.GetAvailableBrowsers, async () => {
    return getAvailableBrowsers()
  })

  ipcMain.handle(RenderEvent.LaunchBrowser, async (_, browserType: string) => {
    return startBrowser(browserType, DefaultSettingData.port)
  })

  ipcMain.handle(RenderEvent.OpenLogFile, () => {
    return new Promise((resolve) => {
      try {
        const logFile = log.transports.file.getFile()
        shell.openPath(logFile.path)
        resolve({
          status: EventResultStatus.Success
        })
      } catch (error) {
        log.error('[OpenLogFile] Failed to open log file:', error)
        resolve({
          status: EventResultStatus.Error,
          error: 'Failed to open log file'
        })
      }
    })
  })

  // Register IPC handlers
  ipcMain.handle(RenderEvent.LaunchTerminal, () => {
    return launchTerminal(config.port)
  })

  // const dataPath = Storage.getDataPath()
  // log.debug('datapath =>> ', dataPath)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // installExtension(REDUX_DEVTOOLS).catch((err) => {
  //   log.debug('Added Extension Error: ', err)
  // })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Add cleanup when app quits
app.on('will-quit', () => {
  if (DefaultSettingData.systemWideProxy) {
    try {
      disableSystemProxy()
    } catch (error) {
      log.error('[Quit] Failed to disable system proxy:', error)
    }
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
