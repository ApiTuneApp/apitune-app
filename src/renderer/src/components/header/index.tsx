import './header.less'

import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  message,
  Popover,
  QRCode,
  Tooltip,
  Typography
} from 'antd'
import { useEffect, useState } from 'react'

import {
  CheckCircleTwoTone,
  LoadingOutlined,
  QrcodeOutlined,
  SafetyCertificateTwoTone
} from '@ant-design/icons'
import * as authService from '@renderer/services/auth'
import * as dbService from '@renderer/services/db'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { useSettingStore } from '@renderer/store/setting'
import { useUserStore } from '@renderer/store/user'
import {
  ApiRules,
  EventResultStatus,
  MainEvent,
  RenderEvent,
  Subscription,
  SyncInfo,
  User
} from '@shared/contract'
import { getAvatarUrl } from '@shared/utils'

const { Text } = Typography

function Header(): JSX.Element {
  const apiRules = useRuleStore((state) => state.apiRules)
  const initSyncInfo = useRuleStore.getState().initSyncInfo
  const initApiRules = useRuleStore.getState().initApiRules
  const clearRedoUnDo = useRuleStore.getState().clearRedoUnDo
  const { user, setUser, setSubscription } = useUserStore.getState()
  const [caTrust, setCaTrust] = useState(false)

  const port = useSettingStore((state) => state.port)
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [ip, setIp] = useState<string>('')
  const [syncingStatus, setSyncingStatus] = useState<boolean>(false)

  useEffect(() => {
    window.api.ca('status').then((res) => {
      if (res.status === EventResultStatus.Success) {
        setCaTrust(res.data.isCertificateInstalled)
      }
    })
    return () => {
      window.api.clearupEvent(RenderEvent.CA)
    }
  }, [])

  // only run in the first time when the user sign in
  async function _initSyncRule(user: User) {
    // in init sync rule, we compare the updatedAt of the rule in the local storage and the rule in the server
    // if the local rule is newer, we popup a dialog to ask the user if they want to sync the rule to the server
    const localData = await window.api.getRuleStorage()
    if (user && user.id !== localData.syncInfo?.userId) {
      // if signed in with a different user, we need to sync the rule from the server
      _syncServerRules()
      return
    }
    const userRules = await dbService.getUserRules()
    const userRuleUpdatedAt = new Date(userRules.updated_at as string)
    const localDataUpdatedAt = localData.updatedAt ? new Date(localData.updatedAt) : new Date(0) // Fallback to epoch if invalid
    if (userRuleUpdatedAt.getTime() >= localDataUpdatedAt.getTime()) {
      // if the local rule is older, we do sync immediately
      _syncServerRules()
    } else {
      _syncLocalRules()
    }
  }

  function _syncServerRules() {
    setSyncingStatus(true)
    dbService.getUserRules().then((rules) => {
      console.log('syncing server rules', rules)
      const syncInfo = {
        userId: user.id,
        syncDate: rules.updated_at,
        syncStatus: 'synced'
      } as SyncInfo
      window.api.initServerRules(rules.rule_data, syncInfo).then((res) => {
        if (res.status === EventResultStatus.Success) {
          setSyncingStatus(false)
          initSyncInfo(syncInfo)
          initApiRules(rules.rule_data as unknown as ApiRules)
        } else {
          console.log('init server rules error', res.error)
          setSyncingStatus(false)
        }
      })
    })
  }

  function _syncLocalRules() {
    setSyncingStatus(true)
    window.api.getApiRules().then((rules) => {
      dbService
        .syncRuleData(rules)
        .then((res) => {
          console.log('Synced:', res)
          const syncInfo = {
            userId: user.id,
            syncDate: res.updated_at,
            syncStatus: 'synced'
          } as SyncInfo
          window.api.setSyncInfo(syncInfo)
          initSyncInfo(syncInfo)
          setSyncingStatus(false)
        })
        .catch((err) => {
          console.log('sync error', err)
          setSyncingStatus(false)
        })
    })
  }

  function _cleanApiRules() {
    window.api.getRuleStorage().then((ruleStorage) => {
      if (ruleStorage.syncInfo?.syncStatus === 'synced') {
        // if there is sync info, it means the rule is synced by a auth user,
        // so we need to clean the rule data after sign out
        window.api.cleanRuleData().then((res) => {
          if (res.status === EventResultStatus.Success) {
            initApiRules([])
          } else {
            console.log('clean rule data error', res.error)
          }
        })
      }
    })
  }

  useEffect(() => {
    window.api.getIp().then((ip) => {
      setIp(ip)
    })
  }, [])

  useEffect(() => {
    authService.getUser().then((user) => {
      setLoggedIn(!!user)
      if (user) {
        console.log('User:', user)
        const userInfo = {
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata.name ?? '',
          avatar: user.user_metadata.avatar_url ?? ''
        } as User
        setUser(userInfo)
        _initSyncRule(userInfo)
        dbService.getSubscription(userInfo).then((subscription) => {
          console.log('subscription', subscription)
          setSubscription(subscription as Subscription)
          window.api.setSubscription(subscription as Subscription)
        })
      }
    })
  }, [])

  useEffect(() => {
    // Used to sync local rule to server when local rule changes
    if (apiRules && loggedIn && !syncingStatus) {
      console.log('apiRules updated', apiRules)
      _syncLocalRules()
    }
  }, [apiRules, loggedIn])

  useEffect(() => {
    const handleAuth = async (accessToken: string, refreshToken: string) => {
      if (accessToken && refreshToken) {
        try {
          const { user } = await authService.setAuth(accessToken, refreshToken)
          console.log('User:', user)
          setLoggedIn(!!user)
          if (user) {
            const userInfo = {
              id: user.id,
              email: user.email ?? '',
              name: user.user_metadata.name ?? '',
              avatar: user.user_metadata.avatar_url ?? ''
            } as User
            setUser(userInfo)
            _initSyncRule(userInfo)
            dbService.getSubscription(userInfo).then((subscription) => {
              console.log('subscription', subscription)
              setSubscription(subscription as Subscription)
              window.api.setSubscription(subscription as Subscription)
            })
          }
        } catch (error) {
          console.log('Error auth:', error)
        }
      }
    }

    window.api.onAuthCode(handleAuth)

    return () => {
      window.api.clearupEvent(MainEvent.GetAuthCode)
    }
  }, [])

  const handleSignIn = async () => {
    window.api.openSignInPage()
  }

  const profileMenu = [
    {
      label: user?.name ?? '',
      key: 'profile',
      disabled: true
    },
    {
      label: syncingStatus ? strings.syncing : strings.synced,
      icon: syncingStatus ? <LoadingOutlined /> : <CheckCircleTwoTone twoToneColor="#52c41a" />,
      key: 'sync'
    },
    {
      label: 'Sign Out',
      key: 'sign-out',
      onClick: () => {
        authService.signOut()
        setUser({} as User)
        setLoggedIn(false)
        _cleanApiRules()
        clearRedoUnDo()
      }
    }
  ]

  function trustCa() {
    if (caTrust) {
      return
    }
    window.api.ca('trust').then((res) => {
      if (res.status === EventResultStatus.Success) {
        setCaTrust(true)
        message.success('ApiTune CA Certificate trusted')
      }
    })
  }

  return (
    <div className="app-header">
      <span style={{ display: 'none' }}>{apiRules.length}</span>
      {/* <Text>{strings.myWorkspace}</Text> */}
      <div></div>
      <div className="ip-item">
        <Badge status="success" style={{ marginRight: 4 }} />
        <Text
          copyable={{
            text: ip + ':' + port,
            tooltips: [strings.copyServerAddress, strings.copied]
          }}
        >
          {strings.proxyServerListeningOn}:{ip + ':' + port}
        </Text>
        <Popover
          placement="bottom"
          title={strings.scanQrCode}
          content={
            <div>
              <Text
                copyable={{
                  text: 'http://cert.apitune.io',
                  tooltips: [strings.copyCertDownloadUrl, strings.copied]
                }}
              >
                {'http://cert.apitune.io'}
              </Text>
              <QRCode value={'http://cert.apitune.io'} />
            </div>
          }
        >
          <QrcodeOutlined style={{ marginLeft: 8, cursor: 'pointer', color: '#1677ff' }} />
        </Popover>
        <Tooltip
          title={caTrust ? strings.caInstalled : strings.caNotTrust + ', ' + strings.clickToTrust}
        >
          <SafetyCertificateTwoTone
            twoToneColor={caTrust ? '#52c41a' : '#ff4d4f'}
            style={{ marginLeft: 8, cursor: 'pointer' }}
            onClick={() => trustCa()}
          />
        </Tooltip>
      </div>
      {!loggedIn ? (
        <Tooltip title={strings.signInTooltip} placement="bottom">
          <Button type="primary" onClick={handleSignIn}>
            {strings.signIn}
          </Button>
        </Tooltip>
      ) : (
        <Dropdown menu={{ items: profileMenu }}>
          <Avatar src={getAvatarUrl(user)} style={{ cursor: 'pointer' }}>
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
        </Dropdown>
      )}
    </div>
  )
}

export default Header
