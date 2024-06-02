import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { nativeTheme } from 'electron/main'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import Storage from 'electron-json-storage'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

import { electronApp, is, optimizer } from '@electron-toolkit/utils'

import icon from '../../resources/icon.png?asset'
import {
  AddGroupOpts,
  EventResultStatus,
  RenderEvent,
  RuleData,
  RuleGroup,
  RuleStorage,
  Theme
} from '../shared/contract'
import { findGroupOrRule } from '../shared/utils'
import { initCommunicator } from './communicator'
import config from './server/config'
import { changeServerPort, initServer } from './server/init'
import {
  DefaultRuleData,
  DefaultSettingData,
  initRuntimeRules,
  initSettingData,
  updateRuntimeRules,
  updateSettingData
} from './storage'

initSettingData()

// TODO: handle default port is in use
initServer(DefaultSettingData.port)

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
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
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
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
      } catch (error) {
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
              Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                if (error) {
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
        reject({
          status: EventResultStatus.Error,
          error: error
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
              Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                if (error) {
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
              Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                if (error) {
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
              Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                if (error) {
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
                Storage.set(config.RuleDefaultStorageKey, data, (error) => {
                  if (error) {
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
                  error: 'Group not found'
                })
              }
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
        reject({
          status: EventResultStatus.Error,
          error: error
        })
      }
    })
  })

  ipcMain.handle(RenderEvent.GetApiRules, (event) => {
    return new Promise((resolve, reject) => {
      try {
        const data = Storage.getSync(config.RuleDefaultStorageKey) as RuleStorage
        if (data) {
          resolve(data.apiRules || [])
        } else {
          resolve([])
        }
      } catch (error) {
        reject(error)
      }
    })
  })

  ipcMain.handle(RenderEvent.GetSettings, (event) => {
    return new Promise((resolve, reject) => {
      try {
        const data = Storage.getSync(config.SettingDefaultStorageKey)
        if (data) {
          resolve(data)
        } else {
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

  const dataPath = Storage.getDataPath()
  console.log('datapath =>> ', dataPath)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => {
      console.log(`Added Extension:  ${name}`)
    })
    .catch((err) => {
      console.log('An error occurred: ', err)
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
