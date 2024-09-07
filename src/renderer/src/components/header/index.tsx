import './header.less'

import { Avatar, Badge, Button, Dropdown, Typography } from 'antd'
import { useEffect, useState } from 'react'

import * as authService from '@renderer/services/auth'
import * as dbService from '@renderer/services/db'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { useSettingStore } from '@renderer/store/setting'
import { EventResultStatus, MainEvent, SyncInfo, User } from '@shared/contract'
import { CheckCircleTwoTone, LoadingOutlined } from '@ant-design/icons'
import { getApiRules } from '@renderer/services'

const { Text } = Typography

function Header(): JSX.Element {
  const apiRules = useRuleStore((state) => state.apiRules)
  const ruleInited = useRuleStore((state) => state.ruleInited)
  const initSyncInfo = useRuleStore.getState().initSyncInfo

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

  function _syncRule() {
    setSyncingStatus(true)
    window.api.getApiRules().then((rules) => {
      console.log('syncing rules', rules)
      dbService
        .syncRuleData(rules)
        .then((res) => {
          console.log('Synced:', res)
          const syncInfo = {
            userId: user.id,
            syncDate: Date.now(),
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
            getApiRules()
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
        _syncRule()
      }
    })
  }, [])
  useEffect(() => {
    if (ruleInited && loggedIn) {
      console.log('apiRules ruleInited updated', apiRules)
      _syncRule()
    }
  }, [apiRules, loggedIn, ruleInited])

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
            _syncRule()
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
      <Text>{strings.myWorkspace}</Text>
      <div className="ip-item">
        <Badge status="success" style={{ marginRight: 4 }} />
        <Text
          copyable={{
            text: ip + ':' + port,
            tooltips: ['Copy server address', 'Copied!']
          }}
        >
          {strings.proxyServerListeningOn}:{ip + ':' + port}
        </Text>
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
