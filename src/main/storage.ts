import Storage from 'electron-json-storage'
import log from 'electron-log/main'
import packageJson from '../../package.json'
import {
  ApiRules,
  RuleStorage,
  SettingStorage,
  LogTestResultMap,
  TestItem,
  Log,
  PrintItem,
  Subscription
} from '../shared/contract'
import config from './server/config'
import { checkSubscriptionActive } from '../shared/utils'

export let DefaultRuleData: RuleStorage = {
  version: packageJson.version,
  apiRules: [],
  updatedAt: 0
}

export function initRuntimeRules() {
  try {
    // TODO: get storage key
    let defaultData = Storage.getSync(config.RuleDefaultStorageKey)
    if (!defaultData || !defaultData.version) {
      // if there is no version string, we treat that something is wrong in config, so we set it to default value
      defaultData = DefaultRuleData
      Storage.set(config.RuleDefaultStorageKey, defaultData, (error) => {
        if (error) log.error('[initRuntimeRules] Storage error', error)
      })
    }
    DefaultRuleData = {
      ...DefaultRuleData,
      apiRules: defaultData.apiRules || []
    }
  } catch (error) {
    log.error('[initRuntimeRules] Failed', error)
  }
}

export function updateRuntimeRules(apiRules: ApiRules) {
  DefaultRuleData.apiRules = apiRules
}

export let DefaultSettingData: SettingStorage = {
  version: packageJson.version,
  port: config.port,
  theme: 'system',
  language: 'en',
  autoHandleCORS: false,
  corsConfig: ''
}

export function initSettingData() {
  try {
    let defaultData = Storage.getSync(config.SettingDefaultStorageKey)
    if (!defaultData || !defaultData.version) {
      defaultData = DefaultSettingData
      Storage.set(config.SettingDefaultStorageKey, defaultData, (error) => {
        if (error) log.error('[initSettingData] Storage error', error)
      })
    }
    DefaultSettingData = {
      ...DefaultSettingData,
      ...defaultData
    }
  } catch (error) {
    log.error('[initSettingData] Failed', error)
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
      log.error('[updateSettingData] Storage error', error)
      onError && onError(error)
    } else {
      onSuccess && onSuccess()
    }
  })
}

export const LogTestResult = {
  data: {} as LogTestResultMap,
  updateTestResult(logId: string, result: TestItem) {
    this.data[logId] = result
  },
  clearTestResult() {
    this.data = {}
  }
}

export const MemeoryLogStorage = {
  data: [] as Log[],
  add(log: Log) {
    this.data.push(log)
  },
  clear() {
    this.data = []
  },
  get(id: number) {
    return this.data.find((log) => log.id === id)
  }
}

export const PrintStorage = {
  data: [] as PrintItem[],
  add(printItem: PrintItem) {
    this.data.push(printItem)
  },
  clear() {
    this.data = []
  },
  getAll() {
    return this.data
  }
}

export const SubscriptionStorage = {
  data: {} as Subscription | null,
  checkActive() {
    return checkSubscriptionActive(this.data)
  },
  set(subscription: Subscription | null) {
    this.data = subscription
  }
}
