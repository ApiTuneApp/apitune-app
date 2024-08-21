import './header.less'

import { Badge, Button, Typography } from 'antd'
import { useEffect, useState } from 'react'

import { strings } from '@renderer/services/localization'
import { useSettingStore } from '@renderer/store/setting'

const { Text } = Typography

function Header(): JSX.Element {
  const port = useSettingStore((state) => state.port)
  const [ip, setIp] = useState<string>('')
  useEffect(() => {
    window.api.getIp().then((ip) => {
      setIp(ip)
    })
  }, [])

  const handleSignIn = () => {
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
      <Button type="primary" onClick={handleSignIn}>
        {strings.signIn}
      </Button>
      {/* <div className="profile"></div> */}
    </div>
  )
}

export default Header
