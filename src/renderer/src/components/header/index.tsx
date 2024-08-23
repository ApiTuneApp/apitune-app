import './header.less'

import { Avatar, Badge, Button, Dropdown, Typography } from 'antd'
import { useEffect, useState } from 'react'

import { strings } from '@renderer/services/localization'
import { useSettingStore } from '@renderer/store/setting'
import * as authService from '@renderer/services/auth'
import { MainEvent, User } from '@shared/contract'

const { Text } = Typography

function Header(): JSX.Element {
  const port = useSettingStore((state) => state.port)
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [ip, setIp] = useState<string>('')
  const [user, setUser] = useState<User>({
    id: '',
    email: '',
    name: '',
    avatar: ''
  })
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
      }
    })
  }, [])

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
      label: 'Sign Out',
      key: 'sign-out',
      onClick: () => {
        authService.signOut()
        setLoggedIn(false)
      }
    }
  ]

  return (
    <div className="app-header">
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
