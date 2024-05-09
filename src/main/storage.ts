import Storage from 'electron-json-storage'
import packageJson from '../../package.json'
import { ApiRules, StorageData } from '../shared/contract'

export let DefaultUserData: StorageData = {
  version: packageJson.version,
  settings: {},
  apiRules: []
}

export function initRuntimeRules() {
  try {
    // TODO: get storage key
    let defaultData = Storage.getSync('user.default')
    if (!defaultData || !defaultData.version) {
      // if there is no version string, we treat that something is wrong in config, so we set it to default value
      defaultData = DefaultUserData
      Storage.set('user.default', defaultData, (error) => {
        if (error) console.error('SaveRules error', error)
      })
    }
    DefaultUserData = {
      ...DefaultUserData,
      settings: defaultData.settings || {},
      apiRules: defaultData.apiRules || []
    }
  } catch (error) {
    console.error('initRuntimeRules error', error)
  }
}

export function updateRuntimeRules(apiRules: ApiRules) {
  DefaultUserData.apiRules = apiRules
}
