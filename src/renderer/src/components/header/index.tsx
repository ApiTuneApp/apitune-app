import './header.less'

import { Avatar, Badge, Button, Typography } from 'antd'
import { useEffect, useState } from 'react'

import { strings } from '@renderer/services/localization'
import { useSettingStore } from '@renderer/store/setting'
import { getUser } from '@renderer/services/auth'
import { User } from '@shared/contract'

const { Text } = Typography

function Header(): JSX.Element {
  const port = useSettingStore((state) => state.port)
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [ip, setIp] = useState<string>('')
  const [user, setUser] = useState<User>()
  useEffect(() => {
    window.api.getIp().then((ip) => {
      setIp(ip)
    })
  }, [])

  useEffect(() => {
    getUser().then((user) => {
      setLoggedIn(user !== null)
      if (user) {
        setUser(user as unknown as User)
      }
    })
  }, [])

  const handleSignIn = async () => {
    window.api.openSignInPage()
  }

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
        <div className="profile">
          <Avatar src={user!.avatar} />
          <Text>{user!.name}</Text>
        </div>
      )}
      {/* <div className="profile"></div> */}
    </div>
  )
}

export default Header
