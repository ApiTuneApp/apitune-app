import Storage from 'electron-json-storage'
import packageJson from '../../package.json'
import { ApiRules, RuleStorage, SettingStorage } from '../shared/contract'
import config from './server/config'

export let DefaultRuleData: RuleStorage = {
  version: packageJson.version,
  apiRules: []
}

export function initRuntimeRules() {
  try {
    // TODO: get storage key
    let defaultData = Storage.getSync(config.RuleDefaultStorageKey)
    if (!defaultData || !defaultData.version) {
      // if there is no version string, we treat that something is wrong in config, so we set it to default value
      defaultData = DefaultRuleData
      Storage.set(config.RuleDefaultStorageKey, defaultData, (error) => {
        if (error) console.error('initRuntimeRules error', error)
      })
    }
    DefaultRuleData = {
      ...DefaultRuleData,
      apiRules: defaultData.apiRules || []
    }
  } catch (error) {
    console.error('initRuntimeRules error', error)
  }
}

export function updateRuntimeRules(apiRules: ApiRules) {
  DefaultRuleData.apiRules = apiRules
}

export let DefaultSettingData: SettingStorage = {
  version: packageJson.version,
  port: config.port,
  theme: 'system'
}

export function initSettingData() {
  try {
    let defaultData = Storage.getSync(config.SettingDefaultStorageKey)
    if (!defaultData || !defaultData.version) {
      defaultData = DefaultSettingData
      Storage.set(config.SettingDefaultStorageKey, defaultData, (error) => {
        if (error) console.error('initSettingData error', error)
      })
    }
    DefaultSettingData = {
      ...DefaultSettingData,
      ...defaultData
    }
  } catch (error) {
    console.error('initSettingData error', error)
  }
}

export function updateSettingData(
  setting: Partial<SettingStorage>,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  DefaultSettingData = {
    ...DefaultSettingData,
    ...setting
  }

  Storage.set(config.SettingDefaultStorageKey, DefaultSettingData, (error) => {
    if (error) {
      onError && onError(error)
    } else {
      onSuccess && onSuccess()
    }
  })
}
