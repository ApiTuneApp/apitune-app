import './header.less'

import { Avatar, Badge, Button, Dropdown, Modal, Popover, QRCode, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'

import {
  CheckCircleTwoTone,
  ExclamationCircleFilled,
  LoadingOutlined,
  QrcodeOutlined
} from '@ant-design/icons'
import { getApiRules } from '@renderer/services'
import * as authService from '@renderer/services/auth'
import * as dbService from '@renderer/services/db'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { useSettingStore } from '@renderer/store/setting'
import { EventResultStatus, MainEvent, SyncInfo, User } from '@shared/contract'

const { Text } = Typography
const { confirm } = Modal

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
  const syncConfirmShowed = useRef(false)

  // only run in the first time when the user sign in
  async function _initSyncRule() {
    // in init sync rule, we compare the updatedAt of the rule in the local storage and the rule in the server
    // if the local rule is newer, we popup a dialog to ask the user if they want to sync the rule to the server
    const userRules = await dbService.getUserRules()
    const localData = await window.api.getRuleStorage()
    const userRuleUpdatedAt = new Date(userRules.updated_at as string)
    if (userRuleUpdatedAt.getTime() >= localData.updatedAt) {
      // if the local rule is older, we do sync immediately
      _syncServerRules()
    } else {
      if (!syncConfirmShowed.current) {
        confirm({
          title: strings.syncedDiffDetected,
          icon: <ExclamationCircleFilled />,
          content: strings.syncedDiffDesc,
          okText: strings.syncUseServer,
          cancelText: strings.syncUseLocal,
          onOk() {
            _syncServerRules()
          },
          onCancel() {
            _syncLocalRules()
          }
        })
        syncConfirmShowed.current = true
      }
    }
  }

  function _syncServerRules() {
    setSyncingStatus(true)
    dbService.getUserRules().then((rules) => {
      console.log('syncing server rules', rules)
      const syncInfo = {
        userId: user.id,
        syncDate: new Date(rules.updated_at as string).getTime(),
        syncStatus: 'synced'
      } as SyncInfo
      window.api.initServerRules(rules.rule_data, syncInfo).then((res) => {
        if (res.status === EventResultStatus.Success) {
          setSyncingStatus(false)
          getApiRules()
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
        _syncLocalRules()
      }
    })
  }, [])
  useEffect(() => {
    if (ruleInited && loggedIn) {
      console.log('apiRules ruleInited updated', apiRules)
      _syncLocalRules()
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
      <Text>{strings.myWorkspace}</Text>
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
