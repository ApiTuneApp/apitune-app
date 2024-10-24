import './header.less'

import { Avatar, Badge, Button, Dropdown, Popover, QRCode, Typography } from 'antd'
import { useEffect, useState } from 'react'

import { CheckCircleTwoTone, LoadingOutlined, QrcodeOutlined } from '@ant-design/icons'
import * as authService from '@renderer/services/auth'
import * as dbService from '@renderer/services/db'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { useSettingStore } from '@renderer/store/setting'
import { ApiRules, EventResultStatus, MainEvent, SyncInfo, User } from '@shared/contract'

const { Text } = Typography

function Header(): JSX.Element {
  const apiRules = useRuleStore((state) => state.apiRules)
  const initSyncInfo = useRuleStore.getState().initSyncInfo
  const initApiRules = useRuleStore.getState().initApiRules

  const port = useSettingStore((state) => state.port)
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [ip, setIp] = useState<string>('')
  const [syncingStatus, setSyncingStatus] = useState<boolean>(false)
  const [user, setUser] = useState<User>({
    id: '',
    email: '',
    name: '',
    avatar: ''
  })

  // only run in the first time when the user sign in
  async function _initSyncRule() {
    // in init sync rule, we compare the updatedAt of the rule in the local storage and the rule in the server
    // if the local rule is newer, we popup a dialog to ask the user if they want to sync the rule to the server
    const userRules = await dbService.getUserRules()
    const localData = await window.api.getRuleStorage()
    const userRuleUpdatedAt = new Date(userRules.updated_at as string)
    const localDataUpdatedAt = localData.syncInfo?.syncDate
      ? new Date(localData.syncInfo.syncDate as string)
      : new Date(0) // Fallback to epoch if invalid
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
      console.log('syncing rules', rules)
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
        setUser({
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata.name ?? '',
          avatar: user.user_metadata.avatar_url ?? ''
        })
        console.log('apiRules', apiRules)
        _initSyncRule()
      }
    })
  }, [])

  useEffect(() => {
    // Used to sync local rule to server when local rule changes
    if (apiRules && loggedIn) {
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
            setUser({
              id: user.id,
              email: user.email ?? '',
              name: user.user_metadata.name ?? '',
              avatar: user.user_metadata.avatar_url ?? ''
            })
            _initSyncRule()
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
        setLoggedIn(false)
        _cleanApiRules()
      }
    }
  ]

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
      </div>
      {!loggedIn ? (
        <Button type="primary" onClick={handleSignIn}>
          {strings.signIn}
        </Button>
      ) : (
        <Dropdown menu={{ items: profileMenu }}>
          <Avatar src={user.avatar} style={{ cursor: 'pointer' }} />
        </Dropdown>
      )}
    </div>
  )
}

export default Header
