import { useSettingStore } from '@renderer/store/setting'
import './header.less'

import { Badge, Typography } from 'antd'
import { useEffect, useState } from 'react'

const { Text } = Typography

function Header(): JSX.Element {
  const port = useSettingStore((state) => state.port)
  const [ip, setIp] = useState<string>('')
  useEffect(() => {
    window.api.getIp().then((ip) => {
      setIp(ip)
    })
  }, [])

  return (
    <div className="app-header">
      <Text>My Workspace</Text>
      <div className="ip-item">
        <Badge status="success" style={{ marginRight: 4 }} />
        <Text
          copyable={{
            text: ip + ':' + port,
            tooltips: ['Copy server address', 'Copied!']
          }}
        >
          Proxy server listening on:{ip + ':' + port}
        </Text>
      </div>
      <div className="profile"></div>
    </div>
  )
}

export default Header
